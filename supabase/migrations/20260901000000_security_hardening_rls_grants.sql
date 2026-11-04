-- =============================================================================
-- SECURITY HARDENING — RLS policies, table GRANTs and function EXECUTE grants
-- Date: 2026-09-01            Idempotent: safe to run more than once.
--
-- Fixes confirmed by black-box audit (scripts/rls_audit.py) against the live DB:
--   [CRITICAL] anon/any user could EXECUTE credit_user_tokens  -> mint tokens
--   [CRITICAL] anon/any user could EXECUTE debit_user_tokens   -> drain anyone
--   [CRITICAL] users could UPDATE their own profiles.token_balance
--   [CRITICAL] users could INSERT/UPDATE user_platform_subscriptions to any paid plan
--   [HIGH]     anon could EXECUTE decrypt_secret / encrypt_secret / process_token_gift
--              / decrement_product_inventory / calculate_user_engagement_score
--   [HIGH]     anon could SELECT every row of post_unlocks (payment ids, user ids)
--   [HYGIENE]  TRUNCATE/TRIGGER/REFERENCES granted to anon/authenticated on all tables;
--              admin/secret tables granted to anon; RLS not guaranteed on every table.
--
-- Server code (FastAPI / Vercel /api / Edge Functions) uses the service_role key
-- and is NOT affected. Super-admin screens keep working (checked via is_super_admin).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Helper: is the current statement coming from an end-user (browser) role?
--    Inside SECURITY DEFINER functions current_user is the owner (postgres),
--    so internal server-side logic (transfer_tokens, triggers, …) is trusted.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_untrusted_client()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT current_user IN ('anon', 'authenticated')
     AND NOT COALESCE(public.is_super_admin(auth.uid()), false);
$$;
REVOKE ALL ON FUNCTION public.is_untrusted_client() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_untrusted_client() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 1. Ensure RLS is ENABLED on every table in the public schema.
--    Tables that had RLS off AND no policies get an owner READ-only policy when
--    they have a user_id column (writes become server-only — an owner-write
--    policy would let a user grant themselves rows in e.g. user_roles);
--    otherwise they become fully server-only (service_role).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t record;
  has_user_id boolean;
  n_policies int;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
    SELECT count(*) INTO n_policies FROM pg_policies WHERE schemaname = 'public' AND tablename = t.relname;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t.relname AND column_name = 'user_id'
    ) INTO has_user_id;
    IF n_policies = 0 AND has_user_id THEN
      EXECUTE format(
        'CREATE POLICY "Owner read access (auto)" ON public.%I FOR SELECT TO authenticated '
        'USING (auth.uid() = user_id)', t.relname);
    END IF;
    RAISE NOTICE 'RLS enabled on public.% (policies before: %, owner policy added: %)',
      t.relname, n_policies, (n_policies = 0 AND has_user_id);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Table GRANT hygiene.
--    TRUNCATE bypasses RLS and is never needed by the browser.
-- ---------------------------------------------------------------------------
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Admin / secret / internal-log / payment-ledger tables: anonymous visitors must
-- never touch them, regardless of what their RLS policies say (defence in depth).
-- `authenticated` keeps its grant (super-admin screens read these, gated by RLS).
-- Tables that public-facing policies may sub-query (user_roles, post_unlocks,
-- orders, subscriptions, …) are intentionally NOT in this list.
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'platform_integration_secrets', 'integration_auth', 'integration_logs',
    'payment_settings', 'webhook_logs', 'settlement_logs', 'sensitive_data_access_log',
    'admin_audit_logs', 'payment_failure_logs', 'refund_overrides', 'token_events',
    'token_purchases', 'custom_token_purchases', 'platform_plan_transactions',
    'daily_token_usage'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', tbl);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. post_unlocks — remove the "auth.uid() IS NULL" leak.
--    Buyers see their own unlocks; creators see unlocks of their own posts
--    (earnings page); super admins see all. INSERT policy is unchanged.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  p record;
BEGIN
  IF to_regclass('public.post_unlocks') IS NULL THEN RETURN; END IF;
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_unlocks' AND cmd IN ('SELECT', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.post_unlocks', p.policyname);
  END LOOP;

  CREATE POLICY "Buyers view their own unlocks" ON public.post_unlocks
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Creators view unlocks of their posts" ON public.post_unlocks
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_unlocks.post_id AND p.user_id = auth.uid()));

  CREATE POLICY "Super admins view all unlocks" ON public.post_unlocks
    FOR SELECT TO authenticated
    USING (public.is_super_admin(auth.uid()));
END $$;

-- ---------------------------------------------------------------------------
-- 4. profiles — browser can no longer change token_balance / monthly_token_quota.
--    (Column-level protection via trigger, so normal profile edits keep working.)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_token_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_default_balance bigint;
  v_default_quota bigint;
BEGIN
  IF NOT public.is_untrusted_client() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- A user creating their own profile row always starts at the column defaults.
    EXECUTE 'SELECT ' || COALESCE((
      SELECT pg_get_expr(d.adbin, d.adrelid) FROM pg_attrdef d
      JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
      WHERE d.adrelid = 'public.profiles'::regclass AND a.attname = 'token_balance'), '0')
      INTO v_default_balance;
    EXECUTE 'SELECT ' || COALESCE((
      SELECT pg_get_expr(d.adbin, d.adrelid) FROM pg_attrdef d
      JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
      WHERE d.adrelid = 'public.profiles'::regclass AND a.attname = 'monthly_token_quota'), '0')
      INTO v_default_quota;
    NEW.token_balance := v_default_balance;
    NEW.monthly_token_quota := v_default_quota;
    RETURN NEW;
  END IF;

  IF NEW.token_balance IS DISTINCT FROM OLD.token_balance
     OR NEW.monthly_token_quota IS DISTINCT FROM OLD.monthly_token_quota THEN
    RAISE EXCEPTION 'token_balance and monthly_token_quota can only be changed by the server'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_profile_token_columns ON public.profiles;
CREATE TRIGGER trg_guard_profile_token_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_token_columns();

-- ---------------------------------------------------------------------------
-- 5. user_platform_subscriptions — browser may only switch itself to the FREE
--    plan (onboarding) or cancel / toggle auto-renew. Paid plans are written by
--    the payment verify endpoints (service_role) or super admins.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_platform_subscription_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_untrusted_client() THEN
    RETURN NEW;
  END IF;

  -- Free plan, nothing paid: allowed (onboarding "choose free plan").
  IF NEW.plan_key = 'free' AND COALESCE(NEW.price_paid, 0) = 0 THEN
    NEW.razorpay_order_id := NULL;
    NEW.razorpay_payment_id := NULL;
    NEW.razorpay_signature := NULL;
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Paid plans can only be activated after server-side payment verification'
      USING ERRCODE = '42501';
  END IF;

  -- UPDATE on a paid plan: nothing that grants value may change; the user may
  -- only cancel or toggle auto-renew.
  IF NEW.plan_key IS DISTINCT FROM OLD.plan_key
     OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.billing_cycle_months IS DISTINCT FROM OLD.billing_cycle_months
     OR NEW.price_paid IS DISTINCT FROM OLD.price_paid
     OR NEW.razorpay_order_id IS DISTINCT FROM OLD.razorpay_order_id
     OR NEW.razorpay_payment_id IS DISTINCT FROM OLD.razorpay_payment_id
     OR NEW.razorpay_signature IS DISTINCT FROM OLD.razorpay_signature
     OR NEW.razorpay_subscription_id IS DISTINCT FROM OLD.razorpay_subscription_id
     OR (NEW.status IS DISTINCT FROM OLD.status AND NEW.status NOT IN ('cancelled', 'canceled'))
  THEN
    RAISE EXCEPTION 'Plan changes require server-side payment verification'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

DO $$
BEGIN
  IF to_regclass('public.user_platform_subscriptions') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_guard_platform_subscription_writes ON public.user_platform_subscriptions;
    CREATE TRIGGER trg_guard_platform_subscription_writes
      BEFORE INSERT OR UPDATE ON public.user_platform_subscriptions
      FOR EACH ROW EXECUTE FUNCTION public.guard_platform_subscription_writes();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6. Function EXECUTE grants.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  f record;
BEGIN
  -- 6a. Server-only functions (called with service_role from Edge Functions /
  --     FastAPI / Vercel). Nobody in the browser may call them.
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      'debit_user_tokens', 'decrypt_secret', 'encrypt_secret', 'process_token_gift',
      'decrement_product_inventory', 'credit_platform_plan_tokens',
      'credit_monthly_plan_tokens', 'calculate_user_engagement_score'
    )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;

  -- 6b. Logged-in only (they already check auth.uid() internally).
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('transfer_tokens', 'log_admin_action')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f.sig);
  END LOOP;
END $$;

-- 6c. credit_user_tokens: the Super Admin screen calls it from the browser, so it
--     stays callable by `authenticated` but through a guard wrapper. The original
--     implementation is moved (unchanged) into the non-exposed `private` schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

DO $$
DECLARE
  r record;
  v_args text;
  v_identity text;
  v_result text;
  v_call text;
  v_body text;
BEGIN
  FOR r IN
    SELECT p.oid, p.proretset, p.proargnames, p.proargmodes
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'credit_user_tokens'
  LOOP
    -- already wrapped on a previous run
    IF COALESCE(obj_description(r.oid, 'pg_proc'), '') = 'guarded-wrapper' THEN
      CONTINUE;
    END IF;
    IF r.proargmodes IS NOT NULL THEN
      RAISE EXCEPTION 'credit_user_tokens has OUT/VARIADIC args; wrap manually';
    END IF;

    v_args     := pg_get_function_arguments(r.oid);
    v_identity := pg_get_function_identity_arguments(r.oid);
    v_result   := pg_get_function_result(r.oid);
    SELECT string_agg(format('%I => %I', a, a), ', ' ORDER BY i)
      INTO v_call
      FROM unnest(r.proargnames) WITH ORDINALITY AS t(a, i);

    EXECUTE format('DROP FUNCTION IF EXISTS private.credit_user_tokens(%s)', v_identity);
    EXECUTE format('ALTER FUNCTION public.credit_user_tokens(%s) SET SCHEMA private', v_identity);

    v_body := CASE WHEN r.proretset
      THEN format('RETURN QUERY SELECT * FROM private.credit_user_tokens(%s);', v_call)
      ELSE format('RETURN private.credit_user_tokens(%s);', v_call) END;

    EXECUTE format($f$
      CREATE FUNCTION public.credit_user_tokens(%s)
      RETURNS %s
      LANGUAGE plpgsql
      SECURITY INVOKER
      SET search_path = public, private
      AS $body$
      BEGIN
        IF public.is_untrusted_client() THEN
          RAISE EXCEPTION 'permission denied: only the server or a super admin can credit tokens'
            USING ERRCODE = '42501';
        END IF;
        %s
      END
      $body$;$f$, v_args, v_result, v_body);

    EXECUTE format('COMMENT ON FUNCTION public.credit_user_tokens(%s) IS %L', v_identity, 'guarded-wrapper');
    EXECUTE format('REVOKE ALL ON FUNCTION private.credit_user_tokens(%s) FROM PUBLIC, anon', v_identity);
    EXECUTE format('GRANT EXECUTE ON FUNCTION private.credit_user_tokens(%s) TO authenticated, service_role', v_identity);
    EXECUTE format('REVOKE ALL ON FUNCTION public.credit_user_tokens(%s) FROM PUBLIC, anon', v_identity);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.credit_user_tokens(%s) TO authenticated, service_role', v_identity);
    RAISE NOTICE 'credit_user_tokens(%) wrapped with super-admin/server guard', v_identity;
  END LOOP;
END $$;

-- Ask PostgREST to pick up the new function signatures / grants.
NOTIFY pgrst, 'reload schema';

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Self-healing monthly token drip trigger.
 *
 * The DB function `credit_monthly_plan_tokens()` (installed by migration
 * 20260301000000_avatartalk_fixes.sql) credits the monthly token allotment
 * for every active multi-month subscription whose `next_monthly_credit_at`
 * is due. It is normally run by pg_cron, but if cron isn't scheduled this
 * hook makes a best-effort lazy call to the `monthly-token-credit` Edge
 * Function whenever an authenticated user lands on the dashboard.
 *
 * The call is debounced via localStorage (max once per hour per browser)
 * so it never causes a perceptible delay or stampedes the function.
 */
const LAST_RUN_KEY = 'monthly_token_drip_last_run';
const RUN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export const useMonthlyTokenDrip = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const last = Number(localStorage.getItem(LAST_RUN_KEY) || 0);
    if (Date.now() - last < RUN_INTERVAL_MS) return;

    // Fire-and-forget — the edge function is idempotent (DB function only
    // credits subscriptions whose next_monthly_credit_at <= now()).
    (async () => {
      try {
        localStorage.setItem(LAST_RUN_KEY, String(Date.now()));
        const { error } = await supabase.functions.invoke('monthly-token-credit', {
          body: {},
        });
        if (error) {
          // Silent — non-critical, cron will catch up later
          console.debug('[token-drip] non-fatal:', error.message);
        }
      } catch (err) {
        console.debug('[token-drip] skipped:', err);
      }
    })();
  }, [enabled]);
};

export default useMonthlyTokenDrip;

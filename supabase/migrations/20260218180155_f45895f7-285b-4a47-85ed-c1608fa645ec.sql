
-- ============================================================
-- 1. Enable pgcrypto extension for encryption
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. Create encryption/decryption helper functions
--    Uses AES-256 symmetric encryption with a server-side key
--    derived from the service role key (only accessible server-side)
-- ============================================================

-- Encrypt a text value
CREATE OR REPLACE FUNCTION public.encrypt_secret(p_plaintext text, p_encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_plaintext IS NULL OR p_plaintext = '' THEN
    RETURN p_plaintext;
  END IF;
  RETURN encode(
    pgp_sym_encrypt(p_plaintext, p_encryption_key),
    'base64'
  );
END;
$$;

-- Decrypt a text value
CREATE OR REPLACE FUNCTION public.decrypt_secret(p_ciphertext text, p_encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_ciphertext IS NULL OR p_ciphertext = '' THEN
    RETURN p_ciphertext;
  END IF;
  BEGIN
    RETURN pgp_sym_decrypt(
      decode(p_ciphertext, 'base64'),
      p_encryption_key
    );
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails (e.g., plaintext data), return as-is
    RETURN p_ciphertext;
  END;
END;
$$;

-- ============================================================
-- 3. Fix discount_codes RLS: restrict public read to 
--    non-targeted, non-private codes only
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.discount_codes;

CREATE POLICY "Public can view non-targeted active discount codes"
ON public.discount_codes
FOR SELECT
USING (
  active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (target_buyer_type IS NULL OR target_buyer_type = 'all')
  AND (target_product_type IS NULL OR target_product_type = 'all')
  AND (targeting_rules IS NULL OR targeting_rules = '{}'::jsonb)
  AND (applicable_product_ids IS NULL OR array_length(applicable_product_ids, 1) IS NULL)
);

-- Sellers can still see ALL their own codes
-- (existing policy "Sellers can manage their discount codes" handles this)

-- ============================================================
-- 4. Remove duplicate host_integrations policies
-- ============================================================
DROP POLICY IF EXISTS "Users can manage their own integrations" ON public.host_integrations;
-- Keep only "Users manage own host integrations"

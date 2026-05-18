# AvatarTalk Test Credentials

> Backend uses Supabase Auth. There is no seeded test user — create one via the
> sign-up flow on the live preview before testing protected flows.

## How to create a test account

1. Open the preview URL (e.g. `https://logo-replace-update.preview.emergentagent.com/`).
2. Click **Sign In** → switch to **Sign Up** tab.
3. Use any disposable email + password (>= 6 chars).
4. Complete the email verification step if Supabase email confirmation is enabled.

## Manual Razorpay Test Cards

- **Success**: `4111 1111 1111 1111` — any future expiry, any CVV.
- **Failure**: `4000 0000 0000 0002` — to verify the new payment.failed toast.

## Notes

- Razorpay keys are configured in Supabase Secrets (`RAZORPAY_KEY_ID` /
  `RAZORPAY_KEY_SECRET`). The frontend never sees the secret.
- Migrations `20260301000000_avatartalk_fixes.sql` and
  `20260301000001_public_profiles_and_rls.sql` MUST be applied in the
  Supabase SQL editor for the social-link save, public profile,
  and monthly-drip flows to work end-to-end.
- For real-time monthly token drip the user should also schedule
  `monthly-token-credit` via pg_cron or an external cron service (see
  `/app/AVATARTALK_FIXES_README.md`). The frontend now also calls this
  function lazily on dashboard load (hourly debounce) as a safety net.

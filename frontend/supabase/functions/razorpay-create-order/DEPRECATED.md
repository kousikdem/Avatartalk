# DEPRECATED — Do Not Deploy

This Supabase Edge Function has been **superseded by the FastAPI route**:

    POST /api/payment/razorpay-create-order
    └── implemented in /app/backend/payment_routes.py

The frontend (`callPaymentApi('/api/payment/razorpay-create-order', ...)`) hits
the FastAPI handler directly. There is **no caller left** in the React app that
invokes this Supabase Edge Function via `supabase.functions.invoke(...)`.

## Why this folder still exists
Removing the source might break older clients still pinned to the deployed
Supabase function. Keep the deployed version live as a safety net but treat
**this source code as frozen** — every code change should go to FastAPI.

## What to do next
1. Verify Supabase telemetry shows **zero invocations** of this function for a
   full month.
2. Then run `supabase functions delete razorpay-create-order` and `rm -rf`
   this directory.

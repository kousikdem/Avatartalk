/**
 * monthly-token-credit Edge Function
 *
 * Credits the monthly token allotment to every active multi-month subscription
 * (Creator / Pro / Business) whose `next_monthly_credit_at` is due.
 *
 * Designed to be invoked on a schedule (e.g. every hour) via pg_cron + pg_net,
 * Supabase Scheduled Functions, or an external cron service (cron-job.org).
 *
 *   curl -X POST \
 *     -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
 *     https://<project>.functions.supabase.co/monthly-token-credit
 *
 * For convenience this function simply calls the `credit_monthly_plan_tokens()`
 * SQL function defined in the migration, which does all the work atomically.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Call the SQL helper installed by the migration.
    const { data, error } = await supabase.rpc('credit_monthly_plan_tokens');

    if (error) {
      console.error('credit_monthly_plan_tokens RPC error:', error);
      throw new Error(error.message || 'Failed to credit monthly tokens');
    }

    const credited = Array.isArray(data) ? data : [];
    const summary = {
      ran_at: new Date().toISOString(),
      users_credited: credited.length,
      details: credited,
    };

    console.log('Monthly drip complete:', summary);

    return new Response(JSON.stringify({ success: true, ...summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('monthly-token-credit error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

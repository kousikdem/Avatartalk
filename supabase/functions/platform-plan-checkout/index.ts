import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, billingCycleMonths, currency } = await req.json();

    console.log('Platform plan checkout started:', { planId, billingCycleMonths, currency });

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys not configured');
      throw new Error('Payment gateway not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header and extract user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized - no auth header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User auth error:', userError);
      throw new Error('Unauthorized - invalid token');
    }

    console.log('User authenticated:', user.id);

    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('platform_pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Plan not found:', planError);
      throw new Error('Plan not found');
    }

    console.log('Plan found:', plan.plan_name);

    // Calculate price based on billing cycle
    let amount: number;
    const isINR = currency === 'INR';

    switch (billingCycleMonths) {
      case 3:
        amount = isINR ? plan.price_3_month_inr : plan.price_3_month_usd;
        break;
      case 6:
        amount = isINR ? plan.price_6_month_inr : plan.price_6_month_usd;
        break;
      case 12:
        amount = isINR ? plan.price_12_month_inr : plan.price_12_month_usd;
        break;
      default: // 1 month
        amount = isINR ? plan.price_inr : plan.price_usd;
    }

    if (!amount || amount <= 0) {
      throw new Error('Invalid plan price configuration');
    }

    // Razorpay expects amount in paise (INR) or cents (USD)
    const razorpayAmount = amount * 100;

    console.log('Creating Razorpay order:', { amount, razorpayAmount, currency });

    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: razorpayAmount,
        currency: currency,
        receipt: `plan_${plan.plan_key}_${user.id.substring(0, 8)}`,
        notes: {
          user_id: user.id,
          plan_id: planId,
          plan_key: plan.plan_key,
          billing_cycle_months: billingCycleMonths.toString(),
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      throw new Error('Failed to create payment order');
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    // Get user's current plan for tracking upgrade
    const { data: existingSub } = await supabase
      .from('user_platform_subscriptions')
      .select('plan_key')
      .eq('user_id', user.id)
      .maybeSingle();

    // Create pending transaction
    const { error: txError } = await supabase
      .from('platform_plan_transactions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        plan_key: plan.plan_key,
        amount: amount,
        currency: currency,
        billing_cycle_months: billingCycleMonths,
        razorpay_order_id: razorpayOrder.id,
        status: 'pending',
        previous_plan_key: existingSub?.plan_key || 'free',
        transaction_type: existingSub ? 'upgrade' : 'purchase',
      });

    if (txError) {
      console.error('Transaction record error:', txError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrder.id,
        amount: amount,
        currency: currency,
        keyId: RAZORPAY_KEY_ID,
        planName: plan.plan_name,
        billingCycleMonths: billingCycleMonths,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Platform plan checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

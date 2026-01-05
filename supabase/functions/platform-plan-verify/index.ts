import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      planId, 
      billingCycleMonths 
    } = await req.json();

    console.log('Platform plan verification started:', { 
      razorpay_order_id, 
      razorpay_payment_id, 
      planId, 
      billingCycleMonths 
    });

    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Payment gateway not configured');
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const hmac = createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(text);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      throw new Error('Invalid payment signature');
    }

    console.log('Signature verified successfully');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header and extract user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('platform_pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + billingCycleMonths);

    // Calculate price paid
    let pricePaid: number;
    switch (billingCycleMonths) {
      case 3:
        pricePaid = plan.price_3_month_inr || plan.price_inr * 3;
        break;
      case 6:
        pricePaid = plan.price_6_month_inr || plan.price_inr * 6;
        break;
      case 12:
        pricePaid = plan.price_12_month_inr || plan.price_inr * 12;
        break;
      default:
        pricePaid = plan.price_inr;
    }

    // Check if user has existing subscription
    const { data: existingSub } = await supabase
      .from('user_platform_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const subscriptionData = {
      user_id: user.id,
      plan_id: planId,
      plan_key: plan.plan_key,
      status: 'active',
      billing_cycle_months: billingCycleMonths,
      price_paid: pricePaid,
      currency: 'INR',
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('user_platform_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id);

      if (updateError) {
        console.error('Subscription update error:', updateError);
        throw new Error('Failed to update subscription');
      }
      console.log('Subscription updated:', existingSub.id);
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('user_platform_subscriptions')
        .insert([subscriptionData]);

      if (insertError) {
        console.error('Subscription insert error:', insertError);
        throw new Error('Failed to create subscription');
      }
      console.log('Subscription created for user:', user.id);
    }

    // Update transaction status
    const { error: txUpdateError } = await supabase
      .from('platform_plan_transactions')
      .update({
        status: 'completed',
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (txUpdateError) {
      console.error('Transaction update error:', txUpdateError);
    }

    // Credit tokens based on plan from database
    const tokensToAdd = plan.ai_tokens_monthly || 0;
    if (tokensToAdd > 0) {
      // Get current token balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else {
        const currentBalance = profile?.token_balance || 0;
        const newBalance = currentBalance + tokensToAdd;

        // Update token balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            token_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Token update error:', updateError);
        } else {
          console.log(`Tokens credited: ${tokensToAdd} (${currentBalance} -> ${newBalance})`);
        }

        // Log the token event
        await supabase
          .from('token_events')
          .insert([{
            user_id: user.id,
            change: tokensToAdd,
            balance_after: newBalance,
            reason: `plan_purchase_${plan.plan_key}`,
          }]);
      }
    }

    console.log('Platform plan verification successful');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription activated successfully',
        planName: plan.plan_name,
        expiresAt: expiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Platform plan verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

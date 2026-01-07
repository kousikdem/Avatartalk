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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, profileId, billingCycle } = await req.json();

    console.log('Payment verification started:', { razorpay_order_id, razorpay_payment_id, planId, profileId, billingCycle });

    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!RAZORPAY_KEY_SECRET) {
      console.error('Razorpay secret not configured');
      throw new Error('Razorpay secret not configured');
    }

    // Verify signature using Web Crypto API
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
    const messageData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('Signature verification:', { 
      received: razorpay_signature, 
      generated: generatedSignature,
      match: generatedSignature === razorpay_signature 
    });

    if (generatedSignature !== razorpay_signature) {
      console.error('Invalid signature');
      throw new Error('Invalid payment signature');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header and extract user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      throw new Error('Unauthorized - no auth header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User auth error:', userError);
      throw new Error('Unauthorized - invalid token');
    }

    console.log('User authenticated:', user.id);

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Plan not found:', planError);
      throw new Error('Subscription plan not found');
    }

    console.log('Plan found:', plan.title, plan.price_amount);

    // Calculate expiry date based on billing cycle (use frontend billingCycle if provided)
    const effectiveBillingCycle = billingCycle || plan.billing_cycle;
    let expiresAt = new Date();
    if (effectiveBillingCycle === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (effectiveBillingCycle === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      // One-time or other - set 30 days default
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', user.id)
      .eq('subscribed_to_id', profileId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          price: plan.price_amount,
          subscription_type: effectiveBillingCycle,
          expires_at: expiresAt.toISOString(),
          razorpay_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub.id);

      if (updateError) {
        console.error('Subscription update error:', updateError);
        throw new Error('Failed to update subscription');
      }

      console.log('Subscription updated:', existingSub.id);
    } else {
      // Create new subscription
      const { data: newSub, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          subscribed_to_id: profileId,
          plan_id: planId,
          price: plan.price_amount,
          status: 'active',
          subscription_type: effectiveBillingCycle,
          expires_at: expiresAt.toISOString(),
          razorpay_payment_id: razorpay_payment_id,
          starts_at: new Date().toISOString()
        })
        .select()
        .single();

      if (subError) {
        console.error('Subscription creation error:', subError);
        throw new Error('Failed to create subscription');
      }

      console.log('Subscription created:', newSub.id);
    }

    // Calculate platform fee for subscriptions (50%)
    const platformFeePercent = 50;
    const platformFee = Math.round(plan.price_amount * (platformFeePercent / 100));
    const sellerEarnings = plan.price_amount - platformFee;

    console.log('Platform fee calculation:', { 
      amount: plan.price_amount, 
      platformFeePercent, 
      platformFee, 
      sellerEarnings 
    });

    // Create transaction record with platform fee tracking
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        profile_id: profileId,
        subscriber_id: user.id,
        amount: plan.price_amount,
        currency: plan.currency,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        razorpay_signature: razorpay_signature,
        status: 'completed',
        metadata: {
          platform_fee: platformFee,
          seller_earnings: sellerEarnings,
          platform_fee_percent: platformFeePercent,
          billing_cycle: effectiveBillingCycle
        }
      });

    if (txError) {
      console.error('Transaction record error:', txError);
      // Don't fail the whole operation for transaction logging
    }

    console.log('Payment verification successful');

    return new Response(
      JSON.stringify({ success: true, message: 'Subscription activated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

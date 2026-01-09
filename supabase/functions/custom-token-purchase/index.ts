import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default pricing: 1M tokens = ₹1000 INR (will be fetched from DB)
const DEFAULT_PRICE_PER_MILLION_INR = 1000;
const MIN_TOKENS = 100000;
const MAX_TOKENS = 100000000;
const MIN_AMOUNT_INR = 10; // ₹10 minimum

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokens, amount_inr, user_id } = await req.json();

    console.log(`Token purchase request: user=${user_id}, tokens=${tokens}, amount_inr=${amount_inr}`);

    if (!tokens || !amount_inr || !user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tokens, amount_inr, user_id'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate token amount
    if (tokens < MIN_TOKENS || tokens > MAX_TOKENS) {
      return new Response(JSON.stringify({
        success: false,
        error: `Token amount must be between ${MIN_TOKENS.toLocaleString()} and ${MAX_TOKENS.toLocaleString()}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch price per million from database (same source as frontend)
    let pricePerMillionINR = DEFAULT_PRICE_PER_MILLION_INR;
    const { data: priceRow } = await supabase
      .from('ai_system_limits')
      .select('limit_value')
      .eq('limit_key', 'gift_token_price_per_million')
      .maybeSingle();

    if (priceRow?.limit_value && typeof priceRow.limit_value === 'object') {
      const limit = (priceRow.limit_value as { limit?: number }).limit;
      if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
        pricePerMillionINR = limit;
      }
    }

    console.log(`Using price per million: ₹${pricePerMillionINR}`);

    // Validate price matches tokens (with tolerance for rounding)
    const expectedPrice = (tokens / 1000000) * pricePerMillionINR;
    const priceDiff = Math.abs(amount_inr - expectedPrice);
    const tolerance = Math.max(expectedPrice * 0.05, 1); // 5% tolerance or ₹1 minimum
    
    if (priceDiff > tolerance) {
      console.log(`Price mismatch: expected=${expectedPrice.toFixed(2)}, got=${amount_inr}, diff=${priceDiff.toFixed(2)}, tolerance=${tolerance.toFixed(2)}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Price mismatch. Expected ~₹${expectedPrice.toFixed(0)} for ${tokens.toLocaleString()} tokens`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate minimum amount
    if (amount_inr < MIN_AMOUNT_INR) {
      return new Response(JSON.stringify({
        success: false,
        error: `Minimum purchase is ₹${MIN_AMOUNT_INR}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured. Please contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Ensure user profile exists (some environments may miss signup triggers)
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user_id)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
    }

    if (!existingProfile) {
      console.log(`Profile missing for user ${user_id}. Attempting to create a minimal profile row...`);

      const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(user_id);
      if (authUserError) {
        console.warn('Could not fetch auth user for profile creation:', authUserError);
      }

      const email = authUserData?.user?.email ?? null;
      const meta = (authUserData?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const fullName = (meta.full_name as string | undefined) || (meta.name as string | undefined) || null;

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user_id,
          email,
          full_name: fullName,
          display_name: fullName,
        });

      if (createProfileError) {
        console.error('Failed to create profile:', createProfileError);
        return new Response(JSON.stringify({
          success: false,
          error: 'User profile not initialized. Please log out and log in again.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Convert price to paise (minimum ₹10 = 1000 paise)
    const amountInPaise = Math.round(amount_inr * 100);

    // Create Razorpay order
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `custom_token_${Date.now()}`,
        notes: {
          user_id,
          tokens,
          amount_inr,
          type: 'custom_token_purchase'
        }
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create payment order'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayOrder = await razorpayResponse.json();

    // Create custom token purchase record
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('custom_token_purchases')
      .insert({
        user_id,
        tokens_requested: tokens,
        amount_inr,
        amount_usd: amount_inr / 84, // Approximate conversion
        razorpay_order_id: razorpayOrder.id,
        status: 'pending'
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Failed to create purchase record:', purchaseError);
    }

    console.log(`Created custom token purchase order: ${razorpayOrder.id} for user ${user_id}, tokens: ${tokens}`);

    return new Response(JSON.stringify({
      success: true,
      order_id: razorpayOrder.id,
      purchase_id: purchaseData?.id,
      amount: amountInPaise,
      currency: 'INR',
      key_id: razorpayKeyId,
      tokens
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in custom-token-purchase:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
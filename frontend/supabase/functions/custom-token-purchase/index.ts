import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_PRICE_PER_MILLION_INR = 1000;
const MIN_TOKENS = 100000;
const MAX_TOKENS = 100000000;
const MIN_AMOUNT_INR = 10;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================================
    // FIX: Authenticate the caller via JWT
    // ============================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: authUser }, error: authError } = await anonClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use authenticated user ID, ignore client-provided user_id
    const user_id = authUser.id;

    const { tokens, amount_inr } = await req.json();

    console.log(`Token purchase request: user=${user_id}, tokens=${tokens}, amount_inr=${amount_inr}`);

    if (!tokens || !amount_inr) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tokens, amount_inr'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (tokens < MIN_TOKENS || tokens > MAX_TOKENS) {
      return new Response(JSON.stringify({
        success: false,
        error: `Token amount must be between ${MIN_TOKENS.toLocaleString()} and ${MAX_TOKENS.toLocaleString()}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch price per million from database
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

    // Validate price matches tokens
    const expectedPrice = (tokens / 1000000) * pricePerMillionINR;
    const priceDiff = Math.abs(amount_inr - expectedPrice);
    const tolerance = Math.max(expectedPrice * 0.05, 1);
    
    if (priceDiff > tolerance) {
      return new Response(JSON.stringify({
        success: false,
        error: `Price mismatch. Expected ~₹${expectedPrice.toFixed(0)} for ${tokens.toLocaleString()} tokens`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Ensure profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();

    if (!existingProfile) {
      const { data: authUserData } = await supabase.auth.admin.getUserById(user_id);
      const email = authUserData?.user?.email ?? null;
      const meta = (authUserData?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const fullName = (meta.full_name as string | undefined) || (meta.name as string | undefined) || null;

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({ id: user_id, email, full_name: fullName, display_name: fullName });

      if (createProfileError) {
        return new Response(JSON.stringify({
          success: false,
          error: 'User profile not initialized. Please log out and log in again.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const amountInPaise = Math.round(amount_inr * 100);

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

    const { data: purchaseData, error: purchaseError } = await supabase
      .from('custom_token_purchases')
      .insert({
        user_id,
        tokens_requested: tokens,
        amount_inr,
        amount_usd: amount_inr / 84,
        razorpay_order_id: razorpayOrder.id,
        status: 'pending'
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Failed to create purchase record:', purchaseError);
    }

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

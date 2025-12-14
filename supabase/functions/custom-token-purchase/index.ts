import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pricing: 1M tokens = ₹420 INR
const PRICE_PER_MILLION_TOKENS_INR = 420;
const MIN_TOKENS = 100000;
const MAX_TOKENS = 100000000;
const MIN_AMOUNT_PAISE = 4200; // ₹42 minimum

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokens, amount_inr, user_id } = await req.json();

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
        error: `Token amount must be between ${MIN_TOKENS} and ${MAX_TOKENS}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate price matches tokens (with small tolerance for rounding)
    const expectedPrice = (tokens / 1000000) * PRICE_PER_MILLION_TOKENS_INR;
    const priceDiff = Math.abs(amount_inr - expectedPrice);
    if (priceDiff > 1) { // Allow ₹1 tolerance for rounding
      return new Response(JSON.stringify({
        success: false,
        error: 'Price does not match token amount'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('User not found:', userError);
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert price to paise (minimum 100 paise = ₹1)
    const amountInPaise = Math.max(Math.round(amount_inr * 100), MIN_AMOUNT_PAISE);

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
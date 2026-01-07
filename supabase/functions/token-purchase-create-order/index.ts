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
    const { packageId, userId } = await req.json();
    console.log(`Token purchase order request: packageId=${packageId}, userId=${userId}`);

    if (!packageId || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: packageId and userId are required'
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
        error: 'Payment system not configured. Please contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch package details
    const { data: packageData, error: packageError } = await supabase
      .from('token_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      console.error('Package not found:', packageError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Token package not found or inactive'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Package found: ${packageData.name}, price: ₹${packageData.price_inr}`);

    // Verify user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
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

    // Convert price to paise for Razorpay (₹1 = 100 paise)
    const amountInPaise = Math.max(Math.round(packageData.price_inr * 100), 100);
    console.log(`Amount in paise for Razorpay: ${amountInPaise} (₹${packageData.price_inr})`);

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
        receipt: `token_${packageId.substring(0, 8)}_${Date.now()}`,
        notes: {
          package_id: packageId,
          user_id: userId,
          tokens: packageData.tokens,
          bonus_tokens: packageData.bonus_tokens,
          package_name: packageData.name,
          type: 'token_purchase'
        }
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create payment order. Please try again.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log(`Razorpay order created: ${razorpayOrder.id}`);

    // Create token purchase record
    const { error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: userId,
        package_id: packageId,
        tokens_purchased: packageData.tokens + packageData.bonus_tokens,
        amount: packageData.price_inr,
        currency: 'INR',
        razorpay_order_id: razorpayOrder.id,
        status: 'pending'
      });

    if (purchaseError) {
      console.error('Failed to create purchase record:', purchaseError);
      // Don't fail the request - order was created in Razorpay
    }

    console.log(`Token purchase order created successfully: order_id=${razorpayOrder.id}, amount=₹${packageData.price_inr}`);

    return new Response(JSON.stringify({
      success: true,
      order_id: razorpayOrder.id,
      amount: amountInPaise, // Razorpay expects paise
      currency: 'INR',
      key_id: razorpayKeyId,
      package: {
        name: packageData.name,
        tokens: packageData.tokens,
        bonus_tokens: packageData.bonus_tokens
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in token-purchase-create-order:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

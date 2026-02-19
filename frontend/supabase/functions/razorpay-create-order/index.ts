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
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    
    // Support both subscription and product/virtual collaboration orders
    const { 
      planId, 
      amount, 
      currency = 'INR', 
      profileId, 
      billingCycle,
      // Virtual collaboration / product fields
      productId,
      productType,
      buyerId,
      sellerId,
      metadata
    } = body;

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    // Validate that the buyerId matches the authenticated user (prevent impersonation)
    if (buyerId && buyerId !== user.id) {
      return new Response(JSON.stringify({ error: 'Cannot create orders for other users' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use authenticated user.id as the buyer identity
    const authenticatedBuyerId = user.id;

    // Validate amount - must be at least 100 paise (₹1)
    let amountInPaise = amount;
    
    // If amount seems to be in rupees (less than 100), convert to paise
    // Otherwise assume it's already in paise
    if (amountInPaise > 0 && amountInPaise < 100) {
      amountInPaise = amountInPaise * 100;
    }
    
    // Ensure minimum amount of ₹1 (100 paise)
    if (amountInPaise < 100) {
      amountInPaise = 100; // Minimum ₹1
    }

    console.log('Creating Razorpay order, amount:', amountInPaise, 'paise, user:', user.id.substring(0, 8) + '...');

    // Build notes based on order type — always use authenticated user ID
    const notes: Record<string, string> = {};
    if (planId) {
      notes.planId = planId;
      notes.profileId = profileId || authenticatedBuyerId;
      notes.billingCycle = billingCycle || 'monthly';
      notes.orderType = 'subscription';
      notes.buyerId = authenticatedBuyerId;
    } else if (productId) {
      notes.productId = productId;
      notes.productType = productType || 'virtual_collaboration';
      notes.buyerId = authenticatedBuyerId;
      notes.sellerId = sellerId || '';
      notes.orderType = 'product';
    }

    // Create Razorpay order
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency,
        receipt: `order_${Date.now()}`,
        notes: notes
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('Razorpay order creation failed, status:', orderResponse.status);
      throw new Error(orderData.error?.description || 'Failed to create Razorpay order');
    }

    console.log('Razorpay order created:', orderData.id);

    return new Response(
      JSON.stringify({
        order_id: orderData.id,
        orderId: orderData.id, // Include both formats for compatibility
        amount: orderData.amount,
        currency: orderData.currency,
        key_id: RAZORPAY_KEY_ID
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating order:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

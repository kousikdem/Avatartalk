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

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_T20oJ6nrpmfzIp';
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || 'Klh1GTpbLsd4eOSl4KU0oFa4';

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

    // Validate amount — Razorpay expects the smallest unit of the currency
    // (paise for INR, cents for USD/EUR, etc.). All callers are expected to
    // send `amount` already in the smallest unit, but we guard against bad data.
    const currencyCode = (currency || 'INR').toUpperCase();
    let amountInSmallestUnit = Number(amount);

    if (!Number.isFinite(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
      return new Response(
        JSON.stringify({ error: `Invalid amount: ${amount}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Round to integer because Razorpay rejects floats
    amountInSmallestUnit = Math.round(amountInSmallestUnit);

    // Razorpay minimum is 100 paise (₹1) for INR, ~50 cents for USD.
    // Don't silently bump 1 paise → 100 paise (used to mis-handle small amounts).
    const minAmount = currencyCode === 'INR' ? 100 : 50;
    if (amountInSmallestUnit < minAmount) {
      return new Response(
        JSON.stringify({
          error: `Amount too small. Minimum ${minAmount} ${currencyCode === 'INR' ? 'paise (₹1)' : 'cents'} required, received ${amountInSmallestUnit}.`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log('Creating Razorpay order, amount:', amountInSmallestUnit, currencyCode, 'user:', user.id.substring(0, 8) + '...');

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
    if (metadata && typeof metadata === 'object') {
      for (const [k, v] of Object.entries(metadata)) {
        if (v != null) notes[k] = String(v).slice(0, 256);
      }
    }

    // Create Razorpay order
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
      },
      body: JSON.stringify({
        amount: amountInSmallestUnit,
        currency: currencyCode,
        receipt: `order_${Date.now()}`,
        notes: notes
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      // Surface the real Razorpay error so the UI can show something actionable.
      const rzpError = orderData?.error || {};
      const message =
        rzpError.description ||
        rzpError.reason ||
        rzpError.code ||
        `Razorpay returned HTTP ${orderResponse.status}`;
      console.error('Razorpay order creation failed:', { status: orderResponse.status, rzpError });
      return new Response(
        JSON.stringify({
          error: `Failed to create order: ${message}`,
          razorpay: rzpError,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating order:', message);
    return new Response(
      JSON.stringify({ error: `Failed to create order: ${message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

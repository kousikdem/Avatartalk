import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { 
      productId, 
      variantId, 
      quantity = 1, 
      shippingAddress,
      discountCode,
      currency = 'INR'
    } = await req.json();

    // Fetch product details
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // Check inventory
    let selectedVariant = null;
    let availableInventory = product.inventory_quantity;

    if (variantId && product.variants_enabled && product.variants) {
      selectedVariant = product.variants.find((v: any) => v.id === variantId);
      if (!selectedVariant) {
        throw new Error('Variant not found');
      }
      availableInventory = selectedVariant.inventory;
    }

    if (product.track_inventory && availableInventory < quantity) {
      throw new Error('Insufficient inventory');
    }

    // Calculate pricing
    const basePrice = selectedVariant ? selectedVariant.price : product.price;
    let itemAmount = basePrice * quantity;
    let discountAmount = 0;
    let appliedDiscountId = null;

    // Apply discount code if provided
    if (discountCode) {
      const { data: discount, error: discountError } = await supabaseClient
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('active', true)
        .single();

      if (discount && !discountError) {
        // Check validity
        const now = new Date();
        const isValid = (!discount.starts_at || new Date(discount.starts_at) <= now) &&
                       (!discount.expires_at || new Date(discount.expires_at) >= now);

        if (isValid) {
          // Check usage limits
          const { data: usageData } = await supabaseClient
            .from('discount_usage')
            .select('id')
            .eq('discount_code_id', discount.id)
            .eq('user_id', user.id);

          const userUsageCount = usageData?.length || 0;

          if ((discount.max_uses === null || discount.current_uses < discount.max_uses) &&
              (discount.max_uses_per_user === null || userUsageCount < discount.max_uses_per_user) &&
              itemAmount >= (discount.min_order_value || 0)) {
            
            // Calculate discount
            if (discount.discount_type === 'percent') {
              discountAmount = Math.round((itemAmount * discount.discount_value) / 100);
            } else if (discount.discount_type === 'fixed') {
              discountAmount = Math.min(discount.discount_value, itemAmount);
            }
            
            appliedDiscountId = discount.id;
          }
        }
      }
    }

    const subtotal = itemAmount - discountAmount;

    // Calculate tax (simple 18% GST example)
    const taxAmount = product.taxable ? Math.round(subtotal * 0.18) : 0;

    // Calculate shipping
    const shippingAmount = product.product_type === 'physical' && product.shipping_enabled 
      ? (product.shipping_cost || 0) * 100 // Convert to smallest unit
      : 0;

    // Calculate platform fee (5%)
    const platformFeePercent = 5;
    const totalAmount = subtotal + taxAmount + shippingAmount;
    const platformFee = Math.round(totalAmount * (platformFeePercent / 100));
    const sellerEarnings = totalAmount - platformFee;

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: product.user_id,
        product_id: productId,
        variant_id: variantId,
        quantity,
        amount: itemAmount,
        currency,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        payment_method: 'razorpay',
        payment_status: 'pending',
        order_status: 'pending',
        shipping_address: shippingAddress,
        platform_fee: platformFee,
        seller_earnings: sellerEarnings,
        metadata: {
          product_title: product.title,
          product_type: product.product_type,
          discount_code: discountCode,
          variant: selectedVariant
        }
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    // Create Razorpay order
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: currency,
        receipt: `order_${order.id}`,
        notes: {
          order_id: order.id,
          product_id: productId,
          buyer_id: user.id,
          seller_id: product.user_id
        }
      })
    });

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error('Razorpay error:', razorpayOrder);
      throw new Error('Failed to create Razorpay order');
    }

    // Update order with Razorpay order ID
    await supabaseClient
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    // Record discount usage if applicable
    if (appliedDiscountId) {
      await supabaseClient
        .from('discount_usage')
        .insert({
          discount_code_id: appliedDiscountId,
          user_id: user.id,
          order_id: order.id
        });

      // Increment usage count
      await supabaseClient
        .from('discount_codes')
        .update({ current_uses: supabaseClient.sql`current_uses + 1` })
        .eq('id', appliedDiscountId);
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: totalAmount,
        currency: currency,
        key_id: RAZORPAY_KEY_ID,
        breakdown: {
          subtotal: itemAmount,
          discount: discountAmount,
          tax: taxAmount,
          shipping: shippingAmount,
          total: totalAmount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
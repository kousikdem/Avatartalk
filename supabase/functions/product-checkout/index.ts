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

        if (!isValid) {
          throw new Error('Promo code has expired or not yet active');
        }

        // Check usage limits
        const { data: usageData } = await supabaseClient
          .from('discount_usage')
          .select('id')
          .eq('discount_code_id', discount.id)
          .eq('user_id', user.id);

        const userUsageCount = usageData?.length || 0;

        // Check global usage limit
        if (discount.max_uses !== null && discount.current_uses >= discount.max_uses) {
          throw new Error('Promo code has reached maximum uses');
        }

        // Check per-user usage limit
        if (discount.max_uses_per_user !== null && userUsageCount >= discount.max_uses_per_user) {
          throw new Error('You have reached the usage limit for this promo');
        }

        // Check minimum order value
        if (discount.min_order_value !== null && itemAmount < discount.min_order_value) {
          throw new Error(`Minimum order value is ₹${discount.min_order_value / 100}`);
        }

        // Check minimum quantity
        if (discount.min_quantity && quantity < discount.min_quantity) {
          throw new Error(`Minimum quantity required: ${discount.min_quantity}`);
        }

        // Check product type targeting
        if (discount.target_product_type && discount.target_product_type !== 'all' && 
            discount.target_product_type !== product.product_type) {
          throw new Error(`Promo only valid for ${discount.target_product_type} products`);
        }

        // Check buyer targeting (followers/subscribers)
        if (discount.target_buyer_type && discount.target_buyer_type !== 'all') {
          if (discount.target_buyer_type === 'followers') {
            const { data: followData } = await supabaseClient
              .from('follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('following_id', product.user_id)
              .single();
            
            if (!followData) {
              throw new Error('This promo is only for followers');
            }
          }

          if (discount.target_buyer_type === 'subscribers') {
            const { data: subData } = await supabaseClient
              .from('subscriptions')
              .select('id')
              .eq('subscriber_id', user.id)
              .eq('subscribed_to_id', product.user_id)
              .eq('status', 'active')
              .single();
            
            if (!subData) {
              throw new Error('This promo is only for subscribers');
            }
          }
        }

        // Calculate discount
        if (discount.discount_type === 'percent') {
          discountAmount = Math.round((itemAmount * discount.discount_value) / 100);
        } else if (discount.discount_type === 'fixed') {
          discountAmount = Math.min(discount.discount_value, itemAmount);
        } else if (discount.discount_type === 'free_shipping') {
          // Free shipping will be handled separately
          discountAmount = 0;
        }
        
        appliedDiscountId = discount.id;
        
        // Apply free shipping if applicable
        if (discount.free_shipping || discount.discount_type === 'free_shipping') {
          // Note: shippingAmount will be overridden below
        }
      } else if (discountError) {
        throw new Error('Invalid promo code');
      }
    }

    const subtotal = itemAmount - discountAmount;

    // Calculate tax (simple 18% GST example)
    const taxAmount = product.taxable ? Math.round(subtotal * 0.18) : 0;

    // Calculate shipping (shipping_cost is already in smallest unit - paise)
    // Check if free shipping promo is applied
    let shippingAmount = 0;
    if (product.product_type === 'physical' && product.shipping_enabled) {
      const freeShippingApplied = appliedDiscountId && (
        (await supabaseClient
          .from('discount_codes')
          .select('free_shipping, discount_type')
          .eq('id', appliedDiscountId)
          .single()).data?.free_shipping === true ||
        (await supabaseClient
          .from('discount_codes')
          .select('free_shipping, discount_type')
          .eq('id', appliedDiscountId)
          .single()).data?.discount_type === 'free_shipping'
      );
      
      shippingAmount = freeShippingApplied ? 0 : (product.shipping_cost || 0);
    }

    // Calculate platform fee based on product type
    // Physical products: 5%, Digital products: 10%
    const platformFeePercent = product.product_type === 'physical' ? 5 : 10;
    const totalAmount = subtotal + taxAmount + shippingAmount;
    
    // Validate minimum order amount (Razorpay requires minimum ₹1 = 100 paise)
    if (totalAmount < 100) {
      throw new Error('Order amount must be at least ₹1. Please check the product pricing.');
    }
    
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
        receipt: order.id.substring(0, 40), // Razorpay receipt max 40 chars
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

    // Record discount usage if applicable with analytics
    if (appliedDiscountId) {
      // Determine buyer type
      let buyerType = 'unknown';
      const { data: previousOrders } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('payment_status', 'captured');
      
      if (!previousOrders || previousOrders.length === 0) {
        buyerType = 'new';
      } else {
        buyerType = 'returning';
      }

      const { data: followData } = await supabaseClient
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', product.user_id)
        .single();
      
      if (followData) {
        buyerType = 'follower';
      }

      const { data: subData } = await supabaseClient
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', user.id)
        .eq('subscribed_to_id', product.user_id)
        .eq('status', 'active')
        .single();
      
      if (subData) {
        buyerType = 'subscriber';
      }

      // Record usage with analytics
      await supabaseClient
        .from('discount_usage')
        .insert({
          discount_code_id: appliedDiscountId,
          user_id: user.id,
          order_id: order.id,
          discount_amount: discountAmount,
          order_amount: totalAmount,
          buyer_type: buyerType
        });

      // Increment usage count and update analytics
      const { data: currentDiscount } = await supabaseClient
        .from('discount_codes')
        .select('current_uses, analytics_data')
        .eq('id', appliedDiscountId)
        .single();
      
      if (currentDiscount) {
        const analyticsData = currentDiscount.analytics_data || {
          redemptions: 0,
          revenue_generated: 0,
          revenue_lost: 0,
          conversion_rate: 0
        };

        await supabaseClient
          .from('discount_codes')
          .update({
            current_uses: (currentDiscount.current_uses || 0) + 1,
            analytics_data: {
              redemptions: analyticsData.redemptions + 1,
              revenue_generated: analyticsData.revenue_generated + totalAmount,
              revenue_lost: analyticsData.revenue_lost + discountAmount,
              conversion_rate: analyticsData.conversion_rate
            }
          })
          .eq('id', appliedDiscountId);
      }
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
  } catch (error: any) {
    console.error('Checkout error:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    const statusCode = errorMessage === 'Unauthorized' ? 401 : 
                       errorMessage.includes('not found') ? 404 : 400;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error?.details || null,
        hint: error?.hint || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});
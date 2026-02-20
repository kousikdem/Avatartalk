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
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id
    } = await req.json();

    // Verify signature (Web Crypto API)
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured');
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Fetch order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Decrement inventory atomically
    const { data: inventoryResult, error: inventoryError } = await supabaseClient
      .rpc('decrement_product_inventory', {
        p_product_id: order.product_id,
        p_variant_id: order.variant_id,
        p_quantity: order.quantity
      });

    if (inventoryError || !inventoryResult) {
      console.error('Inventory decrement failed:', inventoryError);
      // Continue anyway, but log the error
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
        razorpay_payment_id,
        razorpay_signature,
        completed_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) {
      console.error('Order update error:', updateError);
      throw new Error('Failed to update order');
    }

    // Fetch product details for digital delivery
    const { data: product } = await supabaseClient
      .from('products')
      .select('product_type, title, digital_assets, user_id')
      .eq('id', order.product_id)
      .single();

    // If digital product, send download links via chat
    if (product && product.product_type === 'digital' && product.digital_assets) {
      // Get or create conversation between buyer and seller
      const { data: existingConv } = await supabaseClient
        .from('chat_conversations')
        .select('id')
        .or(`and(user_id.eq.${user.id},other_user_id.eq.${product.user_id}),and(user_id.eq.${product.user_id},other_user_id.eq.${user.id})`)
        .single();

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv } = await supabaseClient
          .from('chat_conversations')
          .insert({
            user_id: product.user_id,
            other_user_id: user.id
          })
          .select('id')
          .single();
        conversationId = newConv?.id;
      }

      if (conversationId) {
        // Create a system message with download links
        const downloadLinks = product.digital_assets.map((asset: any) => ({
          name: asset.name || 'Download',
          url: asset.url || asset.s3_key
        }));

        await supabaseClient
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: product.user_id,
            receiver_id: user.id,
            message: `Thank you for purchasing "${product.title}"! Here are your download links:

${downloadLinks.map((link: any, idx: number) => `${idx + 1}. ${link.name}: ${link.url}`).join('\n')}

Order ID: ${order.id}
Downloads available: ${product.download_limit || 'Unlimited'}

If you have any issues, please contact support.`
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: updatedOrder,
        message: product?.product_type === 'digital' 
          ? 'Payment successful! Download links sent via chat.' 
          : 'Payment successful! Your order is being processed.'
      }),
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
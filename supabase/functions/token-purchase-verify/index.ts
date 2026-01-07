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
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      package_id,
      user_id 
    } = await req.json();

    console.log(`Token purchase verification: order=${razorpay_order_id}, user=${user_id}`);

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeySecret) {
      console.error('Razorpay secret not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment verification not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify signature using Web Crypto API
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(razorpayKeySecret);
    const messageData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const providedSignature = String(razorpay_signature).trim().toLowerCase();

    if (expectedSignature !== providedSignature) {
      console.error('Signature verification failed');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment verification failed - invalid signature'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Signature verified successfully');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the purchase record
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('token_purchases')
      .select('*, token_packages(*)')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user_id)
      .single();

    if (purchaseError || !purchaseData) {
      console.error('Purchase record not found:', purchaseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Purchase record not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if already processed (idempotency)
    if (purchaseData.status === 'completed') {
      console.log('Purchase already processed:', razorpay_order_id);
      return new Response(JSON.stringify({
        success: true,
        tokens_credited: purchaseData.tokens_purchased,
        message: 'Purchase already processed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const tokensToCredit = purchaseData.tokens_purchased;
    console.log(`Crediting ${tokensToCredit} tokens to user ${user_id}`);

    // Credit tokens to user using the database function
    const { data: creditResult, error: creditError } = await supabase
      .rpc('credit_user_tokens', {
        p_user_id: user_id,
        p_tokens: tokensToCredit,
        p_reason: 'topup'
      });

    if (creditError || !creditResult?.success) {
      console.error('Failed to credit tokens:', creditError || creditResult?.error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to credit tokens'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update purchase record
    const { error: updateError } = await supabase
      .from('token_purchases')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed'
      })
      .eq('id', purchaseData.id);

    if (updateError) {
      console.error('Failed to update purchase record:', updateError);
    }

    console.log(`Token purchase verified: ${tokensToCredit} tokens credited to user ${user_id}, new balance: ${creditResult.balance}`);

    return new Response(JSON.stringify({
      success: true,
      tokens_credited: tokensToCredit,
      new_balance: creditResult.balance,
      message: 'Tokens credited successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in token-purchase-verify:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

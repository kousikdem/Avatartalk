import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // ── Auth ──────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'Authentication required' },
        { status: 401, headers: corsHeaders });
    }

    const supabaseUrl        = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey    = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeySecret  = Deno.env.get('RAZORPAY_KEY_SECRET')!;

    if (!razorpayKeySecret) {
      return Response.json({ success: false, error: 'Payment verification not configured' },
        { status: 500, headers: corsHeaders });
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return Response.json({ success: false, error: 'Invalid token' },
        { status: 401, headers: corsHeaders });
    }

    const userId = user.id;

    // ── Validate body ─────────────────────────────────────────────────
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, purchase_id } =
      await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return Response.json({ success: false, error: 'Missing payment fields' },
        { status: 400, headers: corsHeaders });
    }

    // ── Verify Razorpay signature ─────────────────────────────────────
    const payload   = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder   = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw', encoder.encode(razorpayKeySecret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
    const expectedSig = Array.from(new Uint8Array(sigBuf))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    if (expectedSig !== razorpay_signature.trim().toLowerCase()) {
      return Response.json({ success: false, error: 'Invalid payment signature' },
        { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Find purchase record ──────────────────────────────────────────
    const { data: purchase, error: purchaseError } = await supabase
      .from('custom_token_purchases')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', userId)  // MUST match JWT user
      .maybeSingle();

    if (purchaseError || !purchase) {
      // Fallback: find by order_id only (for backward compat)
      const { data: fallback } = await supabase
        .from('custom_token_purchases')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle();
      if (!fallback) {
        return Response.json({ success: false, error: 'Purchase record not found' },
          { status: 404, headers: corsHeaders });
      }
    }

    const purchaseRecord = purchase;

    // ── Idempotency check ─────────────────────────────────────────────
    if (purchaseRecord?.status === 'completed') {
      return Response.json({
        success: true, tokens_credited: purchaseRecord.tokens_requested,
        message: 'Already processed'
      }, { headers: corsHeaders });
    }

    const tokensToCredit = purchaseRecord?.tokens_requested ?? 0;

    // ── Credit tokens atomically ──────────────────────────────────────
    const { data: creditResult, error: creditError } = await supabase
      .rpc('credit_user_tokens', {
        p_user_id: userId,
        p_tokens: tokensToCredit,
        p_reason: 'topup',
      });

    if (creditError || !creditResult?.success) {
      console.error('Failed to credit tokens:', creditError ?? creditResult?.error);
      return Response.json({ success: false, error: 'Failed to credit tokens' },
        { status: 500, headers: corsHeaders });
    }

    // ── Mark purchase complete ────────────────────────────────────────
    await supabase.from('custom_token_purchases')
      .update({ razorpay_payment_id, razorpay_signature, status: 'completed', completed_at: new Date().toISOString() })
      .eq('razorpay_order_id', razorpay_order_id);

    // ── Notify user ───────────────────────────────────────────────────
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      title: '💰 Tokens Purchased!',
      message: `${tokensToCredit.toLocaleString()} tokens have been added to your account.`,
      data: { tokens_credited: tokensToCredit, new_balance: creditResult.balance },
    }).then(() => {}).catch(() => {}); // Non-fatal

    return Response.json({
      success: true,
      tokens_credited: tokensToCredit,
      new_balance: creditResult.balance,
      message: 'Tokens credited successfully',
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('custom-token-verify error:', error);
    return Response.json({ success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders });
  }
});

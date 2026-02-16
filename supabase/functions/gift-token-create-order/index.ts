import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_PRICE_PER_MILLION_INR = 1000;
const MIN_AMOUNT_INR = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================================
    // FIX: Authenticate the caller via JWT
    // ============================================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify JWT using anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: authUser }, error: authError } = await anonClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => null);
    const receiverId = body?.receiverId as string | undefined;
    const amount = Number(body?.amount);
    const amountPaidRaw = Number(body?.amountPaid);
    const message = (body?.message ?? null) as string | null;

    // The sender is ALWAYS the authenticated user – never trust client-provided senderId
    const senderId = authUser.id;

    console.log(
      `Gift token order request: sender=${senderId}, receiver=${receiverId}, tokens=${amount}`,
    );

    if (!receiverId || !Number.isFinite(amount) || !Number.isFinite(amountPaidRaw)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing/invalid required fields: receiverId, amount, amountPaid",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Prevent self-gifting
    if (senderId === receiverId) {
      return new Response(
        JSON.stringify({ success: false, error: "Cannot gift tokens to yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify sender profile exists
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", senderId)
      .maybeSingle();

    if (!senderProfile) {
      return new Response(
        JSON.stringify({ success: false, error: "Your profile is not ready. Please re-login." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: receiverProfile, error: receiverError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", receiverId)
      .single();

    if (receiverError || !receiverProfile) {
      return new Response(JSON.stringify({ success: false, error: "Receiver not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read gift price
    let pricePerMillionINR = DEFAULT_PRICE_PER_MILLION_INR;
    const { data: priceRow } = await supabase
      .from("ai_system_limits")
      .select("limit_value")
      .eq("limit_key", "gift_token_price_per_million")
      .maybeSingle();

    if (priceRow?.limit_value && typeof priceRow.limit_value === "object") {
      const limit = (priceRow.limit_value as { limit?: number }).limit;
      if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
        pricePerMillionINR = limit;
      }
    }

    // Normalize amountPaid
    let amountPaidINR = amountPaidRaw;
    const expectedTokensFromINR = Math.floor((amountPaidINR / pricePerMillionINR) * 1_000_000);
    const expectedTokensIfRawWasPaise = Math.floor(((amountPaidINR / 100) / pricePerMillionINR) * 1_000_000);
    const diffINR = Math.abs(expectedTokensFromINR - amount);
    const diffPaise = Math.abs(expectedTokensIfRawWasPaise - amount);

    if (amountPaidINR >= 1000 && diffPaise < diffINR * 0.2) {
      amountPaidINR = amountPaidINR / 100;
    }

    if (amountPaidINR < MIN_AMOUNT_INR) {
      return new Response(JSON.stringify({ success: false, error: `Minimum amount is ₹${MIN_AMOUNT_INR}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountInPaise = Math.round(amountPaidINR * 100);
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${razorpayAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `gift_${Date.now()}`,
        notes: {
          sender_id: senderId,
          receiver_id: receiverId,
          token_amount: amount,
          type: "token_gift",
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create payment order." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orderData = await orderResponse.json();

    const { data: giftRecord, error: giftError } = await supabase
      .from("token_gifts")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        amount,
        amount_paid: amountPaidINR,
        currency: "INR",
        razorpay_order_id: orderData.id,
        message,
        status: "pending",
      })
      .select()
      .single();

    if (giftError) {
      console.error("Gift record error:", giftError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create gift record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.id,
        gift_id: giftRecord.id,
        amount: amountInPaise,
        amount_inr: amountPaidINR,
        currency: "INR",
        key_id: razorpayKeyId,
        receiver_name: receiverProfile.display_name || receiverProfile.username,
        tokens: amount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Gift token order error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

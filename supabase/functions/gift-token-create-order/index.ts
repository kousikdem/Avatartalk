import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback: 1M tokens = ₹1000
const DEFAULT_PRICE_PER_MILLION_INR = 1000;
const MIN_AMOUNT_INR = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const senderId = body?.senderId as string | undefined;
    const receiverId = body?.receiverId as string | undefined;
    const amount = Number(body?.amount);
    const amountPaidRaw = Number(body?.amountPaid);
    const message = (body?.message ?? null) as string | null;

    console.log(
      `Gift token order request: sender=${senderId}, receiver=${receiverId}, tokens=${amount}, amountPaidRaw=${body?.amountPaid}`,
    );

    if (!senderId || !receiverId || !Number.isFinite(amount) || !Number.isFinite(amountPaidRaw)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing/invalid required fields: senderId, receiverId, amount, amountPaid",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ensure sender profile exists (some environments may miss signup triggers)
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", senderId)
      .maybeSingle();

    if (!senderProfile) {
      const { error: createSenderError } = await supabase
        .from("profiles")
        .insert({ id: senderId })
        .select()
        .maybeSingle();

      if (createSenderError) {
        console.error("Failed to auto-create sender profile:", createSenderError);
        return new Response(
          JSON.stringify({ success: false, error: "Your profile is not ready yet. Please re-login and try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { data: receiverProfile, error: receiverError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", receiverId)
      .single();

    if (receiverError || !receiverProfile) {
      console.error("Receiver not found:", receiverError);
      return new Response(JSON.stringify({ success: false, error: "Receiver not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read gift price (same source as frontend hook)
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

    // Normalize amountPaid -> rupees if a client accidentally sends paise
    // We detect this by comparing provided token amount vs. expected tokens.
    let amountPaidINR = amountPaidRaw;
    const expectedTokensFromINR = Math.floor((amountPaidINR / pricePerMillionINR) * 1_000_000);
    const expectedTokensIfRawWasPaise = Math.floor(((amountPaidINR / 100) / pricePerMillionINR) * 1_000_000);
    const diffINR = Math.abs(expectedTokensFromINR - amount);
    const diffPaise = Math.abs(expectedTokensIfRawWasPaise - amount);

    if (amountPaidINR >= 1000 && diffPaise < diffINR * 0.2) {
      console.log(
        `Detected amountPaid sent as paise. Normalizing ${amountPaidINR} -> ${amountPaidINR / 100} INR (pricePerMillionINR=${pricePerMillionINR})`,
      );
      amountPaidINR = amountPaidINR / 100;
    }

    if (amountPaidINR < MIN_AMOUNT_INR) {
      return new Response(JSON.stringify({ success: false, error: `Minimum amount is ₹${MIN_AMOUNT_INR}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert rupees to paise for Razorpay (₹1 = 100 paise)
    const amountInPaise = Math.round(amountPaidINR * 100);
    console.log(`Amount conversion: ₹${amountPaidINR} = ${amountInPaise} paise`);

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
        JSON.stringify({
          success: false,
          error: "Failed to create payment order. Please try again.",
          details: errorText.slice(0, 300),
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orderData = await orderResponse.json();
    console.log(`Razorpay order created: ${orderData.id}, amount: ${orderData.amount} paise`);

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
        JSON.stringify({ success: false, error: giftError.message || "Failed to create gift record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Gift order created successfully: gift_id=${giftRecord.id}, order_id=${orderData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.id,
        gift_id: giftRecord.id,
        amount: amountInPaise, // paise for Razorpay checkout
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
    return new Response(JSON.stringify({ success: false, error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

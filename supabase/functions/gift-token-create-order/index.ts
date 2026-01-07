import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { senderId, receiverId, amount, amountPaid, message } = await req.json();

    if (!receiverId || !amount || !amountPaid) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amountPaid < 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Minimum amount is ₹10" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let senderName = "Anonymous";
    if (senderId) {
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", senderId)
        .single();
      
      if (senderProfile) {
        senderName = senderProfile.display_name || senderProfile.username || "Anonymous";
      }
    }

    const { data: receiverProfile, error: receiverError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", receiverId)
      .single();

    if (receiverError || !receiverProfile) {
      return new Response(
        JSON.stringify({ success: false, error: "Receiver not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountInPaise = Math.round(amountPaid * 100);
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${razorpayAuth}`,
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
          type: "token_gift"
        }
      }),
    });

    if (!orderResponse.ok) {
      console.error("Razorpay error:", await orderResponse.text());
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create payment order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await orderResponse.json();

    const { data: giftRecord, error: giftError } = await supabase
      .from("token_gifts")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        amount: amount,
        amount_paid: amountPaid,
        currency: "INR",
        razorpay_order_id: orderData.id,
        message: message || null,
        status: "pending"
      })
      .select()
      .single();

    if (giftError) {
      console.error("Gift record error:", giftError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create gift record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.id,
        gift_id: giftRecord.id,
        amount: amountInPaise,
        currency: "INR",
        key_id: razorpayKeyId,
        receiver_name: receiverProfile.display_name || receiverProfile.username,
        tokens: amount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gift token order error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

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
    console.log(`Gift token order request: receiver=${receiverId}, tokens=${amount}, amountPaid=₹${amountPaid}`);

    if (!receiverId || !amount || !amountPaid) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: receiverId, amount, amountPaid" }),
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
      console.error("Razorpay credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway not configured. Please contact support." }),
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
      console.error("Receiver not found:", receiverError);
      return new Response(
        JSON.stringify({ success: false, error: "Receiver not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert rupees to paise for Razorpay (₹1 = 100 paise)
    // amountPaid is already in rupees from frontend
    const amountInPaise = Math.round(amountPaid * 100);
    console.log(`Amount conversion: ₹${amountPaid} = ${amountInPaise} paise`);

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
          sender_id: senderId || "anonymous",
          receiver_id: receiverId,
          token_amount: amount,
          type: "token_gift"
        }
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create payment order. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await orderResponse.json();
    console.log(`Razorpay order created: ${orderData.id}, amount: ${orderData.amount} paise`);

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

    console.log(`Gift order created successfully: gift_id=${giftRecord.id}, order_id=${orderData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.id,
        gift_id: giftRecord.id,
        amount: amountInPaise, // Return paise for Razorpay checkout
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
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

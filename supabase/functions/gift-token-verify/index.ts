import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      gift_id 
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !gift_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const generatedSignature = createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process the gift using the database function
    const { data, error } = await supabase.rpc("process_token_gift", {
      p_gift_id: gift_id,
      p_razorpay_payment_id: razorpay_payment_id,
      p_razorpay_signature: razorpay_signature
    });

    if (error) {
      console.error("Failed to process gift:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to process gift" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data.success) {
      return new Response(
        JSON.stringify({ success: false, error: data.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get gift details for notification
    const { data: giftData } = await supabase
      .from("token_gifts")
      .select(`
        amount,
        message,
        sender:sender_id(display_name, username),
        receiver:receiver_id(display_name, username)
      `)
      .eq("id", gift_id)
      .single();

    // Create notification for receiver
    if (giftData) {
      const senderName = giftData.sender?.display_name || giftData.sender?.username || "Someone";
      await supabase.from("notifications").insert({
        user_id: giftData.receiver?.id,
        type: "gift_received",
        title: "Token Gift Received! 🎁",
        message: `${senderName} gifted you ${giftData.amount.toLocaleString()} tokens!${giftData.message ? ` Message: "${giftData.message}"` : ""}`,
        data: { gift_id, amount: giftData.amount }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        tokens_credited: data.tokens_credited,
        new_balance: data.new_balance
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gift token verify error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

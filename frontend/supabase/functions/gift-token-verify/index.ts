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
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      gift_id 
    } = await req.json();

    console.log(`Gift token verification: gift_id=${gift_id}, order=${razorpay_order_id}`);

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
      console.error("Signature verification failed", {
        expected_prefix: expectedSignature.slice(0, 8),
        provided_prefix: providedSignature.slice(0, 8)
      });
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Signature verified successfully");

    // Fetch payment details from Razorpay API to validate amount
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const paymentResponse = await fetch(
          `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
          {
            headers: {
              'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
            },
          }
        );
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          // We'll validate the amount after fetching the gift row below
          // Store for comparison
          (globalThis as any).__verifiedPaymentAmount = paymentData.amount;
        } else {
          await paymentResponse.text(); // consume body
        }
      } catch (e) {
        console.warn("Could not fetch Razorpay payment details for amount validation:", e instanceof Error ? e.message : 'Unknown');
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate gift exists and order_id matches (and add idempotency)
    const { data: giftRow, error: giftError } = await supabase
      .from("token_gifts")
      .select("id, status, razorpay_order_id, amount, amount_paid, receiver_id, sender_id")
      .eq("id", gift_id)
      .single();

    if (giftError || !giftRow) {
      console.error("Gift not found");
      return new Response(
        JSON.stringify({ success: false, error: "Gift not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate payment amount matches expected gift amount
    const verifiedPaymentAmount = (globalThis as any).__verifiedPaymentAmount;
    delete (globalThis as any).__verifiedPaymentAmount;
    if (verifiedPaymentAmount !== undefined && giftRow.amount_paid) {
      // amount_paid is in currency units, Razorpay returns paise (x100)
      const expectedPaise = Math.round(giftRow.amount_paid * 100);
      if (verifiedPaymentAmount !== expectedPaise) {
        console.error("Payment amount mismatch", {
          expected_paise: expectedPaise,
          actual_paise: verifiedPaymentAmount,
        });
        return new Response(
          JSON.stringify({ success: false, error: "Payment amount mismatch" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Optional auth: log if caller is not sender/receiver
    const callerAuth = req.headers.get('Authorization');
    if (callerAuth?.startsWith('Bearer ')) {
      try {
        const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: callerAuth } }
        });
        const { data: { user } } = await userClient.auth.getUser();
        if (user && user.id !== giftRow.sender_id && user.id !== giftRow.receiver_id) {
          console.warn('Gift verification by non-participant user:', user.id.substring(0, 8) + '...');
        }
      } catch { /* auth is optional for this endpoint */ }
    }

    if (giftRow.razorpay_order_id && giftRow.razorpay_order_id !== razorpay_order_id) {
      console.error("Order ID mismatch for gift", {
        gift_id,
        expected: giftRow.razorpay_order_id,
        got: razorpay_order_id,
      });
      return new Response(
        JSON.stringify({ success: false, error: "Order ID mismatch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (giftRow.status === "completed") {
      const { data: receiverProfile } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", giftRow.receiver_id)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          success: true,
          tokens_credited: giftRow.amount,
          new_balance: receiverProfile?.token_balance ?? null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      // Treat idempotency as success
      if (data.error === 'Gift already processed') {
        const { data: receiverProfile } = await supabase
          .from("profiles")
          .select("token_balance")
          .eq("id", giftRow.receiver_id)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            tokens_credited: giftRow.amount,
            new_balance: receiverProfile?.token_balance ?? null,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: data.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get gift details for notification
    const { data: giftData } = await supabase
      .from("token_gifts")
      .select("amount, message, sender_id, receiver_id")
      .eq("id", gift_id)
      .single();

    // Create notification for receiver
    if (giftData) {
      // Get sender name separately
      let senderName = "Someone";
      if (giftData.sender_id) {
        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", giftData.sender_id)
          .single();
        
        if (senderProfile) {
          senderName = senderProfile.display_name || senderProfile.username || "Someone";
        }
      }

      await supabase.from("notifications").insert({
        user_id: giftData.receiver_id,
        type: "system",
        title: "Token Gift Received! 🎁",
        message: `${senderName} gifted you ${giftData.amount.toLocaleString()} tokens!${giftData.message ? ` Message: "${giftData.message}"` : ""}`,
        data: { gift_id, amount: giftData.amount }
      });

      console.log(`Notification sent to receiver ${giftData.receiver_id}`);
    }

    console.log(`Gift processed successfully: ${data.tokens_credited} tokens credited`);

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
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

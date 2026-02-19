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
    // ============================================================
    // FIX: Authenticate the caller via JWT instead of trusting client-provided userId
    // ============================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the JWT
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: authUser }, error: authError } = await anonClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use authenticated user ID, ignore client-provided userId
    const userId = authUser.id;

    const { packageId } = await req.json();
    console.log(`Token purchase order request: packageId=${packageId}, userId=${userId}`);

    if (!packageId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required field: packageId'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch package details
    const { data: packageData, error: packageError } = await supabase
      .from('token_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Token package not found or inactive'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      // Auto-create profile from auth metadata
      const { data: authUserData } = await supabase.auth.admin.getUserById(userId);
      const email = authUserData?.user?.email ?? null;
      const meta = (authUserData?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const fullName = (meta.full_name as string | undefined) || (meta.name as string | undefined) || null;

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({ id: userId, email, full_name: fullName, display_name: fullName });

      if (createProfileError) {
        return new Response(JSON.stringify({
          success: false,
          error: 'User profile not initialized. Please log out and log in again.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Convert price to paise
    const amountInPaise = Math.max(Math.round(packageData.price_inr * 100), 100);

    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `token_${packageId.substring(0, 8)}_${Date.now()}`,
        notes: {
          package_id: packageId,
          user_id: userId,
          tokens: packageData.tokens,
          bonus_tokens: packageData.bonus_tokens,
          package_name: packageData.name,
          type: 'token_purchase'
        }
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create payment order.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayOrder = await razorpayResponse.json();

    const { error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: userId,
        package_id: packageId,
        tokens_purchased: packageData.tokens + packageData.bonus_tokens,
        amount: packageData.price_inr,
        currency: 'INR',
        razorpay_order_id: razorpayOrder.id,
        status: 'pending'
      });

    if (purchaseError) {
      console.error('Failed to create purchase record:', purchaseError);
    }

    return new Response(JSON.stringify({
      success: true,
      order_id: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      key_id: razorpayKeyId,
      package: {
        name: packageData.name,
        tokens: packageData.tokens,
        bonus_tokens: packageData.bonus_tokens
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in token-purchase-create-order:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

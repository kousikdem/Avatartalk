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
    const { packageId, userId } = await req.json();
    console.log(`Token purchase order request: packageId=${packageId}, userId=${userId}`);

    if (!packageId || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: packageId and userId are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured. Please contact support.'
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
      console.error('Package not found:', packageError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Token package not found or inactive'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Package found: ${packageData.name}, price: ₹${packageData.price_inr}`);

    // Ensure user profile exists (some environments may miss signup triggers)
    let userData: { id: string; email: string | null } | null = null;

    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
    }

    if (!existingProfile) {
      console.log(`Profile missing for user ${userId}. Attempting to create a minimal profile row...`);

      // Try to fetch auth user details (best-effort)
      const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(userId);
      if (authUserError) {
        console.warn('Could not fetch auth user for profile creation:', authUserError);
      }

      const email = authUserData?.user?.email ?? null;
      const meta = (authUserData?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const fullName = (meta.full_name as string | undefined) || (meta.name as string | undefined) || null;

      const { data: createdProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          display_name: fullName,
        })
        .select('id, email')
        .single();

      if (createProfileError) {
        console.error('Failed to create profile:', createProfileError);
        return new Response(JSON.stringify({
          success: false,
          error: 'User profile not initialized. Please log out and log in again.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      userData = createdProfile;
    } else {
      userData = existingProfile;
    }

    if (!userData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert price to paise for Razorpay (₹1 = 100 paise)
    const amountInPaise = Math.max(Math.round(packageData.price_inr * 100), 100);
    console.log(`Amount in paise for Razorpay: ${amountInPaise} (₹${packageData.price_inr})`);

    // Create Razorpay order
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
        error: 'Failed to create payment order. Please try again.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log(`Razorpay order created: ${razorpayOrder.id}`);

    // Create token purchase record
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
      // Don't fail the request - order was created in Razorpay
    }

    console.log(`Token purchase order created successfully: order_id=${razorpayOrder.id}, amount=₹${packageData.price_inr}`);

    return new Response(JSON.stringify({
      success: true,
      order_id: razorpayOrder.id,
      amount: amountInPaise, // Razorpay expects paise
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
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

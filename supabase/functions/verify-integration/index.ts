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
    const { integration, environment } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let status = 'pending';
    let message = '';
    let connectedEmail = '';

    switch (integration) {
      case 'razorpay': {
        const keyId = Deno.env.get('RAZORPAY_KEY_ID');
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
        
        if (!keyId || !keySecret) {
          status = 'failed';
          message = 'Razorpay credentials not configured';
          break;
        }

        try {
          const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
            headers: {
              Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
            },
          });
          
          if (response.ok) {
            status = 'verified';
            message = 'Razorpay connection verified';
          } else {
            status = 'failed';
            message = 'Invalid Razorpay credentials';
          }
        } catch (e) {
          status = 'failed';
          message = 'Failed to connect to Razorpay';
        }
        break;
      }

      case 'google_meet':
      case 'google_calendar': {
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        
        if (!clientId || !clientSecret) {
          status = 'failed';
          message = 'Google OAuth credentials not configured';
          break;
        }

        // Check for stored access token
        const { data: tokenData } = await supabase
          .from('platform_integration_secrets')
          .select('secret_value')
          .eq('integration_name', integration)
          .eq('secret_key', 'access_token')
          .eq('environment', environment || 'live')
          .single();

        const { data: emailData } = await supabase
          .from('platform_integration_secrets')
          .select('secret_value')
          .eq('integration_name', integration)
          .eq('secret_key', 'connected_email')
          .eq('environment', environment || 'live')
          .single();

        if (tokenData?.secret_value) {
          // Verify token is still valid
          const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `access_token=${tokenData.secret_value}`,
          });

          if (response.ok) {
            status = 'verified';
            message = `Connected to Google`;
            connectedEmail = emailData?.secret_value || '';
          } else {
            status = 'expired';
            message = 'Token expired, reconnection required';
          }
        } else {
          status = 'pending';
          message = 'OAuth connection required';
        }
        break;
      }

      case 'zoom': {
        const clientId = Deno.env.get('ZOOM_CLIENT_ID');
        const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');
        const accountId = Deno.env.get('ZOOM_ACCOUNT_ID');
        
        if (!clientId || !clientSecret) {
          status = 'failed';
          message = 'Zoom OAuth credentials not configured';
          break;
        }

        // Try Server-to-Server OAuth first (preferred for backend)
        if (accountId) {
          try {
            // Get access token using Server-to-Server OAuth
            const tokenResponse = await fetch('https://zoom.us/oauth/token', {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: `grant_type=account_credentials&account_id=${accountId}`,
            });

            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              
              // Verify token by fetching user info
              const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
              });

              if (userResponse.ok) {
                const userData = await userResponse.json();
                status = 'verified';
                message = 'Zoom Server-to-Server OAuth verified';
                connectedEmail = userData.email || '';
              } else {
                status = 'failed';
                message = 'Failed to verify Zoom token';
              }
            } else {
              status = 'failed';
              message = 'Invalid Zoom Server-to-Server credentials';
            }
          } catch (e) {
            console.error('Zoom verification error:', e);
            status = 'failed';
            message = 'Failed to connect to Zoom API';
          }
        } else {
          // Check for stored access token from OAuth flow
          const { data: tokenData } = await supabase
            .from('platform_integration_secrets')
            .select('secret_value')
            .eq('integration_name', 'zoom')
            .eq('secret_key', 'access_token')
            .eq('environment', environment || 'live')
            .single();

          const { data: emailData } = await supabase
            .from('platform_integration_secrets')
            .select('secret_value')
            .eq('integration_name', 'zoom')
            .eq('secret_key', 'connected_email')
            .eq('environment', environment || 'live')
            .single();

          if (tokenData?.secret_value) {
            // Verify token is still valid
            const response = await fetch('https://api.zoom.us/v2/users/me', {
              headers: { Authorization: `Bearer ${tokenData.secret_value}` },
            });

            if (response.ok) {
              status = 'verified';
              message = 'Connected to Zoom';
              connectedEmail = emailData?.secret_value || '';
            } else {
              status = 'expired';
              message = 'Token expired, reconnection required';
            }
          } else {
            status = 'pending';
            message = 'Configure ZOOM_ACCOUNT_ID or complete OAuth flow';
          }
        }
        break;
      }

      default:
        status = 'pending';
        message = 'Unknown integration';
    }

    // Update verification status in database
    if (integration && status !== 'pending') {
      await supabase
        .from('platform_integration_secrets')
        .update({
          verification_status: status,
          last_verified_at: new Date().toISOString(),
        })
        .eq('integration_name', integration)
        .eq('environment', environment || 'live');
    }

    return new Response(
      JSON.stringify({ 
        integration,
        status, 
        message,
        connectedEmail,
        verified_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

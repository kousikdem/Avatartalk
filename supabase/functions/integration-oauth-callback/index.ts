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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const provider = url.searchParams.get('provider') || state?.split(':')[0];
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return new Response(
        `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${error}'}, '*'); window.close();</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing code or provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let tokenData;
    let integrationName;

    switch (provider) {
      case 'google':
      case 'google_meet':
      case 'google_calendar': {
        integrationName = provider === 'google' ? 'google_meet' : provider;
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = `${supabaseUrl}/functions/v1/integration-oauth-callback?provider=${provider}`;

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId!,
            client_secret: clientSecret!,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
          throw new Error(tokenData.error_description || tokenData.error);
        }

        // Get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        tokenData.email = userInfo.email;
        break;
      }

      case 'zoom': {
        integrationName = 'zoom';
        const clientId = Deno.env.get('ZOOM_CLIENT_ID');
        const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');
        const redirectUri = `${supabaseUrl}/functions/v1/integration-oauth-callback?provider=zoom`;

        const tokenResponse = await fetch('https://zoom.us/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });

        tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
          throw new Error(tokenData.reason || tokenData.error);
        }

        // Get user info
        const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userResponse.json();
        tokenData.email = userInfo.email;
        tokenData.account_id = userInfo.account_id;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Store tokens in platform_integration_secrets
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Store access token
    await supabase
      .from('platform_integration_secrets')
      .upsert({
        integration_name: integrationName,
        secret_key: 'access_token',
        secret_value: tokenData.access_token,
        environment: 'live',
        is_active: true,
        verification_status: 'verified',
        last_verified_at: new Date().toISOString(),
      }, { onConflict: 'integration_name,secret_key,environment' });

    // Store refresh token if available
    if (tokenData.refresh_token) {
      await supabase
        .from('platform_integration_secrets')
        .upsert({
          integration_name: integrationName,
          secret_key: 'refresh_token',
          secret_value: tokenData.refresh_token,
          environment: 'live',
          is_active: true,
          verification_status: 'verified',
          last_verified_at: new Date().toISOString(),
        }, { onConflict: 'integration_name,secret_key,environment' });
    }

    // Store token expiry
    if (expiresAt) {
      await supabase
        .from('platform_integration_secrets')
        .upsert({
          integration_name: integrationName,
          secret_key: 'token_expires_at',
          secret_value: expiresAt,
          environment: 'live',
          is_active: true,
          verification_status: 'verified',
          last_verified_at: new Date().toISOString(),
        }, { onConflict: 'integration_name,secret_key,environment' });
    }

    // Store connected email
    if (tokenData.email) {
      await supabase
        .from('platform_integration_secrets')
        .upsert({
          integration_name: integrationName,
          secret_key: 'connected_email',
          secret_value: tokenData.email,
          environment: 'live',
          is_active: true,
          verification_status: 'verified',
          last_verified_at: new Date().toISOString(),
        }, { onConflict: 'integration_name,secret_key,environment' });
    }

    console.log(`OAuth successful for ${integrationName}`);

    // Return success page that closes popup
    return new Response(
      `<html><body><script>
        window.opener.postMessage({
          type: 'oauth_success', 
          provider: '${integrationName}',
          email: '${tokenData.email || ''}'
        }, '*'); 
        window.close();
      </script><p>Authentication successful! This window will close automatically.</p></body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${error.message}'}, '*'); window.close();</script></body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
});

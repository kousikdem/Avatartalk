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
    // Encryption key derived from service role key (server-side only)
    const encryptionKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.substring(0, 32);

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const provider = url.searchParams.get('provider') || state?.split(':')[0];
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('OAuth callback received:', { provider, hasCode: !!code, error, errorDescription });

    if (error) {
      console.error('OAuth error from provider:', error, errorDescription);
      const errorMsg = errorDescription || error;
      return new Response(
        `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${errorMsg.replace(/'/g, "\\'")}'}, '*'); window.close();</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !provider) {
      console.error('Missing code or provider:', { code: !!code, provider });
      return new Response(
        JSON.stringify({ error: 'Missing code or provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: 'Server configuration error'}, '*'); window.close();</script></body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let tokenData: any;
    let integrationName: string;

    switch (provider) {
      case 'google':
      case 'google_meet':
      case 'google_calendar': {
        integrationName = provider === 'google' ? 'google_meet' : provider;
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        
        if (!clientId || !clientSecret) {
          console.error('Missing Google OAuth credentials');
          return new Response(
            `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: 'Google OAuth not configured'}, '*'); window.close();</script></body></html>`,
            { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
          );
        }
        
        const redirectUri = `${supabaseUrl}/functions/v1/integration-oauth-callback?provider=${provider}`;

        console.log('Exchanging code for Google tokens...');
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        tokenData = await tokenResponse.json();
        console.log('Google token response status:', tokenResponse.status);
        
        if (tokenData.error) {
          console.error('Google token error:', tokenData);
          throw new Error(tokenData.error_description || tokenData.error);
        }

        // Get user info
        console.log('Fetching Google user info...');
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        console.log('Google user email:', userInfo.email);
        tokenData.email = userInfo.email;
        break;
      }

      case 'zoom': {
        integrationName = 'zoom';
        const clientId = Deno.env.get('ZOOM_CLIENT_ID');
        const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');
        
        if (!clientId || !clientSecret) {
          console.error('Missing Zoom OAuth credentials');
          return new Response(
            `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: 'Zoom OAuth not configured'}, '*'); window.close();</script></body></html>`,
            { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
          );
        }
        
        const redirectUri = `${supabaseUrl}/functions/v1/integration-oauth-callback?provider=zoom`;

        console.log('Exchanging code for Zoom tokens...');
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
        console.log('Zoom token response status:', tokenResponse.status);
        
        if (tokenData.error) {
          console.error('Zoom token error:', tokenData);
          throw new Error(tokenData.reason || tokenData.error_description || tokenData.error);
        }

        // Get user info
        console.log('Fetching Zoom user info...');
        const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userResponse.json();
        console.log('Zoom user email:', userInfo.email);
        tokenData.email = userInfo.email;
        tokenData.account_id = userInfo.account_id;
        break;
      }

      default:
        console.error('Unknown provider:', provider);
        return new Response(
          JSON.stringify({ error: 'Unknown provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Store tokens in platform_integration_secrets (ENCRYPTED)
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    console.log('Storing encrypted tokens for integration:', integrationName);

    // Helper to encrypt sensitive values before storage
    const encryptValue = async (value: string): Promise<string> => {
      const { data, error } = await supabase.rpc('encrypt_secret', {
        p_plaintext: value,
        p_encryption_key: encryptionKey,
      });
      if (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt token');
      }
      return data;
    };

    // Store access token (encrypted)
    const encryptedAccessToken = await encryptValue(tokenData.access_token);
    const { error: accessTokenError } = await supabase
      .from('platform_integration_secrets')
      .upsert({
        integration_name: integrationName,
        secret_key: 'access_token',
        secret_value: encryptedAccessToken,
        environment: 'live',
        is_active: true,
        verification_status: 'verified',
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'integration_name,secret_key,environment' });

    if (accessTokenError) {
      console.error('Error storing access token:', accessTokenError);
      throw new Error(`Failed to store access token: ${accessTokenError.message}`);
    }

    // Store refresh token if available (encrypted)
    if (tokenData.refresh_token) {
      const encryptedRefreshToken = await encryptValue(tokenData.refresh_token);
      const { error: refreshTokenError } = await supabase
        .from('platform_integration_secrets')
        .upsert({
          integration_name: integrationName,
          secret_key: 'refresh_token',
          secret_value: encryptedRefreshToken,
          environment: 'live',
          is_active: true,
          verification_status: 'verified',
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'integration_name,secret_key,environment' });

      if (refreshTokenError) {
        console.error('Error storing refresh token:', refreshTokenError);
      }
    }

    // Store token expiry (not sensitive, no encryption needed)
    if (expiresAt) {
      const { error: expiryError } = await supabase
        .from('platform_integration_secrets')
        .upsert({
          integration_name: integrationName,
          secret_key: 'token_expires_at',
          secret_value: expiresAt,
          environment: 'live',
          is_active: true,
          verification_status: 'verified',
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'integration_name,secret_key,environment' });

      if (expiryError) {
        console.error('Error storing token expiry:', expiryError);
      }
    }

    // Store connected email (not highly sensitive, no encryption)
    if (tokenData.email) {
      const { error: emailError } = await supabase
        .from('platform_integration_secrets')
        .upsert({
          integration_name: integrationName,
          secret_key: 'connected_email',
          secret_value: tokenData.email,
          environment: 'live',
          is_active: true,
          verification_status: 'verified',
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'integration_name,secret_key,environment' });

      if (emailError) {
        console.error('Error storing connected email:', emailError);
      }
    }

    console.log(`OAuth successful for ${integrationName}`, { email: tokenData.email });

    // Return success page that closes popup
    return new Response(
      `<html><body><script>
        window.opener.postMessage({
          type: 'oauth_success', 
          provider: '${integrationName}',
          email: '${(tokenData.email || '').replace(/'/g, "\\'")}'
        }, '*'); 
        window.close();
      </script><p>Authentication successful! This window will close automatically.</p></body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('OAuth callback error:', error.message, error.stack);
    const errorMessage = error.message?.replace(/'/g, "\\'") || 'Unknown error occurred';
    return new Response(
      `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${errorMessage}'}, '*'); window.close();</script></body></html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
});
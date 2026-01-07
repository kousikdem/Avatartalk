import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Platform Zoom OAuth credentials
    const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID');
    const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET');

    if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      console.error('Zoom credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Zoom integration not configured. Contact admin.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Get OAuth URL for user authorization
    if (action === 'get_auth_url') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid user' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate state with user ID for callback
      const state = btoa(JSON.stringify({ user_id: user.id, timestamp: Date.now() }));
      
      const redirectUri = `${supabaseUrl}/functions/v1/user-zoom-oauth?action=callback`;
      const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

      console.log('Generated Zoom OAuth URL for user:', user.id);

      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: OAuth Callback
    if (action === 'callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'zoom_oauth_error',error:'${error}'},'*');window.close();</script><p>Error: ${error}. You can close this window.</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      if (!code || !state) {
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'zoom_oauth_error',error:'missing_params'},'*');window.close();</script><p>Missing parameters. You can close this window.</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Decode state to get user ID
      let userId: string;
      try {
        const stateData = JSON.parse(atob(state));
        userId = stateData.user_id;
      } catch {
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'zoom_oauth_error',error:'invalid_state'},'*');window.close();</script><p>Invalid state. You can close this window.</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Exchange code for tokens
      const redirectUri = `${supabaseUrl}/functions/v1/user-zoom-oauth?action=callback`;
      const tokenUrl = 'https://zoom.us/oauth/token';
      const basicAuth = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Zoom token exchange failed:', errorText);
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'zoom_oauth_error',error:'token_exchange_failed'},'*');window.close();</script><p>Token exchange failed. You can close this window.</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      const tokenData = await tokenResponse.json();
      console.log('Zoom tokens received for user:', userId);

      // Get user info from Zoom
      const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      let zoomEmail = '';
      let zoomUserId = '';
      if (userResponse.ok) {
        const userData = await userResponse.json();
        zoomEmail = userData.email || '';
        zoomUserId = userData.id || '';
        console.log('Zoom user info:', { email: zoomEmail, zoom_user_id: zoomUserId });
      }

      // Calculate token expiry
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

      // Save to host_integrations
      const { error: upsertError } = await supabase
        .from('host_integrations')
        .upsert({
          user_id: userId,
          zoom_connected: true,
          zoom_email: zoomEmail,
          zoom_access_token: tokenData.access_token,
          zoom_refresh_token: tokenData.refresh_token,
          zoom_token_expires_at: expiresAt,
          zoom_user_id: zoomUserId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('Failed to save Zoom integration:', upsertError);
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'zoom_oauth_error',error:'save_failed'},'*');window.close();</script><p>Failed to save. You can close this window.</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      console.log('Zoom OAuth successful for user:', userId);

      return new Response(
        `<html><body><script>window.opener?.postMessage({type:'zoom_oauth_success',email:'${zoomEmail}'},'*');window.close();</script><p>Zoom connected successfully! You can close this window.</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Action: Create Meeting
    if (action === 'create_meeting') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid user' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { topic, duration_mins, start_time, timezone } = body;

      // Get user's Zoom tokens
      const { data: integration, error: intError } = await supabase
        .from('host_integrations')
        .select('zoom_access_token, zoom_refresh_token, zoom_token_expires_at')
        .eq('user_id', user.id)
        .single();

      if (intError || !integration?.zoom_access_token) {
        return new Response(
          JSON.stringify({ error: 'Zoom not connected. Please connect Zoom first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let accessToken = integration.zoom_access_token;

      // Check if token is expired and refresh if needed
      if (integration.zoom_token_expires_at && new Date(integration.zoom_token_expires_at) < new Date()) {
        console.log('Refreshing expired Zoom token for user:', user.id);
        
        const refreshResponse = await fetch('https://zoom.us/oauth/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: integration.zoom_refresh_token,
          }),
        });

        if (!refreshResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Zoom token expired. Please reconnect Zoom.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;

        // Update stored tokens
        await supabase
          .from('host_integrations')
          .update({
            zoom_access_token: refreshData.access_token,
            zoom_refresh_token: refreshData.refresh_token || integration.zoom_refresh_token,
            zoom_token_expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }

      // Create Zoom meeting
      const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic || 'Virtual Collaboration',
          type: 2, // Scheduled meeting
          start_time: start_time || new Date().toISOString(),
          duration: duration_mins || 60,
          timezone: timezone || 'Asia/Kolkata',
          settings: {
            join_before_host: true,
            waiting_room: false,
            mute_upon_entry: true,
            auto_recording: 'none',
          },
        }),
      });

      if (!meetingResponse.ok) {
        const errorText = await meetingResponse.text();
        console.error('Failed to create Zoom meeting:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to create Zoom meeting' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const meetingData = await meetingResponse.json();
      console.log('Zoom meeting created:', meetingData.id);

      return new Response(
        JSON.stringify({
          success: true,
          meeting: {
            id: meetingData.id,
            join_url: meetingData.join_url,
            start_url: meetingData.start_url,
            password: meetingData.password,
            topic: meetingData.topic,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Disconnect Zoom
    if (action === 'disconnect') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid user' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabase
        .from('host_integrations')
        .update({
          zoom_connected: false,
          zoom_email: null,
          zoom_access_token: null,
          zoom_refresh_token: null,
          zoom_token_expires_at: null,
          zoom_user_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to disconnect Zoom:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to disconnect' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('User Zoom OAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

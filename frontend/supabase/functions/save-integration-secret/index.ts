import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Use anon client to verify the user's JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify super_admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("is_super_admin", {
      _user_id: user.id,
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { id, integration_name, secret_key, secret_value, environment, is_active } = body;

    // Encrypt the secret value server-side using the service role key
    const encryptionKey = serviceRoleKey.substring(0, 32);
    let encryptedValue = secret_value;

    if (secret_value && secret_value.trim()) {
      const { data: encrypted, error: encError } = await adminClient.rpc(
        "encrypt_secret",
        {
          p_plaintext: secret_value,
          p_encryption_key: encryptionKey,
        }
      );

      if (encError || !encrypted) {
        console.error("Encryption failed");
        return new Response(
          JSON.stringify({ error: "Failed to encrypt secret" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      encryptedValue = encrypted;
    }

    // Save to database
    if (id) {
      const { error } = await adminClient
        .from("platform_integration_secrets")
        .update({
          integration_name,
          secret_key,
          secret_value: encryptedValue,
          environment,
          is_active,
          updated_by: user.id,
        })
        .eq("id", id);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to update secret" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      const { error } = await adminClient
        .from("platform_integration_secrets")
        .insert({
          integration_name,
          secret_key,
          secret_value: encryptedValue,
          environment,
          is_active,
          updated_by: user.id,
        });

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to save secret" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

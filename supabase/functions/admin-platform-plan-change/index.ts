import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Server not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      console.error("Role lookup error:", roleError);
      throw new Error("Failed to verify admin role");
    }

    if (roleRow?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const targetUserId = body?.targetUserId as string | undefined;
    const planId = body?.planId as string | undefined;

    if (!targetUserId || !planId) {
      throw new Error("Missing targetUserId or planId");
    }

    console.log("Admin plan change request", {
      adminUserId: user.id,
      targetUserId,
      planId,
    });

    const { data: plan, error: planError } = await supabase
      .from("platform_pricing_plans")
      .select("id, plan_key, plan_name, ai_tokens_monthly")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      console.error("Plan fetch error:", planError);
      throw new Error("Plan not found");
    }

    const { data: existingSub } = await supabase
      .from("user_platform_subscriptions")
      .select("id, plan_key")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const previousPlanKey = existingSub?.plan_key || "free";

    const nowIso = new Date().toISOString();
    const expiresAt = (() => {
      if (plan.plan_key === "free") return null;
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString();
    })();

    const subscriptionData = {
      user_id: targetUserId,
      plan_id: plan.id,
      plan_key: plan.plan_key,
      status: "active",
      billing_cycle_months: 1,
      price_paid: 0,
      currency: "INR",
      starts_at: nowIso,
      expires_at: expiresAt,
      metadata: {
        upgraded_by_admin: true,
        previous_plan: previousPlanKey,
        changed_by: user.id,
      },
    };

    if (existingSub) {
      const { error: updateSubError } = await supabase
        .from("user_platform_subscriptions")
        .update(subscriptionData)
        .eq("id", existingSub.id);

      if (updateSubError) {
        console.error("Subscription update error:", updateSubError);
        throw new Error("Failed to update subscription");
      }
    } else {
      const { error: insertSubError } = await supabase
        .from("user_platform_subscriptions")
        .insert([subscriptionData]);

      if (insertSubError) {
        console.error("Subscription insert error:", insertSubError);
        throw new Error("Failed to create subscription");
      }
    }

    const getPlanTokens = async (planKey: string): Promise<number> => {
      if (!planKey || planKey === "free") return 0;
      const { data } = await supabase
        .from("platform_pricing_plans")
        .select("ai_tokens_monthly")
        .eq("plan_key", planKey)
        .maybeSingle();
      return Number((data as any)?.ai_tokens_monthly ?? 0);
    };

    const prevTokens = await getPlanTokens(previousPlanKey);
    const newTokens = Number((plan as any).ai_tokens_monthly ?? 0);

    // If same plan selected again, treat as "activation" top-up.
    const tokenDelta = previousPlanKey === plan.plan_key ? newTokens : (newTokens - prevTokens);

    let newBalance: number | null = null;

    if (tokenDelta !== 0) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", targetUserId)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw new Error("Failed to fetch user token balance");
      }

      const currentBalance = Number((profile as any)?.token_balance ?? 0);
      newBalance = Math.max(0, currentBalance + tokenDelta);

      const { error: balanceUpdateError } = await supabase
        .from("profiles")
        .update({ token_balance: newBalance, updated_at: nowIso })
        .eq("id", targetUserId);

      if (balanceUpdateError) {
        console.error("Token update error:", balanceUpdateError);
        throw new Error("Failed to update token balance");
      }

      const { error: tokenEventError } = await supabase
        .from("token_events")
        .insert([
          {
            user_id: targetUserId,
            change: tokenDelta,
            balance_after: newBalance,
            reason: `admin_plan_change_${previousPlanKey}_to_${plan.plan_key}`,
          },
        ]);

      if (tokenEventError) {
        console.error("Token event insert error:", tokenEventError);
        // Don't fail the entire operation if logging fails
      }

      console.log("Admin plan tokens updated", {
        targetUserId,
        previousPlanKey,
        newPlanKey: plan.plan_key,
        tokenDelta,
        newBalance,
      });
    } else {
      console.log("No token delta for admin plan change", {
        targetUserId,
        previousPlanKey,
        newPlanKey: plan.plan_key,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        targetUserId,
        previousPlanKey,
        newPlanKey: plan.plan_key,
        planName: plan.plan_name,
        tokenDelta,
        tokenBalance: newBalance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Admin plan change error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

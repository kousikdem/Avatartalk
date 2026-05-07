import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fail fast at module-load time with a clear, actionable message rather than
// letting createClient throw a cryptic "supabaseUrl is required" that crashes
// the whole React tree before the ErrorBoundary mounts.
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const msg =
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and " +
    "VITE_SUPABASE_PUBLISHABLE_KEY in your hosting provider's build env " +
    "(Vercel: Settings → Environment Variables).";
  // Render an error page directly so users don't see a perpetual loader.
  if (typeof document !== "undefined") {
    document.documentElement.innerHTML = `
      <body style="margin:0;font-family:system-ui,sans-serif;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center">
        <div style="max-width:520px">
          <h1 style="font-size:20px;margin:0 0 12px">Configuration Error</h1>
          <p style="font-size:14px;line-height:1.5;color:#cbd5e1">${msg}</p>
        </div>
      </body>`;
  }
  throw new Error(msg);
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

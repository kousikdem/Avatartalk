import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SSRF Mitigation: Block internal/private IPs and dangerous protocols
const BLOCKED_IP_RANGES = [
  /^127\./,           // Loopback
  /^10\./,            // Private Class A
  /^172\.(1[6-9]|2\d|3[01])\./, // Private Class B
  /^192\.168\./,      // Private Class C
  /^169\.254\./,      // Link-local
  /^0\./,             // Current network
  /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./, // Carrier-grade NAT
  /^::1$/,            // IPv6 loopback
  /^fd/i,             // IPv6 private
  /^fe80/i,           // IPv6 link-local
];

const ALLOWED_PROTOCOLS = ['https:', 'http:'];

// Maximum allowed URL length
const MAX_URL_LENGTH = 2048;

function isUrlSafe(urlString: string): { safe: boolean; error?: string } {
  if (urlString.length > MAX_URL_LENGTH) {
    return { safe: false, error: 'URL too long' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }

  // Protocol validation
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { safe: false, error: `Protocol ${parsed.protocol} not allowed. Only HTTP(S) permitted.` };
  }

  // Block IP-based hostnames (prevent direct IP access to internal services)
  const hostname = parsed.hostname;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    for (const range of BLOCKED_IP_RANGES) {
      if (range.test(hostname)) {
        return { safe: false, error: 'Access to internal/private IP addresses is not allowed' };
      }
    }
  }

  // Block common internal hostnames
  const blockedHosts = ['localhost', 'metadata.google.internal', '169.254.169.254', 'metadata'];
  if (blockedHosts.includes(hostname.toLowerCase())) {
    return { safe: false, error: 'Access to internal services is not allowed' };
  }

  // Block cloud metadata endpoints
  if (hostname.endsWith('.internal') || hostname.endsWith('.local')) {
    return { safe: false, error: 'Access to internal services is not allowed' };
  }

  return { safe: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      throw new Error('URL is required and must be a string');
    }

    // Normalize URL - add https:// if no protocol specified
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // SSRF validation
    const urlCheck = isUrlSafe(normalizedUrl);
    if (!urlCheck.safe) {
      return new Response(JSON.stringify({
        error: urlCheck.error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📡 Scraping URL:', normalizedUrl);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Create initial record with normalized URL
    const { data: record, error: insertError } = await supabaseClient
      .from('web_training_data')
      .insert({
        user_id: user.id,
        url: normalizedUrl,
        scraping_status: 'processing'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Fetch and parse the webpage
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AvatartalkBot/1.0)',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Validate final URL after redirects (prevent redirect-based SSRF)
      const finalUrl = response.url;
      const finalCheck = isUrlSafe(finalUrl);
      if (!finalCheck.safe) {
        throw new Error(`Redirect to blocked destination: ${finalCheck.error}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      const textContent = extractMainContent(html);

      const { error: updateError } = await supabaseClient
        .from('web_training_data')
        .update({
          scraped_content: textContent,
          scraping_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        id: record.id,
        content_length: textContent.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (scrapingError) {
      await supabaseClient
        .from('web_training_data')
        .update({
          scraping_status: 'error',
          error_message: scrapingError instanceof Error ? scrapingError.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      throw scrapingError;
    }

  } catch (error) {
    console.error('Error in web-scraper function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractMainContent(html: string): string {
  let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  content = content.replace(/<[^>]+>/g, ' ');
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  content = content.replace(/\s+/g, ' ').trim();
  
  const maxLength = 50000;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '...';
  }
  
  return content;
}

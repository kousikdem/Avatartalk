import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      throw new Error('URL is required');
    }

    // Validate URL format and protocol
    let validatedUrl;
    try {
      validatedUrl = new URL(url);
      if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are supported');
      }
    } catch (e) {
      throw new Error(`Invalid URL format: ${e.message}`);
    }

    console.log('🌐 Scraping URL:', validatedUrl.href);

    // Fetch the webpage with timeout and better headers
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(validatedUrl.href, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AvatarTalkBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL (${response.status}): ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const html = await response.text();

      if (!html || html.length === 0) {
        throw new Error('Empty response from URL');
      }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Remove script and style tags
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    content = content.replace(/<[^>]+>/g, ' ');
    
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    // Limit content length
    const maxLength = 50000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }

    return new Response(
      JSON.stringify({
        success: true,
        title,
        content,
        url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error scraping URL:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

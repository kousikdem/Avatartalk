import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

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

    console.log('📡 Scraping URL:', url);

    // Get user
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

    // Create initial record
    const { data: record, error: insertError } = await supabaseClient
      .from('web_training_data')
      .insert({
        user_id: user.id,
        url: url,
        scraping_status: 'processing'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Fetch and parse the webpage using Trafilatura-like approach
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AvatartalkBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // Simple content extraction (mimicking Trafilatura's main content extraction)
      const textContent = extractMainContent(html);

      // Update record with scraped content
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
      // Update record with error
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

// Simple content extraction function (simplified Trafilatura approach)
function extractMainContent(html: string): string {
  // Remove scripts and styles
  let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  content = content.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').trim();
  
  // Limit content size (prevent oversized storage)
  const maxLength = 50000;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '...';
  }
  
  return content;
}
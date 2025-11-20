import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, profileId, userId, conversationHistory } = await req.json();

    console.log('🚀 Streaming coordinator: Processing real-time request');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Fetch user profile for personalization
    let userContext = '';
    const targetId = profileId || userId;
    
    if (targetId) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (profile) {
        userContext = `User: ${profile.display_name || 'User'} (${profile.profession || 'General user'})`;
      }
    }

    const llamaCppServerUrl = Deno.env.get('LLAMA_CPP_SERVER_URL') || 'http://localhost:8080';

    // Build messages for streaming
    const messages = [];
    const systemPrompt = `You are a helpful AI assistant powered by Mistral 7B.
${userContext}
Provide concise, personalized responses.`;

    messages.push({ role: 'system', content: systemPrompt });
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-10));
    }
    
    messages.push({ role: 'user', content: userMessage });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('📡 Starting streaming response...');
          
          const response = await fetch(`${llamaCppServerUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages,
              temperature: 0.7,
              max_tokens: 500,
              stream: true,
            }),
          });

          if (!response.ok) {
            throw new Error('LLM server error');
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    // Send chunk to client
                    const chunk = encoder.encode(`data: ${JSON.stringify({ 
                      type: 'text_delta',
                      content 
                    })}\n\n`);
                    controller.enqueue(chunk);
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`));
          
          controller.close();
          console.log('✅ Streaming completed');

        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in streaming-coordinator:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process streaming request',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

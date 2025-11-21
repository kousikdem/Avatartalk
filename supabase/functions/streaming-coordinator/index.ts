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
    let personalizedTrainingData = null;
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

      // Fetch personalized AI training data
      const { data: trainingData } = await supabaseClient
        .from('personalized_ai_training')
        .select('*')
        .eq('user_id', targetId)
        .eq('model_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (trainingData) {
        personalizedTrainingData = trainingData;
        console.log('✅ Found personalized training data:', trainingData.voice_model_id);
      }
    }

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Build messages for streaming with personalized training context
    const messages = [];
    
    let systemPrompt = `You are a helpful AI assistant powered by Mixtral 8x7B with personalized training.
${userContext}`;

    // Add personalized training context if available
    if (personalizedTrainingData) {
      const personalitySettings = personalizedTrainingData.personality_settings || {};
      const trainingData = personalizedTrainingData.training_data || {};
      
      systemPrompt += `\n\nPersonality Configuration:
- Formality: ${personalitySettings.formality || 50}%
- Verbosity: ${personalitySettings.verbosity || 50}%
- Friendliness: ${personalitySettings.friendliness || 80}%
- Mode: ${personalitySettings.mode || 'adaptive'}`;

      // Add Q&A pairs from training data
      if (trainingData.qaPairs && trainingData.qaPairs.length > 0) {
        systemPrompt += `\n\nTrained Q&A Knowledge:`;
        trainingData.qaPairs.slice(0, 5).forEach((qa: any) => {
          systemPrompt += `\nQ: ${qa.question}\nA: ${qa.answer}`;
        });
      }

      // Add document context if available
      if (trainingData.documents && trainingData.documents.length > 0) {
        systemPrompt += `\n\nDocument Knowledge Base: ${trainingData.documents.length} documents processed`;
      }

      systemPrompt += `\n\nProvide responses based on this personalized training data while maintaining the specified personality traits.`;
    } else {
      systemPrompt += `\nProvide concise, personalized responses.`;
    }

    messages.push({ role: 'system', content: systemPrompt });
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-10));
    }
    
    messages.push({ role: 'user', content: userMessage });

    // Create streaming response using OpenRouter
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('📡 Starting Mixtral 8x7B streaming response...');
          
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterApiKey}`,
              'HTTP-Referer': Deno.env.get('SUPABASE_URL') || '',
              'X-Title': 'Personalized AI Chat',
            },
            body: JSON.stringify({
              model: 'mistralai/mixtral-8x7b-instruct',
              messages,
              temperature: 0.7,
              max_tokens: 800,
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

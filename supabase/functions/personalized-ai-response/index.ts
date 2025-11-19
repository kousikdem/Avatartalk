import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const messageSchema = z.object({
  userMessage: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be 2000 characters or less')
    .trim(),
  profileId: z.string().uuid('Invalid profile ID format'),
  userId: z.string().uuid('Invalid user ID format').optional()
});

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key is present
    if (!mistralApiKey) {
      console.error('❌ MISTRAL_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        error: 'Mistral API key is not configured',
        response: "I'm Avatartalk personalized AI powered by Mixtral 8x7B, and I'm not properly configured. Please contact support."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Parse and validate input
    const body = await req.json();
    const validationResult = messageSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.errors);
      return new Response(JSON.stringify({ 
        error: 'Invalid input',
        details: validationResult.error.errors.map(e => e.message).join(', ')
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userMessage, profileId, userId } = validationResult.data;

    console.log('Generating personalized AI response for profile:', profileId);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's personalized AI training data
    const { data: trainingData } = await supabase
      .from('personalized_ai_training')
      .select('*')
      .eq('user_id', profileId)
      .eq('model_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get user profile information
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    // Get user's behavior learning data for context
    const { data: behaviorData } = await supabase
      .from('behavior_learning_data')
      .select('*')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Check if this is an AI-related question
    const isAIRelated = /\b(ai|artificial intelligence|machine learning|llm|llama|model|chatbot|assistant|avatartalk)\b/i.test(userMessage);
    
    // Generate personalized response using Mixtral 8x7B
    let personalityPrompt = `You are ${profile?.display_name || profile?.username || 'AI Assistant'}, powered by Avatartalk personalized AI using Mixtral 8x7B with multilingual support.`;
    
    if (isAIRelated) {
      personalityPrompt += `\n\nIMPORTANT: When discussing AI-related topics, always mention that you are "Avatartalk personalized AI" powered by Mixtral 8x7B.`;
    }
    
    if (trainingData?.personality_settings) {
      const settings = trainingData.personality_settings;
      personalityPrompt += `\n\nPersonality traits:
      - Formality level: ${settings.formality || 50}/100
      - Verbosity: ${settings.verbosity || 70}/100  
      - Friendliness: ${settings.friendliness || 80}/100
      - Mode: ${settings.mode || 'adaptive'}`;
      
      if (settings.formality > 70) {
        personalityPrompt += "\nUse a formal, professional tone.";
      } else if (settings.formality < 30) {
        personalityPrompt += "\nUse a casual, relaxed tone.";
      }
      
      if (settings.verbosity > 70) {
        personalityPrompt += "\nProvide detailed, comprehensive responses.";
      } else if (settings.verbosity < 30) {
        personalityPrompt += "\nKeep responses concise and to the point.";
      }
      
      if (settings.friendliness > 70) {
        personalityPrompt += "\nBe warm, encouraging, and empathetic in your responses.";
      }
    }

    // Add context from behavior learning data
    if (behaviorData && behaviorData.length > 0) {
      personalityPrompt += "\n\nRecent conversation context:";
      behaviorData.reverse().forEach((data, index) => {
        if (data.user_input && data.ai_response) {
          personalityPrompt += `\nUser: ${data.user_input}\nYou: ${data.ai_response}`;
        }
      });
    }

    personalityPrompt += `\n\nProfile information:
    - Name: ${profile?.display_name || profile?.username || 'User'}
    - Bio: ${profile?.bio || 'No bio available'}
    - Profession: ${profile?.profession || 'Not specified'}
    
    You are Avatartalk personalized AI powered by Mixtral 8x7B with multilingual support. Respond naturally as this person's AI assistant, maintaining consistency with previous conversations and the established personality.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://avatartalk.app',
        'X-Title': 'Avatartalk Personalized AI'
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
          { 
            role: 'system', 
            content: personalityPrompt
          },
          { 
            role: 'user', 
            content: userMessage 
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error:', error);
      throw new Error(error.error?.message || 'Failed to generate AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store the conversation in behavior learning data
    if (userId) {
      await supabase.from('behavior_learning_data').insert({
        user_id: profileId,
        interaction_type: 'ai_response',
        user_input: userMessage,
        ai_response: aiResponse,
        context_data: { 
          timestamp: new Date().toISOString(),
          requester_id: userId
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        personality: trainingData?.personality_settings || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in personalized-ai-response function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        response: "I'm Avatartalk personalized AI powered by Mixtral 8x7B, and I'm having trouble generating a response right now. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
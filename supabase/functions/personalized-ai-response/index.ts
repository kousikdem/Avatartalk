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
  profileId: z.string().uuid('Invalid profile ID format').optional(),
  userId: z.string().uuid('Invalid user ID format').optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

const llamaCppServerUrl = Deno.env.get('LLAMA_CPP_SERVER_URL') || 'http://localhost:8080';
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate llama.cpp server URL is configured
    if (!llamaCppServerUrl) {
      console.error('❌ LLAMA_CPP_SERVER_URL is not configured');
      return new Response(JSON.stringify({ 
        error: 'Llama.cpp server URL is not configured',
        response: "I'm Avatartalk personalized AI powered by Mistral 7B, and I'm not properly configured. Please contact support."
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

    const { userMessage, profileId, userId, conversationHistory } = validationResult.data;
    const targetId = profileId || userId;

    console.log('Generating personalized AI response for profile:', targetId);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's personalized AI training data
    const { data: trainingData } = targetId ? await supabase
      .from('personalized_ai_training')
      .select('*')
      .eq('user_id', targetId)
      .eq('model_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() : { data: null };

    // Get user profile information
    const { data: profile } = targetId ? await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .maybeSingle() : { data: null };

    // Get user's behavior learning data for context
    const { data: behaviorData } = targetId ? await supabase
      .from('behavior_learning_data')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
      .limit(10) : { data: null };

    // Check if this is an AI-related question
    const isAIRelated = /\b(ai|artificial intelligence|machine learning|llm|llama|model|chatbot|assistant|avatartalk)\b/i.test(userMessage);
    
    // Generate personalized response using Mistral 7B via llama.cpp
    let personalityPrompt = `You are ${profile?.display_name || profile?.username || 'AI Assistant'}, powered by Avatartalk personalized AI using Mistral 7B.`;
    
    if (isAIRelated) {
      personalityPrompt += `\n\nIMPORTANT: When discussing AI-related topics, always mention that you are "Avatartalk personalized AI" powered by Mistral 7B running on llama.cpp.`;
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
    
    You are Avatartalk personalized AI powered by Mistral 7B. Respond naturally as this person's AI assistant, maintaining consistency with previous conversations and the established personality.`;

    // Build messages with conversation history
    const messages = [
      { role: 'system', content: personalityPrompt }
    ];
    
    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-10)); // Last 10 messages
    }
    
    // Add current message
    messages.push({ role: 'user', content: userMessage });

    console.log('🤖 Sending to Mistral 7B with', messages.length, 'messages');

    const response = await fetch(`${llamaCppServerUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('llama.cpp server error:', errorText);
      throw new Error('Failed to connect to llama.cpp server. Ensure it is running.');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store the conversation in behavior learning data
    if (targetId) {
      await supabase.from('behavior_learning_data').insert({
        user_id: targetId,
        interaction_type: 'ai_response',
        user_input: userMessage,
        ai_response: aiResponse,
        context_data: { 
          timestamp: new Date().toISOString(),
          requester_id: userId || targetId
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
        response: "I'm Avatartalk personalized AI powered by Mistral 7B, and I'm having trouble generating a response right now. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
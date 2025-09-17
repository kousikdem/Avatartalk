import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, profileId, userId } = await req.json();

    if (!userMessage || !profileId) {
      throw new Error('User message and profile ID are required');
    }

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

    // Generate personalized response using OpenAI
    let personalityPrompt = `You are ${profile?.display_name || profile?.username || 'AI Assistant'}, a friendly and helpful assistant.`;
    
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
    
    Respond naturally as this person's AI assistant, maintaining consistency with previous conversations and the established personality.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      console.error('OpenAI API error:', error);
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        response: "I'm having trouble generating a response right now. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
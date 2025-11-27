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

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Get Q&A pairs
    const { data: qaPairs } = await supabase
      .from('qa_pairs')
      .select('*')
      .eq('user_id', profileId);

    // Get training documents content
    const { data: documents } = await supabase
      .from('training_documents')
      .select('*')
      .eq('user_id', profileId)
      .eq('processing_status', 'completed');

    // Get web training data
    const { data: webData } = await supabase
      .from('web_training_data')
      .select('*')
      .eq('user_id', profileId)
      .eq('scraping_status', 'completed');

    // Check if this is an AI-related question
    const isAIRelated = /\b(ai|artificial intelligence|machine learning|llm|model|chatbot|assistant|technology|qwen|whisper|chattts|faster|trafilatura|emo)\b/i.test(userMessage);
    
    // Generate personalized response using NLP and LLM technology
    let personalityPrompt = `You are ${profile?.display_name || profile?.username || 'AI Assistant'}, a personalized AI assistant.`;
    
    if (isAIRelated) {
      personalityPrompt += `\n\nIMPORTANT: If asked about your technology, only say: "Avatartalk uses Natural Language Processing (NLP) technology and large language models (LLMs) to give users the best Personalized AI Avatar conversation." Do not mention specific model names, tools, or technical details. Keep it confidential.`;
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

    // Add Q&A pairs knowledge base
    if (qaPairs && qaPairs.length > 0) {
      personalityPrompt += "\n\nKnowledge Base (Q&A):";
      qaPairs.forEach((qa) => {
        personalityPrompt += `\nQ: ${qa.question}\nA: ${qa.answer}`;
        if (qa.custom_link_url) {
          personalityPrompt += `\nCustom Link: [${qa.custom_link_button_name || 'Learn More'}](${qa.custom_link_url})`;
        }
        if (qa.category) personalityPrompt += `\nCategory: ${qa.category}`;
      });
    }

    // Add document knowledge
    if (documents && documents.length > 0) {
      personalityPrompt += "\n\nDocument Knowledge:";
      documents.forEach((doc) => {
        if (doc.extracted_content) {
          personalityPrompt += `\n--- ${doc.filename} ---\n${doc.extracted_content.substring(0, 2000)}...`;
        }
      });
    }

    // Add web scraped data
    if (webData && webData.length > 0) {
      personalityPrompt += "\n\nWeb Content Knowledge:";
      webData.forEach((web) => {
        if (web.scraped_content) {
          personalityPrompt += `\n--- ${web.url} ---\n${web.scraped_content.substring(0, 2000)}...`;
        }
      });
    }

    personalityPrompt += `\n\nProfile information:
    - Name: ${profile?.display_name || profile?.username || 'User'}
    - Bio: ${profile?.bio || 'No bio available'}
    - Profession: ${profile?.profession || 'Not specified'}
    
    IMPORTANT: When answering questions, check if there's a matching Q&A pair or relevant document/web content. If there's a custom link associated with the answer, include it in your response by mentioning "You can learn more here: [link text]" and I will format it as a button.
    
    You are a personalized AI assistant. Respond naturally, maintaining consistency with previous conversations and the established personality.`;

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI service credits depleted. Please contact support.');
      }
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Find matching Q&A pairs for rich responses
    let richData: any = {};
    if (qaPairs && qaPairs.length > 0) {
      const matchedQA = qaPairs.find(qa => 
        userMessage.toLowerCase().includes(qa.question.toLowerCase().split(' ').slice(0, 3).join(' '))
      );
      
      if (matchedQA && matchedQA.custom_link_url) {
        richData.button = {
          text: matchedQA.custom_link_button_name || 'Learn More',
          url: matchedQA.custom_link_url
        };
      }
    }

    // Store the conversation in behavior learning data
    if (userId) {
      await supabase.from('behavior_learning_data').insert({
        user_id: profileId,
        interaction_type: 'ai_response',
        user_input: userMessage,
        ai_response: aiResponse,
        context_data: { 
          timestamp: new Date().toISOString(),
          requester_id: userId,
          rich_data: richData
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        personality: trainingData?.personality_settings || null,
        richData: Object.keys(richData).length > 0 ? richData : null
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
        response: "I'm having trouble generating a response right now. Avatartalk uses Natural Language Processing (NLP) technology and large language models (LLMs) to provide the best personalized AI conversation. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

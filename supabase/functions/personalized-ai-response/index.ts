import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error codes for generic responses
const ERROR_CODES = {
  INVALID_INPUT: 'ERR_INVALID_INPUT',
  RATE_LIMITED: 'ERR_RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'ERR_SERVICE_UNAVAILABLE',
  PROCESSING_ERROR: 'ERR_PROCESSING',
  AUTH_ERROR: 'ERR_AUTH'
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
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ 
        success: false,
        error_code: ERROR_CODES.INVALID_INPUT,
        message: 'Invalid request format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validationResult = messageSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return new Response(JSON.stringify({ 
        success: false,
        error_code: ERROR_CODES.INVALID_INPUT,
        message: 'Please check your input and try again'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userMessage, profileId, userId } = validationResult.data;

    console.log('Processing AI request for profile:', profileId);

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
      behaviorData.reverse().forEach((data) => {
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
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        success: false,
        error_code: ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable. Please try again later.',
        response: "I'm having trouble generating a response right now. Please try again in a moment."
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      console.error('AI Gateway error:', response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false,
          error_code: ERROR_CODES.RATE_LIMITED,
          message: 'Service is busy. Please try again in a moment.',
          response: "I'm receiving too many requests. Please try again in a moment."
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          success: false,
          error_code: ERROR_CODES.SERVICE_UNAVAILABLE,
          message: 'Service temporarily unavailable.',
          response: "I'm temporarily unavailable. Please try again later."
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error_code: ERROR_CODES.PROCESSING_ERROR,
        message: 'Unable to process your request.',
        response: "I'm having trouble generating a response. Please try again."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Find matching Q&A pairs and web links for rich responses
    const richData: {
      buttons: Array<{ text: string; url: string }>;
      links: Array<{ url: string; title: string; preview: string }>;
      documents: Array<{ filename: string; type: string; preview: string }>;
    } = {
      buttons: [],
      links: [],
      documents: []
    };
    
    // Match Q&A pairs and add buttons
    if (qaPairs && qaPairs.length > 0) {
      qaPairs.forEach(qa => {
        const questionWords = qa.question.toLowerCase().split(' ').slice(0, 5).join(' ');
        if (userMessage.toLowerCase().includes(questionWords) && qa.custom_link_url) {
          richData.buttons.push({
            text: qa.custom_link_button_name || 'Learn More',
            url: qa.custom_link_url
          });
        }
      });
    }
    
    // Add web training data as link previews
    if (webData && webData.length > 0) {
      webData.forEach(web => {
        const urlDomain = new URL(web.url).hostname;
        if (userMessage.toLowerCase().includes(urlDomain.replace('www.', '')) || 
            (web.scraped_content && aiResponse.toLowerCase().includes(urlDomain.replace('www.', '')))) {
          richData.links.push({
            url: web.url,
            title: web.url,
            preview: web.scraped_content ? web.scraped_content.substring(0, 150) + '...' : ''
          });
        }
      });
    }
    
    // Add document references
    if (documents && documents.length > 0) {
      documents.forEach(doc => {
        if (aiResponse.toLowerCase().includes(doc.filename.toLowerCase().split('.')[0])) {
          richData.documents.push({
            filename: doc.filename,
            type: doc.file_type,
            preview: doc.extracted_content ? doc.extracted_content.substring(0, 100) + '...' : ''
          });
        }
      });
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

    // Clean up empty arrays
    const hasRichData = richData.buttons.length > 0 || richData.links.length > 0 || richData.documents.length > 0;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        personality: trainingData?.personality_settings || null,
        richData: hasRichData ? richData : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in personalized-ai-response:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error_code: ERROR_CODES.PROCESSING_ERROR,
        message: 'Unable to process your request. Please try again.',
        response: "I'm having trouble generating a response right now. Avatartalk uses Natural Language Processing (NLP) technology and large language models (LLMs) to provide the best personalized AI conversation. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ERROR_CODES = {
  INVALID_INPUT: 'ERR_INVALID_INPUT',
  RATE_LIMITED: 'ERR_RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'ERR_SERVICE_UNAVAILABLE',
  PROCESSING_ERROR: 'ERR_PROCESSING',
  AUTH_ERROR: 'ERR_AUTH'
};

const messageSchema = z.object({
  userMessage: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be 2000 characters or less')
    .trim(),
  profileId: z.string().uuid('Invalid profile ID format'),
  userId: z.string().uuid('Invalid user ID format').optional(),
  visitorName: z.string().optional()
});

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { userMessage, profileId, userId, visitorName } = validationResult.data;

    console.log('Processing AI request for profile:', profileId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all training data in parallel
    const [
      trainingDataRes,
      profileRes,
      aiSettingsRes,
      topicsRes,
      followUpsRes,
      qaPairsRes,
      documentsRes,
      webDataRes,
      behaviorDataRes
    ] = await Promise.all([
      supabase.from('personalized_ai_training').select('*').eq('user_id', profileId).eq('model_status', 'completed').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('profiles').select('*').eq('id', profileId).single(),
      supabase.from('ai_training_settings').select('*').eq('user_id', profileId).maybeSingle(),
      supabase.from('ai_topics').select('*').eq('user_id', profileId).eq('is_active', true).order('topic_priority', { ascending: false }),
      supabase.from('ai_follow_ups').select('*').eq('user_id', profileId).eq('is_active', true),
      supabase.from('qa_pairs').select('*').eq('user_id', profileId),
      supabase.from('training_documents').select('*').eq('user_id', profileId).eq('processing_status', 'completed'),
      supabase.from('web_training_data').select('*').eq('user_id', profileId).eq('scraping_status', 'completed'),
      supabase.from('behavior_learning_data').select('*').eq('user_id', profileId).order('created_at', { ascending: false }).limit(10)
    ]);

    const trainingData = trainingDataRes.data;
    const profile = profileRes.data;
    const aiSettings = aiSettingsRes.data;
    const topics = topicsRes.data || [];
    const followUps = followUpsRes.data || [];
    const qaPairs = qaPairsRes.data || [];
    const documents = documentsRes.data || [];
    const webData = webDataRes.data || [];
    const behaviorData = behaviorDataRes.data || [];

    // Check if this is an AI-related question
    const isAIRelated = /\b(ai|artificial intelligence|machine learning|llm|model|chatbot|assistant|technology|qwen|whisper|chattts|faster|trafilatura|emo)\b/i.test(userMessage);
    
    // Build the system prompt based on AI Training Settings
    const creatorName = profile?.display_name || profile?.username || 'AI Representative';
    const visitorDisplayName = visitorName || 'Guest';
    
    let systemPrompt = `You are ${creatorName}'s AI representative. You speak and respond AS ${creatorName}, representing them to visitors. Never reveal that you are an AI - always respond as if you ARE ${creatorName}.

## IDENTITY CONTEXT:
- You are: ${creatorName}
- You're speaking with: ${visitorDisplayName}

## CONVERSATION STYLE:
- Introduce yourself as "${creatorName}" when appropriate
- Address the visitor by their name "${visitorDisplayName}" naturally throughout the conversation
- Make the conversation feel personal and warm by using both names appropriately
- Example: "Hi ${visitorDisplayName}, I'm ${creatorName}! Great to meet you."
- In ongoing conversation, use "${visitorDisplayName}" occasionally (not every message) to maintain personal connection`;
    
    // Add confidentiality clause for AI technology questions
    if (isAIRelated) {
      systemPrompt += `\n\nIMPORTANT: If asked about your technology, only say: "Avatartalk uses Natural Language Processing (NLP) technology and large language models (LLMs) to give users the best Personalized AI Avatar conversation." Do not mention specific model names, tools, or technical details.`;
    }

    // Add AI Persona Prompt (global persona description) - this is the primary identity definition
    if (aiSettings?.global_describe_text) {
      systemPrompt += `\n\n## YOUR PERSONA (WHO YOU ARE & HOW TO SPEAK):
${aiSettings.global_describe_text}

Use this persona to guide ALL your responses. This defines:
- Your identity and creator type
- Your tone and communication style  
- Topics/categories you specialize in
- How you greet and interact with visitors`;
    }

    // Add personality settings from training
    if (trainingData?.personality_settings) {
      const settings = trainingData.personality_settings;
      systemPrompt += `\n\n## PERSONALITY TRAITS:`;
      if (settings.formality > 70) {
        systemPrompt += "\n- Use a formal, professional tone.";
      } else if (settings.formality < 30) {
        systemPrompt += "\n- Use a casual, relaxed tone.";
      }
      if (settings.verbosity > 70) {
        systemPrompt += "\n- Provide detailed, comprehensive responses.";
      } else if (settings.verbosity < 30) {
        systemPrompt += "\n- Keep responses concise and to the point.";
      }
      if (settings.friendliness > 70) {
        systemPrompt += "\n- Be warm, encouraging, and empathetic.";
      }
    }

    // Add Topic Rules
    if (topics.length > 0) {
      systemPrompt += `\n\n## TOPIC-SPECIFIC RULES:`;
      topics.forEach((topic: any) => {
        systemPrompt += `\n\n### Topic: ${topic.topic_name} (Priority: ${topic.topic_priority || 5})`;
        if (topic.authority) systemPrompt += `\nAuthority level: ${topic.authority}`;
        if (topic.describe_text) systemPrompt += `\nGuidance: ${topic.describe_text}`;
        if (topic.do_rules && Array.isArray(topic.do_rules) && topic.do_rules.length > 0) {
          systemPrompt += `\nDO: ${topic.do_rules.join(', ')}`;
        }
        if (topic.avoid_rules && Array.isArray(topic.avoid_rules) && topic.avoid_rules.length > 0) {
          systemPrompt += `\nAVOID: ${topic.avoid_rules.join(', ')}`;
        }
        if (topic.keywords && Array.isArray(topic.keywords) && topic.keywords.length > 0) {
          systemPrompt += `\nKeywords: ${topic.keywords.join(', ')}`;
        }
      });
    }

    // Add Q&A Knowledge Base
    if (qaPairs.length > 0) {
      systemPrompt += `\n\n## KNOWLEDGE BASE (Q&A PAIRS):`;
      qaPairs.forEach((qa: any) => {
        systemPrompt += `\n\nQ: ${qa.question}\nA: ${qa.answer}`;
        if (qa.custom_link_url) {
          systemPrompt += `\n[LINK BUTTON: "${qa.custom_link_button_name || 'Learn More'}" -> ${qa.custom_link_url}]`;
        }
        if (qa.category) systemPrompt += ` (Category: ${qa.category})`;
      });
      systemPrompt += `\n\nWhen a Q&A matches the user's question, use that answer and include the link button if available.`;
    }

    // Add Document Knowledge
    if (documents.length > 0) {
      systemPrompt += `\n\n## DOCUMENT KNOWLEDGE:`;
      documents.forEach((doc: any) => {
        if (doc.extracted_content) {
          systemPrompt += `\n--- ${doc.filename} ---\n${doc.extracted_content.substring(0, 1500)}...`;
        }
      });
    }

    // Add Web Scraped Data
    if (webData.length > 0) {
      systemPrompt += `\n\n## WEB CONTENT KNOWLEDGE:`;
      webData.forEach((web: any) => {
        if (web.scraped_content) {
          systemPrompt += `\n--- ${web.url} ---\n${web.scraped_content.substring(0, 1500)}...`;
        }
      });
    }

    // Add conversation history context
    if (behaviorData.length > 0) {
      systemPrompt += `\n\n## RECENT CONVERSATION CONTEXT:`;
      behaviorData.reverse().slice(0, 5).forEach((data: any) => {
        if (data.user_input && data.ai_response) {
          systemPrompt += `\nVisitor: ${data.user_input}\nYou: ${data.ai_response}`;
        }
      });
    }

    // Add profile info
    systemPrompt += `\n\n## ABOUT ${creatorName}:
- Bio: ${profile?.bio || 'Not specified'}
- Profession: ${profile?.profession || 'Not specified'}

## RESPONSE GUIDELINES:
1. Always respond AS ${creatorName}, not as an AI assistant.
2. Use the knowledge from Q&A pairs, documents, and web content when relevant.
3. If there's a matching Q&A with a custom link, mention it naturally and the system will add a button.
4. Keep responses helpful, on-brand, and consistent with the persona.
5. Format responses professionally:
   - Use bullet points for lists (start with - or •)
   - Use numbered lists for steps (1. 2. 3.)
   - Keep paragraphs short and scannable
   - Use clear headings when organizing multiple topics
6. If relevant Q&A topics exist, briefly mention them so they can be suggested.`;
    
    // Add Q&A topics for related questions
    if (qaPairs.length > 0) {
      systemPrompt += `\n\n## AVAILABLE Q&A TOPICS (mention relevant ones briefly):`;
      qaPairs.slice(0, 10).forEach((qa: any) => {
        systemPrompt += `\n- ${qa.question}`;
      });
    }

    // Determine if a follow-up question should be asked
    let selectedFollowUp: any = null;
    if (followUps.length > 0) {
      // Find matching follow-up based on conditions and probability
      const eligibleFollowUps = followUps.filter((fu: any) => {
        if (fu.probability_pct && Math.random() * 100 > fu.probability_pct) return false;
        return true;
      });
      if (eligibleFollowUps.length > 0) {
        selectedFollowUp = eligibleFollowUps[Math.floor(Math.random() * eligibleFollowUps.length)];
      }
    }

    if (selectedFollowUp) {
      systemPrompt += `\n\n## FOLLOW-UP QUESTION TO ASK:
After your response, ask this follow-up question: "${selectedFollowUp.question_text}"
${selectedFollowUp.choices && selectedFollowUp.choices.length > 0 ? `Offer these options: ${JSON.stringify(selectedFollowUp.choices)}` : ''}`;
    }

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        success: false,
        error_code: ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable.',
        response: "I'm having trouble generating a response right now. Please try again in a moment."
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple token estimation: ~4 chars per token for English
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);
    const inputTokenEstimate = estimateTokens(systemPrompt + userMessage);
    const estimatedOutputTokens = 150; // Average response estimate

    // Split token charging:
    // - Input tokens: charged to the VISITOR (userId) who is asking
    // - Output tokens: charged to the CREATOR (profileId) who owns the AI
    
    // Check creator's token balance for output tokens
    const { data: profileOwner } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('id', profileId)
      .single();

    // Check visitor's token balance for input tokens (if they have an account)
    let visitorBalance: number | null = null;
    if (userId && userId !== profileId) {
      const { data: visitorProfile } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', userId)
        .single();
      visitorBalance = visitorProfile?.token_balance ?? null;
    }

    // Check if visitor has enough tokens for input (if logged in)
    if (userId && userId !== profileId && visitorBalance !== null && visitorBalance < inputTokenEstimate) {
      return new Response(JSON.stringify({ 
        success: false,
        error_code: 'ERR_INSUFFICIENT_TOKENS',
        message: 'You need to top up tokens to continue chatting.',
        response: "⚠️ You don't have enough tokens. Please top up to continue chatting.",
        token_balance: visitorBalance,
        tokens_required: inputTokenEstimate,
        tokenUsage: {
          inputTokens: inputTokenEstimate,
          outputTokens: 0,
          totalTokens: 0,
          remainingBalance: visitorBalance
        }
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if creator has enough tokens for output
    if (profileOwner && profileOwner.token_balance !== null && profileOwner.token_balance < estimatedOutputTokens) {
      return new Response(JSON.stringify({ 
        success: false,
        error_code: 'ERR_CREATOR_INSUFFICIENT_TOKENS',
        message: 'The creator needs to top up tokens.',
        response: "⚠️ The creator's AI is temporarily unavailable. Please try again later.",
        token_balance: profileOwner.token_balance,
        tokens_required: estimatedOutputTokens,
        tokenUsage: {
          inputTokens: 0,
          outputTokens: estimatedOutputTokens,
          totalTokens: 0,
          remainingBalance: profileOwner.token_balance
        }
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Google Gemini API directly with user's own API key
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser message: ${userMessage}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.8,
        },
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
    
    // Parse Gemini API response format
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";

    // Calculate actual tokens used
    const actualOutputTokens = estimateTokens(aiResponse);

    // Split token charging:
    // - Input tokens: charged to the VISITOR (userId) who is asking
    // - Output tokens: charged to the CREATOR (profileId) who owns the AI
    
    let visitorNewBalance = visitorBalance;
    let creatorNewBalance = profileOwner?.token_balance ?? 0;

    // Debit input tokens from visitor (if logged in and not the creator)
    if (userId && userId !== profileId) {
      const { data: visitorDebitResult, error: visitorDebitError } = await supabase
        .rpc('debit_user_tokens', {
          p_user_id: userId,
          p_tokens: inputTokenEstimate,
          p_reason: 'consumption',
          p_model: 'gemini-2.5-flash',
          p_input_tokens: inputTokenEstimate,
          p_output_tokens: 0
        });

      if (visitorDebitError) {
        console.error('Error debiting input tokens from visitor:', visitorDebitError);
      } else {
        visitorNewBalance = visitorDebitResult?.balance ?? (visitorBalance ?? 0) - inputTokenEstimate;
      }
    }

    // Debit output tokens from creator
    const { data: creatorDebitResult, error: creatorDebitError } = await supabase
      .rpc('debit_user_tokens', {
        p_user_id: profileId,
        p_tokens: actualOutputTokens,
        p_reason: 'consumption',
        p_model: 'gemini-2.5-flash',
        p_input_tokens: 0,
        p_output_tokens: actualOutputTokens
      });

    if (creatorDebitError) {
      console.error('Error debiting output tokens from creator:', creatorDebitError);
    } else {
      creatorNewBalance = creatorDebitResult?.balance ?? (profileOwner?.token_balance ?? 0) - actualOutputTokens;
    }

    const totalTokensUsed = inputTokenEstimate + actualOutputTokens;

    // Build rich data from Q&A pairs and web links
    const richData: {
      buttons: Array<{ text: string; url: string }>;
      links: Array<{ url: string; title: string; preview: string }>;
      documents: Array<{ filename: string; type: string; preview: string }>;
      followUp?: { id: string; question: string; choices: string[] };
      relatedQuestions: Array<{ question: string }>;
      lists: Array<{ title: string; items: string[] }>;
      cards: Array<{ title: string; description: string; action?: { text: string; url: string } }>;
    } = {
      buttons: [],
      links: [],
      documents: [],
      relatedQuestions: [],
      lists: [],
      cards: []
    };
    
    // Match Q&A pairs and add buttons + related questions
    if (qaPairs.length > 0) {
      const userMessageLower = userMessage.toLowerCase();
      const responseMessageLower = aiResponse.toLowerCase();
      
      qaPairs.forEach((qa: any) => {
        const questionWords = qa.question.toLowerCase().split(' ').filter((w: string) => w.length > 3);
        const tagsArray = qa.tags || [];
        
        // Match by question words
        let matchScore = questionWords.filter((word: string) => 
          userMessageLower.includes(word) || responseMessageLower.includes(word)
        ).length;
        
        // Boost score if any tag matches user message
        tagsArray.forEach((tag: string) => {
          if (userMessageLower.includes(tag.toLowerCase())) {
            matchScore += 3; // Strong boost for tag match
          }
        });
        
        // Add button if there's a link and good match
        if (matchScore >= 2 && qa.custom_link_url) {
          richData.buttons.push({
            text: qa.custom_link_button_name || 'Learn More',
            url: qa.custom_link_url
          });
        }
        
        // Add as related question if partial match
        if (matchScore >= 1 && !userMessageLower.includes(qa.question.toLowerCase().substring(0, 20))) {
          richData.relatedQuestions.push({
            question: qa.question.length > 50 ? qa.question.substring(0, 50) + '...' : qa.question
          });
        }
      });
      
      // Limit related questions to top 3
      richData.relatedQuestions = richData.relatedQuestions.slice(0, 3);
    }
    
    // Add web training data as link previews
    if (webData.length > 0) {
      webData.forEach((web: any) => {
        try {
          const urlDomain = new URL(web.url).hostname;
          if (userMessage.toLowerCase().includes(urlDomain.replace('www.', '')) || 
              (web.scraped_content && aiResponse.toLowerCase().includes(urlDomain.replace('www.', '')))) {
            richData.links.push({
              url: web.url,
              title: web.url,
              preview: web.scraped_content ? web.scraped_content.substring(0, 150) + '...' : ''
            });
          }
        } catch {}
      });
    }
    
    // Add document references and convert to cards
    if (documents.length > 0) {
      documents.forEach((doc: any) => {
        const docNameLower = doc.filename.toLowerCase().split('.')[0];
        if (aiResponse.toLowerCase().includes(docNameLower)) {
          richData.documents.push({
            filename: doc.filename,
            type: doc.file_type,
            preview: doc.extracted_content ? doc.extracted_content.substring(0, 100) + '...' : ''
          });
          
          // Also create a card for document reference
          richData.cards.push({
            title: doc.filename,
            description: doc.extracted_content ? doc.extracted_content.substring(0, 80) + '...' : 'Reference document'
          });
        }
      });
    }
    
    // Limit cards to 4
    richData.cards = richData.cards.slice(0, 4);

    // Add follow-up question to rich data
    if (selectedFollowUp) {
      richData.followUp = {
        id: selectedFollowUp.id,
        question: selectedFollowUp.question_text,
        choices: selectedFollowUp.choices || []
      };
    }

    // Store the conversation
    if (userId) {
      await supabase.from('behavior_learning_data').insert({
        user_id: profileId,
        interaction_type: 'ai_response',
        user_input: userMessage,
        ai_response: aiResponse,
        context_data: { 
          timestamp: new Date().toISOString(),
          requester_id: userId,
          rich_data: richData,
          visitor_name: visitorName
        }
      });
    }

    const hasRichData = richData.buttons.length > 0 || richData.links.length > 0 || richData.documents.length > 0 || richData.followUp || richData.relatedQuestions.length > 0 || richData.cards.length > 0;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        personality: trainingData?.personality_settings || null,
        richData: hasRichData ? richData : null,
        tokenUsage: {
          inputTokens: inputTokenEstimate,
          outputTokens: actualOutputTokens,
          totalTokens: totalTokensUsed,
          visitorBalance: visitorNewBalance,
          creatorBalance: creatorNewBalance,
          chargedTo: {
            input: userId && userId !== profileId ? 'visitor' : 'creator',
            output: 'creator'
          }
        }
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

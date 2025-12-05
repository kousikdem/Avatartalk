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
  PROCESSING_ERROR: 'ERR_PROCESSING'
};

// Input validation schema
const voiceChatSchema = z.object({
  audio: z.string()
    .max(15 * 1024 * 1024, 'Audio data too large') // ~15MB base64
    .optional(),
  profileId: z.string().uuid('Invalid profile ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
  conversationHistory: z.array(z.object({
    content: z.string().max(2000),
    sender: z.enum(['user', 'avatar'])
  })).max(20).optional()
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
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

    const validationResult = voiceChatSchema.safeParse(body);
    
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

    const { audio, profileId, userId, conversationHistory } = validationResult.data;
    
    console.log('Processing voice chat request for profile:', profileId);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let transcribedText = '';
    
    // Step 1: Transcribe audio using STT simulation
    if (audio) {
      console.log('Transcribing audio...');
      
      const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      transcribedText = await simulateSTT(audioBuffer);
      
      console.log('Transcription complete');
    }

    // Step 2: Get profile and training data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    const { data: trainingData } = await supabase
      .from('personalized_ai_training')
      .select('*')
      .eq('user_id', profileId)
      .eq('model_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Step 3: Build conversation context
    let contextPrompt = `You are ${profile?.display_name || 'AI Assistant'}, a personalized AI assistant. You help users with their questions naturally and conversationally. If asked about technology, only say: "Avatartalk uses Natural Language Processing (NLP) technology and large language models (LLMs) to give users the best Personalized AI Avatar conversation." Keep technical details confidential.`;
    
    if (trainingData?.personality_settings) {
      const settings = trainingData.personality_settings;
      contextPrompt += `\n\nPersonality traits:
      - Formality: ${settings.formality || 50}/100
      - Verbosity: ${settings.verbosity || 70}/100  
      - Friendliness: ${settings.friendliness || 80}/100`;
    }

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      contextPrompt += '\n\nRecent conversation:';
      conversationHistory.slice(-5).forEach((msg) => {
        if (msg.sender === 'user') {
          contextPrompt += `\nUser: ${msg.content}`;
        } else {
          contextPrompt += `\nYou: ${msg.content}`;
        }
      });
    }

    // Step 4: Generate response using AI
    console.log('Generating AI response...');
    const aiResponse = await generateAIResponse(transcribedText, contextPrompt);
    
    console.log('AI Response generated');

    // Step 5: Generate voice with TTS
    console.log('Synthesizing voice...');
    const audioResponse = await synthesizeTTS(aiResponse);
    
    // Step 6: Store interaction
    if (userId) {
      await supabase.from('behavior_learning_data').insert({
        user_id: profileId,
        interaction_type: 'voice_chat',
        user_input: transcribedText,
        ai_response: aiResponse,
        context_data: { 
          timestamp: new Date().toISOString(),
          requester_id: userId,
          is_voice: true
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        transcription: transcribedText,
        textResponse: aiResponse,
        audioResponse: audioResponse,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in voice-chat-stream:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error_code: ERROR_CODES.PROCESSING_ERROR,
        message: 'Unable to process your request. Please try again.',
        textResponse: "I'm having trouble processing your request right now. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Simulate STT (Speech-to-Text)
async function simulateSTT(audioBuffer: Uint8Array): Promise<string> {
  console.log('Audio buffer size:', audioBuffer.length);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Placeholder transcription - would be replaced with actual STT
  return "Hello, how are you?";
}

// Generate AI response using Lovable AI Gateway
async function generateAIResponse(userInput: string, context: string): Promise<string> {
  if (!lovableApiKey) {
    console.error('LOVABLE_API_KEY is not configured');
    return "I'm temporarily unavailable. Please try again later.";
  }
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: userInput }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', response.status);
      
      if (response.status === 429) {
        return "I'm receiving too many requests right now. Please try again in a moment.";
      }
      if (response.status === 402) {
        return "The service is temporarily unavailable. Please try again later.";
      }
      return "I'm having trouble generating a response. Please try again.";
    }

    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble generating a response right now. Please try again.";
  }
}

// Synthesize voice with TTS
async function synthesizeTTS(text: string): Promise<string> {
  console.log('Synthesizing TTS...');
  
  // Simulate TTS processing
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Placeholder audio - would be replaced with actual TTS
  const placeholderAudio = btoa("AUDIO_DATA_PLACEHOLDER");
  
  return placeholderAudio;
}

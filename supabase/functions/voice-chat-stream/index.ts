import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, profileId, userId, conversationHistory } = await req.json();
    
    console.log('🎙️ Processing voice chat request for profile:', profileId);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let transcribedText = '';
    
    // Step 1: Transcribe audio using Faster-Whisper simulation
    if (audio) {
      console.log('🎤 Transcribing audio with Faster-Whisper...');
      
      // Simulate Faster-Whisper STT processing
      // In production, this would call actual Faster-Whisper API
      const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      
      // Simulated transcription - would be replaced with actual API call
      transcribedText = await simulateFasterWhisperSTT(audioBuffer);
      
      console.log('✅ Transcription complete:', transcribedText);
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
      conversationHistory.slice(-5).forEach((msg: any) => {
        if (msg.sender === 'user') {
          contextPrompt += `\nUser: ${msg.content}`;
        } else {
          contextPrompt += `\nYou: ${msg.content}`;
        }
      });
    }

    // Step 4: Generate response using Lovable AI Gateway
    console.log('🤖 Generating response with AI...');
    const aiResponse = await generateAIResponse(transcribedText, contextPrompt);
    
    console.log('✅ AI Response generated:', aiResponse);

    // Step 5: Generate voice with TTS
    console.log('🔊 Synthesizing voice with TTS...');
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
    console.error('❌ Error in voice-chat-stream:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
async function simulateFasterWhisperSTT(audioBuffer: Uint8Array): Promise<string> {
  // In production, this would call actual STT service
  console.log('📊 Audio buffer size:', audioBuffer.length);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Placeholder transcription - would be replaced with actual STT
  return "Hello, how are you?";
}

// Generate AI response using Lovable AI Gateway
async function generateAIResponse(userInput: string, context: string): Promise<string> {
  if (!lovableApiKey) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }
  
  console.log('🧠 Processing with Lovable AI...');
  
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
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return "I'm receiving too many requests right now. Please try again in a moment.";
      }
      if (response.status === 402) {
        return "The AI service is temporarily unavailable. Please try again later.";
      }
      throw new Error('Failed to generate response');
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
  // In production, this would call actual TTS service
  console.log('🎵 Synthesizing with TTS...');
  
  // Simulate TTS processing
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Placeholder audio - would be replaced with actual TTS
  const placeholderAudio = btoa("AUDIO_DATA_PLACEHOLDER");
  
  return placeholderAudio;
}

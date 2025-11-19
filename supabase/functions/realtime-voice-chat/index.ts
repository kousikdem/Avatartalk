import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Process audio chunks for Faster-Whisper (OpenAI Whisper)
async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    const binaryAudio = atob(audioBase64);
    const bytes = new Uint8Array(binaryAudio.length);
    for (let i = 0; i < binaryAudio.length; i++) {
      bytes[i] = binaryAudio.charCodeAt(i);
    }

    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${await response.text()}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

// Generate AI response using Mixtral 8x7B
async function generateAIResponse(
  text: string,
  profileId: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile and training data
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

    let personalityPrompt = `You are ${profile?.display_name || 'AI Assistant'}, powered by Avatartalk personalized AI using Mixtral 8x7B with multilingual support.`;

    if (trainingData?.personality_settings) {
      const settings = trainingData.personality_settings;
      personalityPrompt += `\n\nPersonality traits:
      - Formality: ${settings.formality || 50}/100
      - Verbosity: ${settings.verbosity || 70}/100  
      - Friendliness: ${settings.friendliness || 80}/100`;
    }

    const messages = [
      { role: 'system', content: personalityPrompt },
      ...conversationHistory,
      { role: 'user', content: text }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'AvatarTalk Realtime Voice Chat',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mixtral API error: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

// Synthesize speech using OpenVoice (OpenAI TTS)
async function synthesizeSpeech(text: string, voice: string = 'alloy'): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${await response.text()}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );
    
    return base64Audio;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, profileId, conversationHistory, voice } = await req.json();

    if (!audio || !profileId) {
      throw new Error('Audio data and profile ID are required');
    }

    console.log('🎤 Starting realtime voice processing...');

    // Step 1: Transcribe audio using Faster-Whisper (OpenAI Whisper)
    console.log('🎯 Transcribing with Faster-Whisper...');
    const transcribedText = await transcribeAudio(audio);
    console.log('✅ Transcription:', transcribedText);

    // Step 2: Generate AI response using Mixtral 8x7B
    console.log('🧠 Generating response with Mixtral 8x7B...');
    const aiResponse = await generateAIResponse(
      transcribedText,
      profileId,
      conversationHistory || []
    );
    console.log('✅ AI Response:', aiResponse);

    // Step 3: Synthesize speech using OpenVoice (OpenAI TTS)
    console.log('🔊 Synthesizing speech with OpenVoice...');
    const audioContent = await synthesizeSpeech(aiResponse, voice || 'alloy');
    console.log('✅ Speech synthesized');

    return new Response(
      JSON.stringify({
        success: true,
        transcription: transcribedText,
        response: aiResponse,
        audioContent: audioContent,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in realtime voice chat:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

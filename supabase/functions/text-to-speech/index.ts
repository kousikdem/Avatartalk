import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const textSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(5000, 'Text too long'),
  user_id: z.string().optional(),
  profile_id: z.string().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openVoiceUrl = Deno.env.get('OPENVOICE_URL') || 'http://localhost:8001';
    
    const body = await req.json();
    const validationResult = textSchema.safeParse(body);
    
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

    const { text, user_id, profile_id } = validationResult.data;

    console.log(`🎤 Generating personalized speech with OpenVoice (${text.length} chars)`);

    // Get user profile for voice personalization
    let voiceSettings = {
      speaker: 'default',
      style: 'default',
      speed: 1.0,
    };

    if (user_id || profile_id) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        );

        const targetId = profile_id || user_id;
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (profile) {
          // Customize voice based on profile (gender, age, etc.)
          voiceSettings = {
            speaker: profile.gender === 'female' ? 'female_voice' : 'male_voice',
            style: profile.age && profile.age < 30 ? 'young' : 'mature',
            speed: 1.0,
          };
          console.log('✅ Using personalized voice settings:', voiceSettings);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch profile, using default voice:', error);
      }
    }

    // Call OpenVoice API
    const response = await fetch(`${openVoiceUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speaker: voiceSettings.speaker,
        style: voiceSettings.style,
        speed: voiceSettings.speed,
        language: 'en',
        output_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenVoice API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'Text-to-speech generation failed',
        details: errorText
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('✅ Personalized speech generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      audio: base64Audio,
      format: 'mp3',
      voice_settings: voiceSettings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in text-to-speech function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

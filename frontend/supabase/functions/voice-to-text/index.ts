import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Error codes for generic responses
const ERROR_CODES = {
  INVALID_INPUT: 'ERR_INVALID_INPUT',
  PROCESSING_ERROR: 'ERR_PROCESSING'
};

// Input validation schema
const audioSchema = z.object({
  audio: z.string()
    .min(1, 'Audio data cannot be empty')
    .refine(
      (val) => {
        // Check if it's valid base64
        try {
          const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
          return base64Pattern.test(val);
        } catch {
          return false;
        }
      },
      'Invalid audio data format'
    )
    .refine(
      (val) => {
        // Limit size to ~10MB (base64 encoded)
        const sizeInBytes = (val.length * 3) / 4;
        const maxSize = 10 * 1024 * 1024; // 10MB
        return sizeInBytes <= maxSize;
      },
      'Audio data exceeds size limit'
    )
});

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Convert audio to WAV format for STT
function convertToWav(audioData: Uint8Array, sampleRate = 16000): Uint8Array {
  const length = audioData.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Convert audio data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    view.setInt16(offset, audioData[i] * 0x7FFF, true);
    offset += 2;
  }
  
  return new Uint8Array(arrayBuffer);
}

// Simple voice activity detection
function detectSpeech(audioData: Uint8Array): boolean {
  const threshold = 0.01;
  let sum = 0;
  
  for (let i = 0; i < audioData.length; i++) {
    sum += Math.abs(audioData[i]);
  }
  
  const average = sum / audioData.length;
  return average > threshold;
}

// STT implementation
async function transcribeAudio(audioData: Uint8Array): Promise<string> {
  try {
    // Convert to WAV format
    const wavData = convertToWav(audioData);
    
    // Check if there's speech in the audio
    if (!detectSpeech(audioData)) {
      return "";
    }
    
    // Simulated transcription result
    // In production, this would be the actual STT output
    return "STT transcription would appear here";
    
  } catch (error) {
    console.error('STT error:', error);
    throw new Error('Speech processing failed');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    const validationResult = audioSchema.safeParse(body);
    
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
    
    const { audio } = validationResult.data;

    console.log('Processing audio for transcription...');

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Use STT for transcription
    const transcription = await transcribeAudio(binaryAudio);

    console.log('Transcription completed');

    return new Response(
      JSON.stringify({ 
        success: true,
        text: transcription,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Voice-to-text error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error_code: ERROR_CODES.PROCESSING_ERROR,
        message: 'Unable to process audio. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

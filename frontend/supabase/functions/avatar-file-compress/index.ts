import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { filePath, bucket, format } = await req.json();

    console.log('Compressing file:', { filePath, bucket, format, userId: user.id });

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from(bucket)
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert to ArrayBuffer for processing
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Compress based on format
    let compressedData: Uint8Array;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'glb':
      case 'gltf':
      case 'fbx':
        // For 3D formats, we'll compress using gzip
        compressedData = await compressWithGzip(uint8Array);
        mimeType = 'application/octet-stream';
        fileExtension = format;
        break;
      
      case 'gif':
        // GIF files - basic compression
        compressedData = uint8Array; // Keep as-is for GIF
        mimeType = 'image/gif';
        fileExtension = 'gif';
        break;
      
      case 'json':
        // JSON compression using gzip
        compressedData = await compressWithGzip(uint8Array);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Generate compressed file path
    const compressedPath = filePath.replace(/\.[^/.]+$/, `_compressed.${fileExtension}`);

    // Upload compressed file
    const { error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(compressedPath, compressedData, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload compressed file: ${uploadError.message}`);
    }

    // Generate public URL for compressed file
    const { data: publicUrlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(compressedPath);

    const compressionRatio = ((1 - (compressedData.length / uint8Array.length)) * 100).toFixed(2);

    console.log('Compression complete:', {
      originalSize: uint8Array.length,
      compressedSize: compressedData.length,
      compressionRatio: `${compressionRatio}%`,
      compressedPath,
    });

    return new Response(
      JSON.stringify({
        success: true,
        compressedUrl: publicUrlData.publicUrl,
        compressedPath,
        originalSize: uint8Array.length,
        compressedSize: compressedData.length,
        compressionRatio: `${compressionRatio}%`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error compressing file:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper function to compress data using gzip
async function compressWithGzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });

  const compressedStream = stream.pipeThrough(
    new CompressionStream('gzip')
  );

  const chunks: Uint8Array[] = [];
  const reader = compressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine all chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

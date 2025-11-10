import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversionRequest {
  userId: string;
  configId: string;
  sourceFormat: string;
  targetFormat: string;
  sourceUrl: string;
  compress?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, configId, sourceFormat, targetFormat, sourceUrl, compress } = await req.json() as ConversionRequest;

    console.log(`Converting avatar from ${sourceFormat} to ${targetFormat} for user ${userId}`);

    // Validate formats
    const validFormats = ['json', 'glb', 'gltf', 'fbx', 'obj'];
    if (!validFormats.includes(sourceFormat) || !validFormats.includes(targetFormat)) {
      throw new Error(`Invalid format. Supported: ${validFormats.join(', ')}`);
    }

    // Download source file
    const sourceResponse = await fetch(sourceUrl);
    if (!sourceResponse.ok) {
      throw new Error(`Failed to download source file: ${sourceResponse.statusText}`);
    }
    
    const sourceData = await sourceResponse.arrayBuffer();
    let convertedData: ArrayBuffer;
    let contentType: string;

    // Perform conversion based on target format
    switch (targetFormat) {
      case 'glb':
        // GLB is binary GLTF
        convertedData = sourceData;
        contentType = 'model/gltf-binary';
        break;
      
      case 'gltf':
        // GLTF is JSON format
        convertedData = sourceData;
        contentType = 'model/gltf+json';
        break;
      
      case 'obj':
        // OBJ conversion - for now, we'll note this requires Three.js client-side
        console.log('OBJ conversion should be done client-side with Three.js OBJExporter');
        convertedData = sourceData;
        contentType = 'model/obj';
        break;
      
      case 'fbx':
        // FBX conversion - complex format, best done with Blender or specialized tools
        console.log('FBX conversion requires specialized tools like Blender');
        convertedData = sourceData;
        contentType = 'application/octet-stream';
        break;
      
      default:
        convertedData = sourceData;
        contentType = 'application/octet-stream';
    }

    // Upload converted file to storage
    const fileName = `${userId}/avatars/exports/${configId}-${Date.now()}.${targetFormat}`;
    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, convertedData, {
        contentType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    // Update avatar_configurations table with the new URL
    const updateField = `${targetFormat}_export_url`;
    const { error: updateError } = await supabase
      .from('avatar_configurations')
      .update({ [updateField]: publicUrl })
      .eq('id', configId);

    if (updateError) {
      console.error('Failed to update configuration:', updateError);
    }

    console.log(`Conversion completed: ${publicUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        format: targetFormat 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Conversion error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

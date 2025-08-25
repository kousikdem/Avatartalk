import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, trainingData, personalitySettings, trainingId } = await req.json();

    console.log('AI Training request:', { action, trainingId });

    switch (action) {
      case 'create_training':
        const { data: newTraining, error: createError } = await supabase
          .from('personalized_ai_training')
          .insert({
            training_name: trainingData.name || 'Untitled Training',
            personality_settings: personalitySettings,
            training_data: trainingData,
            model_status: 'draft',
            training_progress: 0
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify({ 
          success: true, 
          training: newTraining 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update_training':
        const { data: updatedTraining, error: updateError } = await supabase
          .from('personalized_ai_training')
          .update({
            personality_settings: personalitySettings,
            training_data: trainingData,
            updated_at: new Date().toISOString()
          })
          .eq('id', trainingId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ 
          success: true, 
          training: updatedTraining 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'train_model':
        // Simulate AI training process with Luma 4 Scout integration
        console.log('Starting AI model training...');
        
        // Update status to training
        await supabase
          .from('personalized_ai_training')
          .update({
            model_status: 'training',
            training_progress: 10
          })
          .eq('id', trainingId);

        // Simulate training progress updates
        const progressSteps = [25, 50, 75, 90, 100];
        for (const progress of progressSteps) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await supabase
            .from('personalized_ai_training')
            .update({
              training_progress: progress,
              model_status: progress === 100 ? 'completed' : 'training'
            })
            .eq('id', trainingId);
          
          console.log(`Training progress: ${progress}%`);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'AI model training completed',
          progress: 100 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_training':
        const { data: training, error: getError } = await supabase
          .from('personalized_ai_training')
          .select('*')
          .eq('id', trainingId)
          .single();

        if (getError) throw getError;

        return new Response(JSON.stringify({ 
          success: true, 
          training 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'list_trainings':
        const { data: trainings, error: listError } = await supabase
          .from('personalized_ai_training')
          .select('*')
          .order('created_at', { ascending: false });

        if (listError) throw listError;

        return new Response(JSON.stringify({ 
          success: true, 
          trainings 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in personalized-ai-training function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
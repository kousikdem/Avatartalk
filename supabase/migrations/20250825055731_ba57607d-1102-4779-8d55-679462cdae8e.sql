-- Create personalized AI training table
CREATE TABLE public.personalized_ai_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  training_name TEXT NOT NULL,
  personality_settings JSONB DEFAULT '{
    "formality": 50,
    "verbosity": 70,
    "friendliness": 80,
    "mode": "adaptive",
    "behavior_learning": true
  }'::jsonb,
  voice_settings JSONB DEFAULT '{}'::jsonb,
  training_data JSONB DEFAULT '{}'::jsonb,
  model_status TEXT DEFAULT 'draft',
  training_progress NUMERIC DEFAULT 0,
  voice_model_id TEXT,
  scenario_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personalized_ai_training ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own AI training"
ON public.personalized_ai_training
FOR ALL
USING (auth.uid() = user_id);

-- Create voice cloning table
CREATE TABLE public.voice_cloning (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_voice_path TEXT NOT NULL,
  cloned_voice_path TEXT,
  voice_model_id TEXT,
  clone_status TEXT DEFAULT 'processing',
  voice_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_cloning ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own voice cloning"
ON public.voice_cloning
FOR ALL
USING (auth.uid() = user_id);

-- Create behavior learning data table enhancement
ALTER TABLE public.behavior_learning_data 
ADD COLUMN IF NOT EXISTS learning_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS personality_impact JSONB DEFAULT '{}'::jsonb;

-- Create scenario templates table
CREATE TABLE public.scenario_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  personality_preset JSONB NOT NULL,
  training_prompts JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scenario_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all templates and manage their own"
ON public.scenario_templates
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own templates"
ON public.scenario_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own templates"
ON public.scenario_templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.scenario_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Insert default scenario templates
INSERT INTO public.scenario_templates (user_id, template_name, template_type, personality_preset, training_prompts, is_default) VALUES
(NULL, 'Customer Support', 'support', '{"formality": 70, "verbosity": 60, "friendliness": 90, "mode": "human"}', '[
  "How can I help you with your issue today?",
  "I understand your concern. Let me look into that for you.",
  "Thank you for contacting support. I will resolve this quickly."
]', true),
(NULL, 'Sales Assistant', 'sales', '{"formality": 60, "verbosity": 80, "friendliness": 85, "mode": "adaptive"}', '[
  "What brings you here today? How can I help you find the perfect solution?",
  "That is a great question! Let me show you how our product can help.",
  "I would love to learn more about your needs so I can recommend the best option."
]', true),
(NULL, 'Technical Assistant', 'tech', '{"formality": 80, "verbosity": 90, "friendliness": 70, "mode": "robot"}', '[
  "I can help you troubleshoot that technical issue step by step.",
  "Let me provide you with the most accurate technical solution.",
  "Here is the precise technical information you need."
]', true),
(NULL, 'Marketing Expert', 'marketing', '{"formality": 50, "verbosity": 85, "friendliness": 80, "mode": "human"}', '[
  "Let us create an amazing marketing strategy that resonates with your audience!",
  "I have some creative ideas that could really boost your campaigns.",
  "Marketing is all about connecting with people - let me help you do that effectively."
]', true);

-- Create trigger for updated_at
CREATE TRIGGER update_personalized_ai_training_updated_at
BEFORE UPDATE ON public.personalized_ai_training
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_cloning_updated_at
BEFORE UPDATE ON public.voice_cloning
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenario_templates_updated_at
BEFORE UPDATE ON public.scenario_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
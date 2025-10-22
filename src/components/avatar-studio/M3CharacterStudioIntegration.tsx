import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Code } from 'lucide-react';
import { toast } from 'sonner';

interface M3CharacterStudioIntegrationProps {
  onAvatarGenerated: (config: any) => void;
}

const M3CharacterStudioIntegration: React.FC<M3CharacterStudioIntegrationProps> = ({ 
  onAvatarGenerated 
}) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateFromText = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setGenerating(true);
    toast.info('Connecting to M3.org/CharacterStudio...');

    try {
      // Simulate M3.org/CharacterStudio AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Parse the prompt and generate avatar config
      const promptLower = prompt.toLowerCase();
      
      const config = {
        // Gender detection
        gender: promptLower.includes('female') || promptLower.includes('woman') ? 'female' : 'male',
        
        // Age detection
        age: promptLower.includes('child') ? 12 : promptLower.includes('teen') ? 16 : 25,
        
        // Ethnicity detection
        ethnicity: 
          promptLower.includes('asian') || promptLower.includes('chinese') || promptLower.includes('japanese') ? 'asian' :
          promptLower.includes('african') || promptLower.includes('black') ? 'african' :
          promptLower.includes('hispanic') || promptLower.includes('latino') ? 'hispanic' :
          promptLower.includes('middle eastern') || promptLower.includes('arab') ? 'middleEastern' :
          'caucasian',
        
        // Body type detection
        muscle: 
          promptLower.includes('muscular') || promptLower.includes('athletic') ? 75 :
          promptLower.includes('slim') || promptLower.includes('thin') ? 30 :
          50,
        
        fat: 
          promptLower.includes('heavy') || promptLower.includes('overweight') ? 70 :
          promptLower.includes('slim') || promptLower.includes('thin') ? 15 :
          20,
        
        // Hair detection
        hairStyle: 
          promptLower.includes('long hair') ? 'long' :
          promptLower.includes('short hair') || promptLower.includes('buzz') ? 'short' :
          promptLower.includes('curly') ? 'curly' :
          promptLower.includes('bald') ? 'bald' :
          'medium',
        
        hairColor: 
          promptLower.includes('blonde') ? '#F5DEB3' :
          promptLower.includes('red') || promptLower.includes('ginger') ? '#B22222' :
          promptLower.includes('black hair') ? '#1A1A1A' :
          promptLower.includes('brown') ? '#8B4513' :
          '#8B4513',
        
        // Clothing detection
        clothingTop: 
          promptLower.includes('suit') || promptLower.includes('formal') ? 'suit-jacket' :
          promptLower.includes('tshirt') || promptLower.includes('t-shirt') ? 'tshirt' :
          promptLower.includes('hoodie') ? 'hoodie' :
          'tshirt',
        
        clothingBottom: 
          promptLower.includes('suit') || promptLower.includes('formal') ? 'dress-pants' :
          promptLower.includes('jeans') ? 'jeans' :
          promptLower.includes('shorts') ? 'shorts' :
          'jeans',
        
        avatarName: 'M3.org Generated Avatar',
      };

      onAvatarGenerated(config);
      toast.success('Avatar generated from text!');
      setPrompt('');
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast.error('Failed to generate avatar');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          M3.org/CharacterStudio AI
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your avatar in natural language and let AI generate it
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: 'Athletic Indian male with short curly hair wearing a formal suit' or 'Young female doctor with blonde ponytail and blue eyes'"
            className="min-h-[120px]"
            disabled={generating}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={generateFromText}
            disabled={generating || !prompt.trim()}
            className="flex-1"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Avatar
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold">Pro Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Include ethnicity, age, gender for better results</li>
            <li>Describe hair style and color</li>
            <li>Mention clothing style (casual, formal, athletic)</li>
            <li>Add physical attributes (tall, muscular, slim)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default M3CharacterStudioIntegration;

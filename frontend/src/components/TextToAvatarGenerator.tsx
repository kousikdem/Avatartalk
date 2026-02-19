import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Type } from 'lucide-react';
import { toast } from 'sonner';

interface TextToAvatarGeneratorProps {
  onAvatarGenerated: (config: any) => void;
}

const TextToAvatarGenerator: React.FC<TextToAvatarGeneratorProps> = ({ onAvatarGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const examplePrompts = [
    "Athletic Indian male with short curly hair wearing a formal suit",
    "Young Asian female doctor with long straight black hair and glasses",
    "Middle-aged African American businessman in navy suit with short beard",
    "Teenage girl with blonde ponytail wearing casual sporty clothes",
    "Hispanic male chef in professional white uniform with mustache"
  ];

  const generateFromPrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setGenerating(true);
    try {
      // Simulate AI prompt-to-avatar generation
      // In production, this would call M3.org/CharacterStudio API
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Parse prompt for keywords
      const lower = prompt.toLowerCase();
      
      const avatarConfig = {
        gender: lower.includes('female') || lower.includes('woman') || lower.includes('girl') ? 'female' : 'male',
        age: lower.includes('young') || lower.includes('teen') ? 22 :
              lower.includes('middle') || lower.includes('aged') ? 40 :
              lower.includes('old') || lower.includes('senior') ? 60 : 30,
        ethnicity: lower.includes('asian') ? 'asian' :
                  lower.includes('african') || lower.includes('black') ? 'african' :
                  lower.includes('hispanic') || lower.includes('latin') ? 'hispanic' : 'caucasian',
        height: lower.includes('tall') ? 185 : lower.includes('short') ? 165 : 175,
        weight: lower.includes('athletic') || lower.includes('fit') ? 75 :
                lower.includes('slim') || lower.includes('thin') ? 65 : 70,
        muscle: lower.includes('athletic') || lower.includes('muscular') ? 75 : 50,
        fat: lower.includes('athletic') ? 12 : 20,
        hairStyle: lower.includes('curly') ? 'curly' :
                  lower.includes('long') ? 'long' :
                  lower.includes('ponytail') ? 'ponytail' :
                  lower.includes('bald') ? 'bald' : 'medium',
        hairColor: lower.includes('blonde') || lower.includes('blond') ? '#F5DEB3' :
                  lower.includes('black') ? '#000000' :
                  lower.includes('brown') ? '#8B4513' :
                  lower.includes('red') || lower.includes('ginger') ? '#C84027' : '#654321',
        skinTone: lower.includes('asian') ? '#F4E4C1' :
                 lower.includes('african') || lower.includes('black') ? '#8D5524' :
                 lower.includes('hispanic') || lower.includes('latin') ? '#D2936D' : '#F1C27D',
        eyeColor: lower.includes('blue') ? '#4A90E2' :
                 lower.includes('green') ? '#50C878' :
                 lower.includes('brown') ? '#8B4513' : '#654321',
        clothingTop: lower.includes('suit') || lower.includes('formal') ? 'suit' :
                    lower.includes('casual') ? 'tshirt' :
                    lower.includes('doctor') || lower.includes('chef') || lower.includes('uniform') ? 'uniform' :
                    lower.includes('sport') ? 'sportwear' : 'shirt',
        clothingBottom: lower.includes('suit') || lower.includes('formal') ? 'dress pants' :
                       lower.includes('sport') ? 'athletic' : 'jeans',
        shoes: lower.includes('formal') || lower.includes('suit') ? 'formal' :
              lower.includes('sport') || lower.includes('athletic') ? 'athletic' : 'sneakers',
        accessories: lower.includes('glasses') ? ['glasses'] : [],
        facialHair: lower.includes('beard') ? 'full' :
                   lower.includes('mustache') ? 'mustache' :
                   lower.includes('goatee') ? 'goatee' : 'none',
        currentExpression: 'professional',
        currentPose: 'confident',
        avatarName: 'AI Generated Avatar',
      };

      onAvatarGenerated(avatarConfig);
      toast.success('Avatar generated from your description!');
    } catch (error) {
      toast.error('Failed to generate avatar');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5 text-primary" />
          Text to Avatar Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Describe your avatar in natural language and AI will create it for you!</p>
          <p className="font-semibold">Include details like:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Gender, age, and ethnicity</li>
            <li>Physical features (height, build, hair, eyes)</li>
            <li>Clothing style and accessories</li>
            <li>Profession or personality traits</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe Your Avatar
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Athletic Indian male with short curly hair wearing a formal suit..."
              className="min-h-32 resize-none"
              disabled={generating}
            />
          </div>

          <Button
            onClick={generateFromPrompt}
            disabled={generating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Avatar...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Avatar
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Example Prompts:</p>
          <div className="space-y-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                disabled={generating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {generating && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-semibold">AI Creating Your Avatar...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing prompt and generating character features
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TextToAvatarGenerator;

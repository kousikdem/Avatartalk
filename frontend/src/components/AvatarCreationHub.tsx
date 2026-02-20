import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  MessageSquare, 
  Sliders, 
  Users,
  Sparkles,
  Upload,
  Type
} from 'lucide-react';
import { toast } from 'sonner';
import ImageToAvatarGenerator from './ImageToAvatarGenerator';
import TextToAvatarGenerator from './TextToAvatarGenerator';
import ManualAvatarCreator from './ManualAvatarCreator';
import ReadyMadeAvatars from './ReadyMadeAvatars';

interface AvatarCreationHubProps {
  onAvatarCreated?: (config: any) => void;
}

const AvatarCreationHub: React.FC<AvatarCreationHubProps> = ({ onAvatarCreated }) => {
  const [creationMode, setCreationMode] = useState<'image' | 'text' | 'manual' | 'preset'>('preset');
  const [avatarConfig, setAvatarConfig] = useState<any>(null);

  const handleAvatarGenerated = (config: any) => {
    setAvatarConfig(config);
    onAvatarCreated?.(config);
    toast.success('Avatar created! Customize it further below.');
  };

  return (
    <div className="w-full space-y-6">
      {/* Creation Method Selector */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Choose Your Creation Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant={creationMode === 'image' ? 'default' : 'outline'}
              className="h-auto flex-col gap-3 p-6"
              onClick={() => setCreationMode('image')}
            >
              <Camera className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Image Upload</div>
                <div className="text-xs opacity-70">Generate from photo</div>
              </div>
            </Button>

            <Button
              variant={creationMode === 'text' ? 'default' : 'outline'}
              className="h-auto flex-col gap-3 p-6"
              onClick={() => setCreationMode('text')}
            >
              <Type className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Text Prompt</div>
                <div className="text-xs opacity-70">Describe your avatar</div>
              </div>
            </Button>

            <Button
              variant={creationMode === 'preset' ? 'default' : 'outline'}
              className="h-auto flex-col gap-3 p-6"
              onClick={() => setCreationMode('preset')}
            >
              <Users className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Ready-Made</div>
                <div className="text-xs opacity-70">Quick presets</div>
              </div>
            </Button>

            <Button
              variant={creationMode === 'manual' ? 'default' : 'outline'}
              className="h-auto flex-col gap-3 p-6"
              onClick={() => setCreationMode('manual')}
            >
              <Sliders className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Manual Creation</div>
                <div className="text-xs opacity-70">Full control</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Creation Interface */}
      <div className="animate-fade-in">
        {creationMode === 'image' && (
          <ImageToAvatarGenerator onAvatarGenerated={handleAvatarGenerated} />
        )}
        
        {creationMode === 'text' && (
          <TextToAvatarGenerator onAvatarGenerated={handleAvatarGenerated} />
        )}
        
        {creationMode === 'preset' && (
          <ReadyMadeAvatars onAvatarSelected={handleAvatarGenerated} />
        )}
        
        {creationMode === 'manual' && (
          <ManualAvatarCreator 
            initialConfig={avatarConfig} 
            onConfigChange={handleAvatarGenerated} 
          />
        )}
      </div>
    </div>
  );
};

export default AvatarCreationHub;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { avatarPresets } from '@/data/avatarPresets';
import { User, Sparkles } from 'lucide-react';

interface PresetAvatarSelectorProps {
  onSelectPreset: (preset: any) => void;
  currentGender?: string;
}

const PresetAvatarSelector: React.FC<PresetAvatarSelectorProps> = ({ 
  onSelectPreset, 
  currentGender 
}) => {
  const filteredPresets = currentGender 
    ? avatarPresets.filter(p => p.gender === currentGender)
    : avatarPresets;

  return (
    <Card className="avatar-control-panel">
      <CardHeader className="avatar-section-header">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Ready-Made Avatars
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredPresets.map((preset) => (
              <Card
                key={preset.id}
                className="cursor-pointer hover:border-primary transition-all hover:shadow-lg group"
                onClick={() => onSelectPreset(preset.config)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="text-4xl text-center group-hover:scale-110 transition-transform">
                    {preset.thumbnail}
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-sm">{preset.name}</h4>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {preset.config.gender}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {preset.config.age}y
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Tip: Start with a preset</p>
              <p>Select a preset avatar and customize it to create your unique character. All presets are fully editable!</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresetAvatarSelector;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AvatarConfig } from '@/pages/AvatarPage';

interface AvatarSaveLoadProps {
  currentConfig: AvatarConfig;
  onLoadConfig: (config: AvatarConfig) => void;
}

const AvatarSaveLoad: React.FC<AvatarSaveLoadProps> = ({ currentConfig, onLoadConfig }) => {
  const [saveName, setSaveName] = useState('');
  const [savedAvatars, setSavedAvatars] = useState<Array<{ name: string; config: AvatarConfig }>>([]);
  const { toast } = useToast();

  const saveCurrentAvatar = () => {
    if (!saveName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your avatar.",
        variant: "destructive"
      });
      return;
    }

    const newAvatar = { name: saveName, config: currentConfig };
    setSavedAvatars(prev => [...prev, newAvatar]);
    setSaveName('');
    
    toast({
      title: "Avatar Saved",
      description: `Avatar "${saveName}" has been saved successfully.`,
    });
  };

  const loadAvatar = (config: AvatarConfig) => {
    onLoadConfig(config);
    toast({
      title: "Avatar Loaded",
      description: "Avatar configuration has been applied.",
    });
  };

  const deleteAvatar = (index: number) => {
    setSavedAvatars(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Avatar Deleted",
      description: "Avatar has been removed from saved list.",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Save className="w-6 h-6 text-orange-600" />
          Save & Load
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Save Current Avatar</Label>
          <div className="flex gap-2">
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter avatar name..."
              className="bg-white/70 border-orange-200"
            />
            <Button 
              onClick={saveCurrentAvatar}
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Load Section */}
        {savedAvatars.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Saved Avatars</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedAvatars.map((avatar, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-700">{avatar.name}</span>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => loadAvatar(avatar.config)}
                      size="sm"
                      variant="outline"
                      className="border-green-200 hover:bg-green-50"
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => deleteAvatar(index)}
                      size="sm"
                      variant="outline"
                      className="border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvatarSaveLoad;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Folder, Trash2, User } from 'lucide-react';
import { AvatarConfig } from '@/pages/AvatarPage';
import { useToast } from '@/hooks/use-toast';

interface SavedAvatar {
  id: string;
  name: string;
  config: AvatarConfig;
  createdAt: Date;
}

interface AvatarSaveLoadProps {
  currentConfig: AvatarConfig;
  onLoadConfig: (config: AvatarConfig) => void;
}

const AvatarSaveLoad: React.FC<AvatarSaveLoadProps> = ({ currentConfig, onLoadConfig }) => {
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([]);
  const [saveName, setSaveName] = useState('');
  const { toast } = useToast();

  // Load saved avatars from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedAvatars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((avatar: any) => ({
          ...avatar,
          createdAt: new Date(avatar.createdAt)
        }));
        setSavedAvatars(parsed);
      } catch (error) {
        console.error('Failed to load saved avatars:', error);
      }
    }
  }, []);

  // Save avatars to localStorage whenever the list changes
  const saveTo LocalStorage = (avatars: SavedAvatar[]) => {
    localStorage.setItem('savedAvatars', JSON.stringify(avatars));
  };

  const saveAvatar = () => {
    if (!saveName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your avatar.",
        variant: "destructive"
      });
      return;
    }

    const newAvatar: SavedAvatar = {
      id: Date.now().toString(),
      name: saveName.trim(),
      config: currentConfig,
      createdAt: new Date()
    };

    const updatedAvatars = [...savedAvatars, newAvatar];
    setSavedAvatars(updatedAvatars);
    saveToLocalStorage(updatedAvatars);
    setSaveName('');

    toast({
      title: "Avatar Saved",
      description: `"${newAvatar.name}" has been saved to your collection.`,
    });
  };

  const loadAvatar = (avatar: SavedAvatar) => {
    onLoadConfig(avatar.config);
    toast({
      title: "Avatar Loaded",
      description: `"${avatar.name}" configuration has been applied.`,
    });
  };

  const deleteAvatar = (id: string) => {
    const avatar = savedAvatars.find(a => a.id === id);
    const updatedAvatars = savedAvatars.filter(a => a.id !== id);
    setSavedAvatars(updatedAvatars);
    saveToLocalStorage(updatedAvatars);

    toast({
      title: "Avatar Deleted",
      description: `"${avatar?.name}" has been removed from your collection.`,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Folder className="w-6 h-6 text-green-600" />
          Save & Load
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Save Section */}
        <div className="space-y-3">
          <Label htmlFor="saveName" className="text-sm font-medium text-gray-700">
            Save Current Avatar
          </Label>
          <div className="flex gap-2">
            <Input
              id="saveName"
              placeholder="Enter avatar name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="bg-white border-gray-200"
              onKeyPress={(e) => e.key === 'Enter' && saveAvatar()}
            />
            <Button 
              onClick={saveAvatar}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Load Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Saved Avatars ({savedAvatars.length})
          </Label>
          
          {savedAvatars.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved avatars yet</p>
              <p className="text-xs">Save your first avatar above</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-white/20 hover:bg-white/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {avatar.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {avatar.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadAvatar(avatar)}
                      className="border-blue-200 hover:bg-blue-50 text-xs px-2"
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAvatar(avatar.id)}
                      className="border-red-200 hover:bg-red-50 text-red-600 px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSaveLoad;

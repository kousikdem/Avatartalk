import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shirt, 
  Footprints, 
  Glasses, 
  Crown,
  Palette,
  Smile,
  Camera,
  Download
} from 'lucide-react';

interface AvatarAssetLibraryProps {
  onAssetSelect: (type: string, asset: any) => void;
}

const AvatarAssetLibrary: React.FC<AvatarAssetLibraryProps> = ({ onAssetSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('presets');

  // Avatar Presets with thumbnails
  const avatarPresets = [
    {
      id: 'business-male',
      name: 'Business Male',
      thumbnail: '👨‍💼',
      config: {
        gender: 'male',
        age: 35,
        clothingTop: 'suit',
        hairStyle: 'short',
        currentExpression: 'confident'
      }
    },
    {
      id: 'business-female',
      name: 'Business Female',
      thumbnail: '👩‍💼',
      config: {
        gender: 'female',
        age: 32,
        clothingTop: 'suit',
        hairStyle: 'medium',
        currentExpression: 'confident'
      }
    },
    {
      id: 'casual-young',
      name: 'Casual Young',
      thumbnail: '🧑‍🎓',
      config: {
        gender: 'male',
        age: 22,
        clothingTop: 'hoodie',
        hairStyle: 'medium',
        currentExpression: 'smiling'
      }
    },
    {
      id: 'artistic-female',
      name: 'Artistic Female',
      thumbnail: '👩‍🎨',
      config: {
        gender: 'female',
        age: 28,
        clothingTop: 'tshirt',
        hairStyle: 'curly',
        currentExpression: 'neutral'
      }
    },
    {
      id: 'sporty-male',
      name: 'Sporty Male',
      thumbnail: '🏃‍♂️',
      config: {
        gender: 'male',
        age: 25,
        clothingTop: 'tshirt',
        muscle: 80,
        currentPose: 'confident'
      }
    },
    {
      id: 'elegant-female',
      name: 'Elegant Female',
      thumbnail: '👗',
      config: {
        gender: 'female',
        age: 30,
        clothingTop: 'dress',
        hairStyle: 'long',
        currentExpression: 'smiling'
      }
    }
  ];

  // Hair Styles with visual indicators
  const hairStyles = [
    { id: 'bald', name: 'Bald', icon: '👨‍🦲', description: 'No hair' },
    { id: 'buzz', name: 'Buzz Cut', icon: '✂️', description: 'Very short' },
    { id: 'short', name: 'Short', icon: '👨', description: 'Classic short' },
    { id: 'medium', name: 'Medium', icon: '🧑', description: 'Shoulder length' },
    { id: 'long', name: 'Long', icon: '👩', description: 'Long flowing' },
    { id: 'curly', name: 'Curly', icon: '🌀', description: 'Natural curls' },
    { id: 'afro', name: 'Afro', icon: '👨‍🦱', description: 'Full afro' },
    { id: 'ponytail', name: 'Ponytail', icon: '🎀', description: 'Tied back' },
    { id: 'braids', name: 'Braids', icon: '🔗', description: 'Braided style' }
  ];

  // Clothing Options
  const clothingTops = [
    { id: 'tshirt', name: 'T-Shirt', icon: '👕', description: 'Casual wear' },
    { id: 'shirt', name: 'Dress Shirt', icon: '👔', description: 'Formal shirt' },
    { id: 'hoodie', name: 'Hoodie', icon: '🧥', description: 'Casual hoodie' },
    { id: 'suit', name: 'Suit Jacket', icon: '🤵', description: 'Business suit' },
    { id: 'dress', name: 'Dress', icon: '👗', description: 'Elegant dress' }
  ];

  // Accessories
  const accessories = [
    { id: 'glasses', name: 'Glasses', icon: '👓', description: 'Eyewear' },
    { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️', description: 'Cool shades' },
    { id: 'hat', name: 'Hat', icon: '👒', description: 'Stylish hat' },
    { id: 'cap', name: 'Baseball Cap', icon: '🧢', description: 'Sports cap' },
    { id: 'earrings', name: 'Earrings', icon: '👂', description: 'Jewelry' },
    { id: 'necklace', name: 'Necklace', icon: '📿', description: 'Neck jewelry' },
    { id: 'watch', name: 'Watch', icon: '⌚', description: 'Wrist watch' },
    { id: 'bracelet', name: 'Bracelet', icon: '🔗', description: 'Wrist jewelry' }
  ];

  // Expression Presets
  const expressions = [
    { id: 'neutral', name: 'Neutral', icon: '😐', description: 'Calm expression' },
    { id: 'smiling', name: 'Smiling', icon: '😊', description: 'Happy smile' },
    { id: 'laughing', name: 'Laughing', icon: '😄', description: 'Big laugh' },
    { id: 'surprised', name: 'Surprised', icon: '😲', description: 'Shocked' },
    { id: 'confident', name: 'Confident', icon: '😎', description: 'Self-assured' },
    { id: 'thoughtful', name: 'Thoughtful', icon: '🤔', description: 'Contemplative' },
    { id: 'winking', name: 'Winking', icon: '😉', description: 'Playful wink' },
    { id: 'serious', name: 'Serious', icon: '😤', description: 'Focused look' }
  ];

  // Pose Presets
  const poses = [
    { id: 'standing', name: 'Standing', icon: '🧍', description: 'Upright stance' },
    { id: 'confident', name: 'Confident', icon: '💪', description: 'Powerful pose' },
    { id: 'relaxed', name: 'Relaxed', icon: '😌', description: 'Casual stance' },
    { id: 'professional', name: 'Professional', icon: '👔', description: 'Business pose' },
    { id: 'friendly', name: 'Friendly', icon: '👋', description: 'Welcoming gesture' },
    { id: 'thinking', name: 'Thinking', icon: '🤔', description: 'Contemplative pose' }
  ];

  const renderAssetGrid = (items: any[], type: string) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Button
          key={item.id}
          variant="outline"
          className="avatar-pose-button h-20 flex flex-col gap-1 p-2"
          onClick={() => onAssetSelect(type, item)}
        >
          <span className="text-2xl">{item.icon || item.thumbnail}</span>
          <span className="text-xs font-medium">{item.name}</span>
          {item.description && (
            <span className="text-xs text-muted-foreground truncate">
              {item.description}
            </span>
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <Card className="avatar-control-panel">
      <CardHeader className="avatar-section-header">
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Avatar Asset Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="presets" className="text-xs">
              <User className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="hair" className="text-xs">
              <Palette className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="clothing" className="text-xs">
              <Shirt className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="accessories" className="text-xs">
              <Glasses className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="expressions" className="text-xs">
              <Smile className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="poses" className="text-xs">
              <Footprints className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Avatar Presets</h3>
                <Badge variant="secondary" className="text-xs">
                  {avatarPresets.length} templates
                </Badge>
              </div>
              {renderAssetGrid(avatarPresets, 'preset')}
            </div>
          </TabsContent>

          <TabsContent value="hair" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Hair Styles</h3>
                <Badge variant="secondary" className="text-xs">
                  {hairStyles.length} styles
                </Badge>
              </div>
              {renderAssetGrid(hairStyles, 'hairStyle')}
            </div>
          </TabsContent>

          <TabsContent value="clothing" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Clothing</h3>
                <Badge variant="secondary" className="text-xs">
                  {clothingTops.length} items
                </Badge>
              </div>
              {renderAssetGrid(clothingTops, 'clothingTop')}
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Accessories</h3>
                <Badge variant="secondary" className="text-xs">
                  {accessories.length} items
                </Badge>
              </div>
              {renderAssetGrid(accessories, 'accessory')}
            </div>
          </TabsContent>

          <TabsContent value="expressions" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Expressions</h3>
                <Badge variant="secondary" className="text-xs">
                  {expressions.length} expressions
                </Badge>
              </div>
              {renderAssetGrid(expressions, 'currentExpression')}
            </div>
          </TabsContent>

          <TabsContent value="poses" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Poses</h3>
                <Badge variant="secondary" className="text-xs">
                  {poses.length} poses
                </Badge>
              </div>
              {renderAssetGrid(poses, 'currentPose')}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvatarAssetLibrary;
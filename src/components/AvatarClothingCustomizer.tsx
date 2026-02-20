import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shirt, Crown, Glasses, Watch, ShoppingBag, Palette, Gem } from 'lucide-react';

interface AvatarClothingCustomizerProps {
  config: any;
  onConfigChange: (category: string, key: string, value: any) => void;
}

const AvatarClothingCustomizer: React.FC<AvatarClothingCustomizerProps> = ({ config, onConfigChange }) => {
  const outfits = [
    { id: 'casual', name: 'Casual Wear', icon: Shirt, color: 'bg-blue-500', description: 'Comfortable daily wear' },
    { id: 'business', name: 'Business', icon: ShoppingBag, color: 'bg-gray-700', description: 'Professional attire' },
    { id: 'formal', name: 'Formal', icon: Crown, color: 'bg-purple-600', description: 'Elegant formal wear' },
    { id: 'sports', name: 'Athletic', icon: Shirt, color: 'bg-green-600', description: 'Sportswear & fitness' },
    { id: 'cultural', name: 'Cultural', icon: Crown, color: 'bg-orange-500', description: 'Traditional clothing' },
    { id: 'party', name: 'Party', icon: Crown, color: 'bg-pink-500', description: 'Celebration outfits' },
  ];

  const accessories = [
    { id: 'glasses', name: 'Glasses', icon: Glasses, categories: ['reading', 'sunglasses', 'fashion'] },
    { id: 'hat', name: 'Hats', icon: Crown, categories: ['cap', 'beanie', 'fedora', 'beret'] },
    { id: 'jewelry', name: 'Jewelry', icon: Crown, categories: ['necklace', 'earrings', 'bracelet', 'ring'] },
    { id: 'watch', name: 'Watches', icon: Watch, categories: ['digital', 'analog', 'smart', 'luxury'] },
    { id: 'shoes', name: 'Shoes', icon: Shirt, categories: ['sneakers', 'boots', 'dress', 'sandals'] },
  ];

  const clothingColors = [
    { id: 'black', name: 'Black', color: '#2F2F2F' },
    { id: 'white', name: 'White', color: '#FFFFFF' },
    { id: 'gray', name: 'Gray', color: '#808080' },
    { id: 'navy', name: 'Navy', color: '#1E3A8A' },
    { id: 'blue', name: 'Blue', color: '#3B82F6' },
    { id: 'red', name: 'Red', color: '#EF4444' },
    { id: 'green', name: 'Green', color: '#10B981' },
    { id: 'purple', name: 'Purple', color: '#8B5CF6' },
    { id: 'pink', name: 'Pink', color: '#EC4899' },
    { id: 'yellow', name: 'Yellow', color: '#F59E0B' },
    { id: 'orange', name: 'Orange', color: '#F97316' },
    { id: 'brown', name: 'Brown', color: '#8B4513' },
  ];

  const toggleAccessory = (accessoryId: string) => {
    const currentAccessories = config.clothing?.accessories || [];
    const isSelected = currentAccessories.includes(accessoryId);
    
    if (isSelected) {
      const updatedAccessories = currentAccessories.filter((id: string) => id !== accessoryId);
      onConfigChange('clothing', 'accessories', updatedAccessories);
    } else {
      onConfigChange('clothing', 'accessories', [...currentAccessories, accessoryId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Outfit Selection */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shirt className="w-5 h-5 text-primary" />
            Outfits & Clothing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outfits.map((outfit) => {
              const IconComponent = outfit.icon;
              const isSelected = config.clothing?.outfit === outfit.id;
              
              return (
                <Button
                  key={outfit.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center gap-2 p-4 avatar-pose-button ${
                    isSelected ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
                  }`}
                  onClick={() => onConfigChange('clothing', 'outfit', outfit.id)}
                >
                  <div className={`w-8 h-8 rounded-full ${outfit.color} flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{outfit.name}</div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {outfit.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Clothing Colors */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-5 h-5 text-primary" />
            Clothing Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-6 gap-2">
            {clothingColors.map((color) => (
              <Button
                key={color.id}
                variant={config.clothing?.color === color.color ? "default" : "outline"}
                className={`w-12 h-12 p-0 rounded-lg avatar-color-swatch ${
                  config.clothing?.color === color.color ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                style={{ 
                  backgroundColor: color.color,
                  border: color.color === '#FFFFFF' ? '2px solid #e5e7eb' : 'none'
                }}
                onClick={() => onConfigChange('clothing', 'color', color.color)}
                title={color.name}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessories */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="w-5 h-5 text-primary" />
            Accessories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {accessories.map((accessory) => {
            const IconComponent = accessory.icon;
            const currentAccessories = config.clothing?.accessories || [];
            
            return (
              <div key={accessory.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-700">{accessory.name}</span>
                  </div>
                  <Badge variant={currentAccessories.some((acc: string) => acc.startsWith(accessory.id)) ? "default" : "outline"}>
                    {currentAccessories.filter((acc: string) => acc.startsWith(accessory.id)).length} selected
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {accessory.categories.map((category) => {
                    const accessoryKey = `${accessory.id}-${category}`;
                    const isSelected = currentAccessories.includes(accessoryKey);
                    
                    return (
                      <Button
                        key={category}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-10 text-xs capitalize ${
                          isSelected ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
                        }`}
                        onClick={() => toggleAccessory(accessoryKey)}
                      >
                        {category}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Current Selection Summary */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-base">Current Style</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Outfit:</span>
              <Badge variant="outline" className="capitalize">
                {config.clothing?.outfit || 'casual'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Color:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: config.clothing?.color || '#3B82F6' }}
                />
                <span className="text-sm capitalize">
                  {clothingColors.find(c => c.color === config.clothing?.color)?.name || 'Blue'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accessories:</span>
              <Badge variant="outline">
                {(config.clothing?.accessories || []).length} items
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarClothingCustomizer;
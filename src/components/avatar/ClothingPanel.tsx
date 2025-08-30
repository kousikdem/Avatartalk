
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarConfig } from '@/types/avatar';
import { Shirt, Briefcase, Crown, Dumbbell, Palette as PaletteIcon } from 'lucide-react';

interface ClothingPanelProps {
  config: AvatarConfig;
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}

const ClothingPanel: React.FC<ClothingPanelProps> = ({ config, onUpdate }) => {
  const clothingOptions = [
    { 
      value: 'casual', 
      label: 'Casual', 
      icon: Shirt,
      description: 'T-shirt, jeans, sneakers',
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      value: 'business', 
      label: 'Business', 
      icon: Briefcase,
      description: 'Button-up shirt, slacks, dress shoes',
      color: 'bg-gray-100 text-gray-800'
    },
    { 
      value: 'formal', 
      label: 'Formal', 
      icon: Crown,
      description: 'Suit, tie, formal accessories',
      color: 'bg-purple-100 text-purple-800'
    },
    { 
      value: 'creative', 
      label: 'Creative', 
      icon: PaletteIcon,
      description: 'Artistic, colorful, unique style',
      color: 'bg-pink-100 text-pink-800'
    },
    { 
      value: 'sporty', 
      label: 'Sporty', 
      icon: Dumbbell,
      description: 'Athletic wear, comfortable fit',
      color: 'bg-green-100 text-green-800'
    }
  ];

  const selectedOption = clothingOptions.find(option => option.value === config.clothing);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shirt className="w-5 h-5 text-indigo-600" />
            Clothing & Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Choose Clothing Style
            </Label>
            
            {/* Clothing Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clothingOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = config.clothing === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => onUpdate({ clothing: option.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 text-left ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-25'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${option.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Current Selection Display */}
            {selectedOption && (
              <div className="p-4 bg-white/60 rounded-lg border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium mb-2">Current Style</p>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedOption.color}`}>
                    <selectedOption.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedOption.label}</p>
                    <p className="text-xs text-gray-600">{selectedOption.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Clothing Options (Future Feature) */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 font-medium mb-2">🚀 Coming Soon</p>
              <p className="text-xs text-blue-600">
                Advanced clothing customization with colors, patterns, and individual pieces will be available in future updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClothingPanel;

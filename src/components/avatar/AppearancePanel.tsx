
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarConfig } from '@/types/avatar';
import { Palette, Eye, Scissors } from 'lucide-react';

interface AppearancePanelProps {
  config: AvatarConfig;
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}

const AppearancePanel: React.FC<AppearancePanelProps> = ({ config, onUpdate }) => {
  const skinTones = [
    { name: 'Fair', color: '#F5DEB3' },
    { name: 'Light', color: '#DEB887' },
    { name: 'Medium', color: '#D2B48C' },
    { name: 'Tan', color: '#BC9A6A' },
    { name: 'Brown', color: '#8B7355' },
    { name: 'Dark', color: '#654321' }
  ];

  const hairColors = [
    { name: 'Black', color: '#000000' },
    { name: 'Dark Brown', color: '#3B2F2F' },
    { name: 'Brown', color: '#8B4513' },
    { name: 'Light Brown', color: '#D2B48C' },
    { name: 'Blonde', color: '#F0E68C' },
    { name: 'Red', color: '#CD853F' },
    { name: 'Gray', color: '#808080' },
    { name: 'White', color: '#FFFFFF' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5 text-purple-600" />
            Facial Features & Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skin Tone */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Skin Tone
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {skinTones.map((tone) => (
                <button
                  key={tone.color}
                  className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                    config.skinTone === tone.color 
                      ? 'border-purple-500 ring-2 ring-purple-200' 
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                  style={{ backgroundColor: tone.color }}
                  onClick={() => onUpdate({ skinTone: tone.color })}
                  title={tone.name}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Hair Style
              </Label>
              <Select 
                value={config.hairStyle} 
                onValueChange={(value: any) => onUpdate({ hairStyle: value })}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bald">Bald</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="curly">Curly</SelectItem>
                  <SelectItem value="wavy">Wavy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Eye Color
              </Label>
              <Select 
                value={config.eyeColor} 
                onValueChange={(value: any) => onUpdate({ eyeColor: value })}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brown">Brown</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="hazel">Hazel</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hair Color */}
          {config.hairStyle !== 'bald' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Hair Color
              </Label>
              <div className="grid grid-cols-8 gap-2">
                {hairColors.map((color) => (
                  <button
                    key={color.color}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      config.hairColor === color.color 
                        ? 'border-purple-500 ring-2 ring-purple-200' 
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => onUpdate({ hairColor: color.color })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-white/60 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-700 font-medium mb-2">Current Selection</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: config.skinTone }}
                />
                <span>Skin</span>
              </div>
              {config.hairStyle !== 'bald' && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: config.hairColor }}
                  />
                  <span>{config.hairStyle.charAt(0).toUpperCase() + config.hairStyle.slice(1)} Hair</span>
                </div>
              )}
              <span className="capitalize">{config.eyeColor} Eyes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearancePanel;

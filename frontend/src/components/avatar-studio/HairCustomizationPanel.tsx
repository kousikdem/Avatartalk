import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Scissors } from 'lucide-react';

interface HairCustomizationPanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const HairCustomizationPanel: React.FC<HairCustomizationPanelProps> = ({ config, onChange }) => {
  const hairColors = [
    { name: 'Black', color: '#1A1A1A' },
    { name: 'Dark Brown', color: '#3D2314' },
    { name: 'Brown', color: '#8B4513' },
    { name: 'Light Brown', color: '#A0522D' },
    { name: 'Blonde', color: '#F5DEB3' },
    { name: 'Platinum', color: '#E5E4E2' },
    { name: 'Red', color: '#B22222' },
    { name: 'Auburn', color: '#A52A2A' },
    { name: 'Gray', color: '#808080' },
    { name: 'White', color: '#F5F5F5' },
    { name: 'Blue', color: '#4169E1' },
    { name: 'Purple', color: '#9370DB' },
    { name: 'Pink', color: '#FF69B4' },
    { name: 'Green', color: '#228B22' },
  ];

  return (
    <div className="space-y-4">
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            Hair Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Hairstyle</Label>
            <Select 
              value={config.hairStyle || 'medium'} 
              onValueChange={(value) => onChange('hair', 'hairStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bald">🪒 Bald/Shaved</SelectItem>
                <SelectItem value="buzz">✂️ Buzz Cut</SelectItem>
                <SelectItem value="short">👨‍🦱 Short</SelectItem>
                <SelectItem value="medium">👤 Medium</SelectItem>
                <SelectItem value="long">👱 Long</SelectItem>
                <SelectItem value="curly">🌀 Curly</SelectItem>
                <SelectItem value="afro">💥 Afro</SelectItem>
                <SelectItem value="ponytail">🎀 Ponytail</SelectItem>
                <SelectItem value="braids">🪢 Braids</SelectItem>
                <SelectItem value="dreadlocks">🔗 Dreadlocks</SelectItem>
                <SelectItem value="mohawk">⚡ Mohawk</SelectItem>
                <SelectItem value="undercut">✨ Undercut</SelectItem>
                <SelectItem value="topknot">🎯 Top Knot</SelectItem>
                <SelectItem value="pixie">🧚 Pixie Cut</SelectItem>
                <SelectItem value="bob">💇 Bob</SelectItem>
                <SelectItem value="wavy">🌊 Wavy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Hair Length</span>
              <Badge variant="secondary">{config.hairLength || 50}%</Badge>
            </Label>
            <Slider
              value={[config.hairLength || 50]}
              onValueChange={([value]) => onChange('hair', 'hairLength', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Hair Color</Label>
            <div className="grid grid-cols-7 gap-2">
              {hairColors.map((hair) => (
                <button
                  key={hair.color}
                  title={hair.name}
                  onClick={() => onChange('hair', 'hairColor', hair.color)}
                  className={`w-full h-10 rounded-full border-2 transition-all hover:scale-110 ${
                    config.hairColor === hair.color 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: hair.color }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm">Facial Hair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Style</Label>
            <Select 
              value={config.facialHair || 'none'} 
              onValueChange={(value) => onChange('hair', 'facialHair', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">❌ None</SelectItem>
                <SelectItem value="stubble">🌾 Stubble</SelectItem>
                <SelectItem value="goatee">🐐 Goatee</SelectItem>
                <SelectItem value="beard">🧔 Full Beard</SelectItem>
                <SelectItem value="mustache">👨 Mustache</SelectItem>
                <SelectItem value="vandyke">💼 Van Dyke</SelectItem>
                <SelectItem value="soul_patch">🎯 Soul Patch</SelectItem>
                <SelectItem value="mutton_chops">🐏 Mutton Chops</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.facialHair && config.facialHair !== 'none' && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Facial Hair Color</Label>
              <div className="grid grid-cols-7 gap-2">
                {hairColors.slice(0, 10).map((hair) => (
                  <button
                    key={hair.color}
                    title={hair.name}
                    onClick={() => onChange('hair', 'facialHairColor', hair.color)}
                    className={`w-full h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      (config.facialHairColor || config.hairColor) === hair.color 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: hair.color }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HairCustomizationPanel;

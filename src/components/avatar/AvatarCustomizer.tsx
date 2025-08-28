
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { AvatarConfig } from '@/pages/AvatarPage';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onChange: (newConfig: Partial<AvatarConfig>) => void;
  category: 'basic' | 'appearance' | 'clothing';
}

const ColorPicker = ({ 
  value, 
  onChange, 
  label, 
  colors 
}: { 
  value: string; 
  onChange: (color: string) => void; 
  label: string;
  colors: string[];
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            value === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  </div>
);

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ config, onChange, category }) => {
  const skinTones = [
    '#FDBCB4', '#F1B8A4', '#E8AA8C', '#D49B73', '#C08B5C',
    '#AC7A47', '#8B6234', '#6B4226', '#4A2818', '#2D1B0E'
  ];

  const hairColors = [
    '#000000', '#1B1B1B', '#3C2414', '#5D4037', '#8B4513',
    '#D2691E', '#DAA520', '#F4A460', '#DDD5C7', '#FFFFFF'
  ];

  const eyeColors = [
    '#654321', '#8B4513', '#A0522D', '#2E8B57', '#4682B4',
    '#6A5ACD', '#32CD32', '#FFD700', '#FF6347', '#8A2BE2'
  ];

  if (category === 'basic') {
    return (
      <div className="space-y-6">
        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Gender</Label>
          <Select value={config.gender} onValueChange={(value: any) => onChange({ gender: value })}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Body Type</Label>
          <Select value={config.bodyType} onValueChange={(value: any) => onChange({ bodyType: value })}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="slim">Slim</SelectItem>
              <SelectItem value="average">Average</SelectItem>
              <SelectItem value="muscular">Muscular</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Age Range</Label>
          <Select value={config.ageRange} onValueChange={(value: any) => onChange({ ageRange: value })}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="child">Child</SelectItem>
              <SelectItem value="teen">Teen</SelectItem>
              <SelectItem value="adult">Adult</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Height: {config.height}cm
          </Label>
          <Slider
            value={[config.height]}
            onValueChange={([value]) => onChange({ height: value })}
            min={140}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Weight: {config.weight}kg
          </Label>
          <Slider
            value={[config.weight]}
            onValueChange={([value]) => onChange({ weight: value })}
            min={40}
            max={150}
            step={1}
            className="w-full"
          />
        </div>

        {/* Ethnicity */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Ethnicity</Label>
          <Select value={config.ethnicity} onValueChange={(value) => onChange({ ethnicity: value })}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="caucasian">Caucasian</SelectItem>
              <SelectItem value="african">African</SelectItem>
              <SelectItem value="asian">Asian</SelectItem>
              <SelectItem value="hispanic">Hispanic</SelectItem>
              <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (category === 'appearance') {
    return (
      <div className="space-y-6">
        {/* Skin Tone */}
        <ColorPicker
          value={config.skinTone}
          onChange={(color) => onChange({ skinTone: color })}
          label="Skin Tone"
          colors={skinTones}
        />

        {/* Hair Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Hair Style</Label>
          <Select value={config.hairStyle} onValueChange={(value) => onChange({ hairStyle: value })}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="bald">Bald</SelectItem>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="curly">Curly</SelectItem>
              <SelectItem value="wavy">Wavy</SelectItem>
              <SelectItem value="braided">Braided</SelectItem>
              <SelectItem value="afro">Afro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hair Color */}
        <ColorPicker
          value={config.hairColor}
          onChange={(color) => onChange({ hairColor: color })}
          label="Hair Color"
          colors={hairColors}
        />

        {/* Eye Color */}
        <ColorPicker
          value={config.eyeColor}
          onChange={(color) => onChange({ eyeColor: color })}
          label="Eye Color"
          colors={eyeColors}
        />

        {/* Facial Hair */}
        {config.gender === 'male' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Facial Hair</Label>
            <Select 
              value={config.facialHair || 'none'} 
              onValueChange={(value) => onChange({ facialHair: value === 'none' ? undefined : value })}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="mustache">Mustache</SelectItem>
                <SelectItem value="goatee">Goatee</SelectItem>
                <SelectItem value="beard">Full Beard</SelectItem>
                <SelectItem value="stubble">Stubble</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  if (category === 'clothing') {
    return (
      <div className="space-y-6">
        {/* Clothing Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Clothing Style</Label>
          <Select value={config.clothing} onValueChange={(value) => onChange({ clothing: value })}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="sporty">Sporty</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clothing Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'T-Shirt & Jeans', value: 'casual' },
              { name: 'Business Suit', value: 'business' },
              { name: 'Evening Dress', value: 'formal' },
              { name: 'Athletic Wear', value: 'sporty' },
            ].map((preset) => (
              <Card
                key={preset.value}
                className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                  config.clothing === preset.value 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => onChange({ clothing: preset.value })}
              >
                <p className="text-sm font-medium text-center text-gray-700">
                  {preset.name}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AvatarCustomizer;

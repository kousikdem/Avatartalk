import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Globe } from 'lucide-react';

interface SkinEthnicityControlsProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const SkinEthnicityControls: React.FC<SkinEthnicityControlsProps> = ({ config, onChange }) => {
  const skinTones = {
    caucasian: [
      { name: 'Fair', color: '#FFE0BD' },
      { name: 'Light', color: '#F1C27D' },
      { name: 'Medium', color: '#E0AC69' },
      { name: 'Olive', color: '#C68642' },
    ],
    asian: [
      { name: 'Pale', color: '#FFDBAC' },
      { name: 'Light', color: '#F0C080' },
      { name: 'Medium', color: '#E8B57E' },
      { name: 'Tan', color: '#D4A574' },
    ],
    african: [
      { name: 'Light Brown', color: '#C68642' },
      { name: 'Brown', color: '#8D5524' },
      { name: 'Dark Brown', color: '#6E3F20' },
      { name: 'Deep', color: '#4A2511' },
    ],
    hispanic: [
      { name: 'Light', color: '#E8B57E' },
      { name: 'Medium', color: '#C68642' },
      { name: 'Tan', color: '#B57341' },
      { name: 'Deep', color: '#8D5524' },
    ],
    middleEastern: [
      { name: 'Light', color: '#E0AC69' },
      { name: 'Medium', color: '#C68642' },
      { name: 'Olive', color: '#B57341' },
      { name: 'Deep', color: '#8D5524' },
    ]
  };

  const selectedEthnicity = config.ethnicity || 'caucasian';
  const availableTones = skinTones[selectedEthnicity as keyof typeof skinTones] || skinTones.caucasian;

  return (
    <div className="space-y-4">
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Ethnicity & Heritage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Ethnicity Preset</Label>
            <Select 
              value={config.ethnicity || 'caucasian'} 
              onValueChange={(value) => onChange('appearance', 'ethnicity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caucasian">🇪🇺 Caucasian</SelectItem>
                <SelectItem value="asian">🇨🇳 East Asian</SelectItem>
                <SelectItem value="african">🇿🇦 African</SelectItem>
                <SelectItem value="hispanic">🇲🇽 Hispanic/Latino</SelectItem>
                <SelectItem value="middleEastern">🇸🇦 Middle Eastern</SelectItem>
                <SelectItem value="southAsian">🇮🇳 South Asian</SelectItem>
                <SelectItem value="indigenous">🏔️ Indigenous</SelectItem>
                <SelectItem value="polynesian">🏝️ Polynesian</SelectItem>
                <SelectItem value="mixed">🌍 Mixed Heritage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Skin Tone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select Skin Tone ({selectedEthnicity})
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {availableTones.map((tone) => (
                <button
                  key={tone.color}
                  onClick={() => onChange('appearance', 'skinTone', tone.color)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    config.skinTone === tone.color 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: tone.color }}
                >
                  <div className="text-xs font-medium text-center text-background mix-blend-difference">
                    {tone.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Skin Texture</Label>
            <Select 
              value={config.skinTexture || 'smooth'} 
              onValueChange={(value) => onChange('appearance', 'skinTexture', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smooth">✨ Smooth</SelectItem>
                <SelectItem value="normal">👤 Normal</SelectItem>
                <SelectItem value="textured">🌾 Textured</SelectItem>
                <SelectItem value="freckled">☀️ Freckled</SelectItem>
                <SelectItem value="weathered">🏔️ Weathered</SelectItem>
                <SelectItem value="aged">👴 Aged/Wrinkled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkinEthnicityControls;

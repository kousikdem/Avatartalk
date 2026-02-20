
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Smile, Scissors, Palette } from 'lucide-react';

interface AdvancedCustomizerProps {
  config: any;
  onConfigChange: (category: string, key: string, value: any) => void;
}

const AdvancedCustomizer: React.FC<AdvancedCustomizerProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Face Shape & Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Smile className="w-4 h-4" />
            Facial Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Face Shape</Label>
            <Select 
              value={config.face.faceShape || 'oval'} 
              onValueChange={(value) => onConfigChange('face', 'faceShape', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oval">Oval</SelectItem>
                <SelectItem value="round">Round</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="heart">Heart</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Eye Shape</Label>
            <Select 
              value={config.face.eyeShape || 'almond'} 
              onValueChange={(value) => onConfigChange('face', 'eyeShape', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="almond">Almond</SelectItem>
                <SelectItem value="round">Round</SelectItem>
                <SelectItem value="hooded">Hooded</SelectItem>
                <SelectItem value="upturned">Upturned</SelectItem>
                <SelectItem value="downturned">Downturned</SelectItem>
                <SelectItem value="monolid">Monolid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Nose Shape</Label>
            <Select 
              value={config.face.noseShape || 'straight'} 
              onValueChange={(value) => onConfigChange('face', 'noseShape', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="roman">Roman</SelectItem>
                <SelectItem value="button">Button</SelectItem>
                <SelectItem value="hawk">Hawk</SelectItem>
                <SelectItem value="snub">Snub</SelectItem>
                <SelectItem value="greek">Greek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Lip Shape</Label>
            <Select 
              value={config.face.lipShape || 'medium'} 
              onValueChange={(value) => onConfigChange('face', 'lipShape', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="bow">Bow</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Hair Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Scissors className="w-4 h-4" />
            Hair & Styling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Hair Style</Label>
            <Select 
              value={config.face.hairStyle} 
              onValueChange={(value) => onConfigChange('face', 'hairStyle', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bald">Bald</SelectItem>
                <SelectItem value="buzz">Buzz Cut</SelectItem>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="curly">Curly</SelectItem>
                <SelectItem value="ponytail">Ponytail</SelectItem>
                <SelectItem value="braids">Braids</SelectItem>
                <SelectItem value="waves">Waves</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Hair Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                '#000000', '#2F1B14', '#4A2C2A', '#654321',
                '#8B4513', '#A0522D', '#D2691E', '#DAA520',
                '#FFD700', '#FF4500', '#DC143C', '#8B0000',
                '#4B0082', '#6A0DAD', '#008000', '#808080'
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    config.face.hairColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onConfigChange('face', 'hairColor', color)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eye Customization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4" />
            Eye Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Eye Color</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { color: '#8B4513', name: 'Brown' },
                { color: '#4682B4', name: 'Blue' },
                { color: '#228B22', name: 'Green' },
                { color: '#DAA520', name: 'Hazel' },
                { color: '#696969', name: 'Gray' },
                { color: '#FF8C00', name: 'Amber' }
              ].map((eye) => (
                <button
                  key={eye.color}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 hover:bg-gray-50 ${
                    config.face.eyeColor === eye.name.toLowerCase() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => onConfigChange('face', 'eyeColor', eye.name.toLowerCase())}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: eye.color }}
                  />
                  <span className="text-xs">{eye.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skin Tone Palette */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4" />
            Skin Tone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[
              '#F5E6D3', '#F5DEB3', '#DEB887', '#D2B48C',
              '#BC9A6A', '#A0522D', '#8B7355', '#654321',
              '#4A2C2A', '#3C1810', '#2F1B14', '#1C0E08'
            ].map((color) => (
              <button
                key={color}
                className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                  config.face.skinTone === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onConfigChange('face', 'skinTone', color)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCustomizer;

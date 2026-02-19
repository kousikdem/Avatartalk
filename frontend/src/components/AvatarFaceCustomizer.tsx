import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Smile, Eye, Palette, Scissors } from 'lucide-react';

interface AvatarFaceCustomizerProps {
  config: any;
  onConfigChange: (category: string, key: string, value: any) => void;
}

const AvatarFaceCustomizer: React.FC<AvatarFaceCustomizerProps> = ({ config, onConfigChange }) => {
  const skinTones = [
    { id: 'pale', name: 'Pale', color: '#F7E7CE' },
    { id: 'fair', name: 'Fair', color: '#F1C27D' },
    { id: 'light', name: 'Light', color: '#E0AC69' },
    { id: 'medium', name: 'Medium', color: '#C68642' },
    { id: 'olive', name: 'Olive', color: '#8D5524' },
    { id: 'tan', name: 'Tan', color: '#C49C94' },
    { id: 'dark', name: 'Dark', color: '#8B4513' },
    { id: 'deep', name: 'Deep', color: '#654321' },
  ];

  const hairColors = [
    { id: 'blonde', name: 'Blonde', color: '#FAD5A5' },
    { id: 'brown', name: 'Brown', color: '#8B4513' },
    { id: 'black', name: 'Black', color: '#2F1B14' },
    { id: 'red', name: 'Red', color: '#CC4125' },
    { id: 'auburn', name: 'Auburn', color: '#A52A2A' },
    { id: 'gray', name: 'Gray', color: '#808080' },
    { id: 'white', name: 'White', color: '#F5F5F5' },
  ];

  const eyeColors = [
    { id: 'brown', name: 'Brown', color: '#8B4513' },
    { id: 'blue', name: 'Blue', color: '#4169E1' },
    { id: 'green', name: 'Green', color: '#228B22' },
    { id: 'hazel', name: 'Hazel', color: '#8E7618' },
    { id: 'gray', name: 'Gray', color: '#708090' },
    { id: 'amber', name: 'Amber', color: '#FFBF00' },
  ];

  return (
    <div className="space-y-4">
      {/* Head Structure */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smile className="w-5 h-5 text-primary" />
            Head & Face Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Head Size</label>
                <span className="text-sm text-gray-500">{config.face?.headSize || 50}%</span>
              </div>
              <Slider
                value={[config.face?.headSize || 50]}
                onValueChange={(value) => onConfigChange('face', 'headSize', value[0])}
                min={30}
                max={80}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Face Width</label>
                <span className="text-sm text-gray-500">{config.face?.faceWidth || 50}%</span>
              </div>
              <Slider
                value={[config.face?.faceWidth || 50]}
                onValueChange={(value) => onConfigChange('face', 'faceWidth', value[0])}
                min={30}
                max={80}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Jawline Definition</label>
                <span className="text-sm text-gray-500">{config.face?.jawline || 50}%</span>
              </div>
              <Slider
                value={[config.face?.jawline || 50]}
                onValueChange={(value) => onConfigChange('face', 'jawline', value[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Cheekbone Height</label>
                <span className="text-sm text-gray-500">{config.face?.cheekbones || 50}%</span>
              </div>
              <Slider
                value={[config.face?.cheekbones || 50]}
                onValueChange={(value) => onConfigChange('face', 'cheekbones', value[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Face Shape</label>
            <Select value={config.face?.faceShape || 'oval'} onValueChange={(value) => onConfigChange('face', 'faceShape', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oval">Oval</SelectItem>
                <SelectItem value="round">Round</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="heart">Heart</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
                <SelectItem value="oblong">Oblong</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Eyes */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="w-5 h-5 text-primary" />
            Eyes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Eye Size</label>
                <span className="text-sm text-gray-500">{config.face?.eyeSize || 50}%</span>
              </div>
              <Slider
                value={[config.face?.eyeSize || 50]}
                onValueChange={(value) => onConfigChange('face', 'eyeSize', value[0])}
                min={20}
                max={80}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Eye Distance</label>
                <span className="text-sm text-gray-500">{config.face?.eyeDistance || 50}%</span>
              </div>
              <Slider
                value={[config.face?.eyeDistance || 50]}
                onValueChange={(value) => onConfigChange('face', 'eyeDistance', value[0])}
                min={20}
                max={80}
                step={1}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Eye Shape</label>
            <Select value={config.face?.eyeShape || 'almond'} onValueChange={(value) => onConfigChange('face', 'eyeShape', value)}>
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
            <label className="text-sm font-medium text-gray-700 mb-3 block">Eye Color</label>
            <div className="grid grid-cols-6 gap-2">
              {eyeColors.map((color) => (
                <Button
                  key={color.id}
                  variant={config.face?.eyeColor === color.color ? "default" : "outline"}
                  className={`w-10 h-10 p-0 rounded-full avatar-color-swatch ${
                    config.face?.eyeColor === color.color ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color.color }}
                  onClick={() => onConfigChange('face', 'eyeColor', color.color)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nose & Mouth */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smile className="w-5 h-5 text-primary" />
            Nose & Mouth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Nose Size</label>
                <span className="text-sm text-gray-500">{config.face?.noseSize || 50}%</span>
              </div>
              <Slider
                value={[config.face?.noseSize || 50]}
                onValueChange={(value) => onConfigChange('face', 'noseSize', value[0])}
                min={20}
                max={80}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Nose Width</label>
                <span className="text-sm text-gray-500">{config.face?.noseWidth || 50}%</span>
              </div>
              <Slider
                value={[config.face?.noseWidth || 50]}
                onValueChange={(value) => onConfigChange('face', 'noseWidth', value[0])}
                min={20}
                max={80}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Mouth Width</label>
                <span className="text-sm text-gray-500">{config.face?.mouthWidth || 50}%</span>
              </div>
              <Slider
                value={[config.face?.mouthWidth || 50]}
                onValueChange={(value) => onConfigChange('face', 'mouthWidth', value[0])}
                min={20}
                max={80}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Lip Thickness</label>
                <span className="text-sm text-gray-500">{config.face?.lipThickness || 50}%</span>
              </div>
              <Slider
                value={[config.face?.lipThickness || 50]}
                onValueChange={(value) => onConfigChange('face', 'lipThickness', value[0])}
                min={10}
                max={90}
                step={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skin & Hair */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-5 h-5 text-primary" />
            Skin & Hair
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Skin Tone</label>
            <div className="grid grid-cols-4 gap-2">
              {skinTones.map((tone) => (
                <Button
                  key={tone.id}
                  variant={config.face?.skinTone === tone.color ? "default" : "outline"}
                  className={`w-full h-12 rounded-lg avatar-color-swatch ${
                    config.face?.skinTone === tone.color ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: tone.color }}
                  onClick={() => onConfigChange('face', 'skinTone', tone.color)}
                >
                  <span className="text-xs font-medium text-gray-800">{tone.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Hair Style</label>
            <Select value={config.face?.hairStyle || 'medium'} onValueChange={(value) => onConfigChange('face', 'hairStyle', value)}>
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
                <SelectItem value="afro">Afro</SelectItem>
                <SelectItem value="dreadlocks">Dreadlocks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Hair Color</label>
            <div className="grid grid-cols-4 gap-2">
              {hairColors.map((color) => (
                <Button
                  key={color.id}
                  variant={config.face?.hairColor === color.color ? "default" : "outline"}
                  className={`w-full h-10 rounded-lg avatar-color-swatch ${
                    config.face?.hairColor === color.color ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color.color }}
                  onClick={() => onConfigChange('face', 'hairColor', color.color)}
                >
                  <span className="text-xs font-medium text-gray-800">{color.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarFaceCustomizer;

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Ruler, Palette } from 'lucide-react';

interface AvatarCustomizerProps {
  config: any;
  onConfigChange: (category: string, key: string, value: any) => void;
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Gender</Label>
            <Select 
              value={config.body.gender} 
              onValueChange={(value) => onConfigChange('body', 'gender', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Ethnicity</Label>
            <Select 
              value={config.body.ethnicity} 
              onValueChange={(value) => onConfigChange('body', 'ethnicity', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caucasian">Caucasian</SelectItem>
                <SelectItem value="african">African</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="hispanic">Hispanic</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Age: <span className="text-blue-600">{config.body.age}</span>
            </Label>
            <Slider
              value={[config.body.age]}
              onValueChange={([value]) => onConfigChange('body', 'age', value)}
              min={16}
              max={80}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Ruler className="w-4 h-4" />
            Physical Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Height: <span className="text-blue-600">{config.body.height}cm</span>
            </Label>
            <Slider
              value={[config.body.height]}
              onValueChange={([value]) => onConfigChange('body', 'height', value)}
              min={150}
              max={200}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Weight: <span className="text-blue-600">{config.body.weight}kg</span>
            </Label>
            <Slider
              value={[config.body.weight]}
              onValueChange={([value]) => onConfigChange('body', 'weight', value)}
              min={40}
              max={120}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Muscle: <span className="text-blue-600">{config.body.muscle}%</span>
            </Label>
            <Slider
              value={[config.body.muscle]}
              onValueChange={([value]) => onConfigChange('body', 'muscle', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Body Fat: <span className="text-blue-600">{config.body.fat}%</span>
            </Label>
            <Slider
              value={[config.body.fat]}
              onValueChange={([value]) => onConfigChange('body', 'fat', value)}
              min={5}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Skin Tone</Label>
            <div className="flex gap-2 mt-2">
              {[
                '#F5DEB3', '#DEB887', '#D2B48C', '#BC9A6A', 
                '#8B7355', '#654321', '#4A2C2A', '#2F1B14'
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    config.face.skinTone === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onConfigChange('face', 'skinTone', color)}
                />
              ))}
            </div>
          </div>

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
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="curly">Curly</SelectItem>
                <SelectItem value="bald">Bald</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Hair Color</Label>
            <div className="flex gap-2 mt-2">
              {[
                '#000000', '#8B4513', '#DAA520', '#FF4500', 
                '#DC143C', '#4B0082', '#008000', '#808080'
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    config.face.hairColor === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onConfigChange('face', 'hairColor', color)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Eye Color</Label>
            <Select 
              value={config.face.eyeColor} 
              onValueChange={(value) => onConfigChange('face', 'eyeColor', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="hazel">Hazel</SelectItem>
                <SelectItem value="gray">Gray</SelectItem>
                <SelectItem value="amber">Amber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarCustomizer;

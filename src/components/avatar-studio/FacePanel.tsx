import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smile, Eye, Frown, Ear, Palette, Circle, Minus
} from 'lucide-react';

interface FacePanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const FacePanel: React.FC<FacePanelProps> = ({ config, onChange }) => {
  const skinTones = [
    { id: 'very-light', name: 'Very Light', color: '#FFE4D1' },
    { id: 'light', name: 'Light', color: '#F1C27D' },
    { id: 'medium-light', name: 'Medium Light', color: '#E0AC69' },
    { id: 'medium', name: 'Medium', color: '#C68642' },
    { id: 'medium-dark', name: 'Medium Dark', color: '#8D5524' },
    { id: 'dark', name: 'Dark', color: '#6B4423' },
    { id: 'very-dark', name: 'Very Dark', color: '#4A2511' }
  ];

  const hairColors = [
    { id: 'black', name: 'Black', color: '#1A1A1A' },
    { id: 'dark-brown', name: 'Dark Brown', color: '#3B2414' },
    { id: 'brown', name: 'Brown', color: '#8B4513' },
    { id: 'light-brown', name: 'Light Brown', color: '#A0663F' },
    { id: 'blonde', name: 'Blonde', color: '#F4D03F' },
    { id: 'red', name: 'Red', color: '#A52A2A' },
    { id: 'gray', name: 'Gray', color: '#808080' },
    { id: 'white', name: 'White', color: '#F5F5F5' }
  ];

  const eyeColors = [
    { id: 'brown', name: 'Brown', color: '#8B4513' },
    { id: 'blue', name: 'Blue', color: '#4682B4' },
    { id: 'green', name: 'Green', color: '#228B22' },
    { id: 'hazel', name: 'Hazel', color: '#8E7618' },
    { id: 'gray', name: 'Gray', color: '#708090' },
    { id: 'amber', name: 'Amber', color: '#FFBF00' }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="head" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="head">Head</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="skin-hair">Skin & Hair</TabsTrigger>
        </TabsList>

        <TabsContent value="head" className="space-y-4 mt-4">
          {/* Head Shape */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Head Shape</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Shape Type</Label>
              <Select value={config.headShape} onValueChange={(value) => onChange('face', 'headShape', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Face Width</Label>
                <Badge variant="secondary" className="text-xs">{config.faceWidth}%</Badge>
              </div>
              <Slider
                value={[config.faceWidth]}
                onValueChange={([value]) => onChange('face', 'faceWidth', value)}
                min={30}
                max={70}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Jawline</Label>
                <Badge variant="secondary" className="text-xs">{config.jawline}%</Badge>
              </div>
              <Slider
                value={[config.jawline]}
                onValueChange={([value]) => onChange('face', 'jawline', value)}
                min={30}
                max={70}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Cheekbones</Label>
                <Badge variant="secondary" className="text-xs">{config.cheekbones}%</Badge>
              </div>
              <Slider
                value={[config.cheekbones]}
                onValueChange={([value]) => onChange('face', 'cheekbones', value)}
                min={30}
                max={70}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Chin Size</Label>
                <Badge variant="secondary" className="text-xs">{config.chinSize}%</Badge>
              </div>
              <Slider
                value={[config.chinSize]}
                onValueChange={([value]) => onChange('face', 'chinSize', value)}
                min={30}
                max={70}
                step={1}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4 mt-4">
          {/* Eyes */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Eyes</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Eye Shape</Label>
              <Select value={config.eyeShape} onValueChange={(value) => onChange('face', 'eyeShape', value)}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Eye Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {eyeColors.map(color => (
                  <button
                    key={color.id}
                    className={`w-full aspect-square rounded-full border-2 ${
                      config.eyeColor === color.color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => onChange('face', 'eyeColor', color.color)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Size</Label>
                  <Badge variant="secondary" className="text-xs">{config.eyeSize}%</Badge>
                </div>
                <Slider
                  value={[config.eyeSize]}
                  onValueChange={([value]) => onChange('face', 'eyeSize', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Distance</Label>
                  <Badge variant="secondary" className="text-xs">{config.eyeDistance}%</Badge>
                </div>
                <Slider
                  value={[config.eyeDistance]}
                  onValueChange={([value]) => onChange('face', 'eyeDistance', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>
            </div>
          </Card>

          {/* Nose */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Nose</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Nose Shape</Label>
              <Select value={config.noseShape} onValueChange={(value) => onChange('face', 'noseShape', value)}>
                <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Size</Label>
                  <Badge variant="secondary" className="text-xs">{config.noseSize}%</Badge>
                </div>
                <Slider
                  value={[config.noseSize]}
                  onValueChange={([value]) => onChange('face', 'noseSize', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Width</Label>
                  <Badge variant="secondary" className="text-xs">{config.noseWidth}%</Badge>
                </div>
                <Slider
                  value={[config.noseWidth]}
                  onValueChange={([value]) => onChange('face', 'noseWidth', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>
            </div>
          </Card>

          {/* Mouth & Lips */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Mouth & Lips</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Lip Shape</Label>
              <Select value={config.lipShape} onValueChange={(value) => onChange('face', 'lipShape', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="thin">Thin</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="bow">Bow</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Width</Label>
                  <Badge variant="secondary" className="text-xs">{config.mouthWidth}%</Badge>
                </div>
                <Slider
                  value={[config.mouthWidth]}
                  onValueChange={([value]) => onChange('face', 'mouthWidth', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Thickness</Label>
                  <Badge variant="secondary" className="text-xs">{config.lipThickness}%</Badge>
                </div>
                <Slider
                  value={[config.lipThickness]}
                  onValueChange={([value]) => onChange('face', 'lipThickness', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>
            </div>
          </Card>

          {/* Ears */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Ear className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Ears</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Ear Shape</Label>
              <Select value={config.earShape} onValueChange={(value) => onChange('face', 'earShape', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="attached">Attached</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Size</Label>
                  <Badge variant="secondary" className="text-xs">{config.earSize}%</Badge>
                </div>
                <Slider
                  value={[config.earSize]}
                  onValueChange={([value]) => onChange('face', 'earSize', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Position</Label>
                  <Badge variant="secondary" className="text-xs">{config.earPosition}%</Badge>
                </div>
                <Slider
                  value={[config.earPosition]}
                  onValueChange={([value]) => onChange('face', 'earPosition', value)}
                  min={30}
                  max={70}
                  step={1}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="skin-hair" className="space-y-4 mt-4">
          {/* Skin */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Skin Tone</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Skin Texture</Label>
              <Select value={config.skinTexture} onValueChange={(value) => onChange('appearance', 'skinTexture', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smooth">Smooth</SelectItem>
                  <SelectItem value="pores">With Pores</SelectItem>
                  <SelectItem value="freckles">Freckles</SelectItem>
                  <SelectItem value="wrinkles">Wrinkles</SelectItem>
                  <SelectItem value="aged">Aged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {skinTones.map(tone => (
                <button
                  key={tone.id}
                  className={`w-full aspect-square rounded-full border-2 ${
                    config.skinTone === tone.color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  style={{ backgroundColor: tone.color }}
                  onClick={() => onChange('appearance', 'skinTone', tone.color)}
                  title={tone.name}
                />
              ))}
            </div>
          </Card>

          {/* Hair */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Hair</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Hair Style</Label>
              <Select value={config.hairStyle} onValueChange={(value) => onChange('hair', 'hairStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bald">Bald</SelectItem>
                  <SelectItem value="buzz">Buzz Cut</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="curly">Curly</SelectItem>
                  <SelectItem value="wavy">Wavy</SelectItem>
                  <SelectItem value="straight">Straight Long</SelectItem>
                  <SelectItem value="afro">Afro</SelectItem>
                  <SelectItem value="dreadlocks">Dreadlocks</SelectItem>
                  <SelectItem value="braids">Braids</SelectItem>
                  <SelectItem value="ponytail">Ponytail</SelectItem>
                  <SelectItem value="bun">Bun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hair Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {hairColors.map(color => (
                  <button
                    key={color.id}
                    className={`w-full aspect-square rounded-full border-2 ${
                      config.hairColor === color.color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => onChange('hair', 'hairColor', color.color)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Hair Length</Label>
                <Badge variant="secondary" className="text-xs">{config.hairLength}%</Badge>
              </div>
              <Slider
                value={[config.hairLength]}
                onValueChange={([value]) => onChange('hair', 'hairLength', value)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Facial Hair</Label>
              <Select value={config.facialHair} onValueChange={(value) => onChange('hair', 'facialHair', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="stubble">Stubble</SelectItem>
                  <SelectItem value="goatee">Goatee</SelectItem>
                  <SelectItem value="mustache">Mustache</SelectItem>
                  <SelectItem value="full-beard">Full Beard</SelectItem>
                  <SelectItem value="beard">Beard</SelectItem>
                  <SelectItem value="soul-patch">Soul Patch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacePanel;

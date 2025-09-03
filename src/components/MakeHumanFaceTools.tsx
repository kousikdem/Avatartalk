import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Eye, Triangle, Smile, Palette, RotateCcw } from 'lucide-react';

interface MakeHumanFaceToolsProps {
  config: any;
  onConfigChange: (key: string, value: any) => void;
  showAdvanced: boolean;
}

const MakeHumanFaceTools: React.FC<MakeHumanFaceToolsProps> = ({
  config,
  onConfigChange,
  showAdvanced
}) => {

  const SliderControl = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1,
    unit = '',
    description = ''
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    description?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <Badge variant="secondary" className="text-xs">
          {value}{unit}
        </Badge>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        max={max}
        min={min}
        step={step}
        className="w-full"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );

  const ColorPicker = ({ 
    label, 
    value, 
    onChange, 
    colors 
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    colors: { name: string; value: string }[];
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              value === color.value ? 'border-primary scale-110' : 'border-border hover:border-primary/50'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: value }}
        />
        <span className="text-xs text-muted-foreground">{value}</span>
      </div>
    </div>
  );

  const skinTones = [
    { name: 'Very Light', value: '#F5DEB3' },
    { name: 'Light', value: '#F1C27D' },
    { name: 'Light Medium', value: '#E8B887' },
    { name: 'Medium', value: '#D4A574' },
    { name: 'Medium Dark', value: '#C8A882' },
    { name: 'Dark', value: '#BC9A6A' },
    { name: 'Very Dark', value: '#A0855B' },
    { name: 'Deep', value: '#8B7355' },
  ];

  const eyeColors = [
    { name: 'Brown', value: '#8B4513' },
    { name: 'Dark Brown', value: '#654321' },
    { name: 'Light Brown', value: '#A0522D' },
    { name: 'Hazel', value: '#8B7D6B' },
    { name: 'Green', value: '#50C878' },
    { name: 'Blue', value: '#4A90E2' },
    { name: 'Light Blue', value: '#87CEEB' },
    { name: 'Gray', value: '#A0A0A0' },
  ];

  const hairColors = [
    { name: 'Black', value: '#1C1C1C' },
    { name: 'Dark Brown', value: '#2F1B14' },
    { name: 'Medium Brown', value: '#4A2C2A' },
    { name: 'Light Brown', value: '#5D4037' },
    { name: 'Dark Blonde', value: '#654321' },
    { name: 'Blonde', value: '#8B7D6B' },
    { name: 'Light Blonde', value: '#F4A460' },
    { name: 'Red', value: '#A0522D' },
    { name: 'Auburn', value: '#8B4513' },
    { name: 'Gray', value: '#A0A0A0' },
    { name: 'White', value: '#F5F5F5' },
  ];

  const resetToDefaults = () => {
    const defaults = {
      faceWidth: 50,
      faceHeight: 50,
      jawWidth: 50,
      jawHeight: 50,
      chinHeight: 50,
      chinWidth: 50,
      cheekboneHeight: 50,
      cheekboneWidth: 50,
      eyeSize: 50,
      eyeDistance: 50,
      eyeHeight: 50,
      eyeAngle: 50,
      eyebrowHeight: 50,
      eyebrowThickness: 50,
      eyebrowAngle: 50,
      noseWidth: 50,
      noseHeight: 50,
      noseBridge: 50,
      nostrilWidth: 50,
      nostrilHeight: 50,
      mouthWidth: 50,
      mouthHeight: 50,
      lipThickness: 50,
      upperLipHeight: 50,
      lowerLipHeight: 50,
      earSize: 50,
      earPosition: 50,
      earAngle: 50,
    };

    Object.entries(defaults).forEach(([key, value]) => {
      onConfigChange(key, value);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">MakeHuman-Style Face Editor</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="structure" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="structure" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Structure</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Triangle className="w-4 h-4" />
            <span className="hidden sm:inline">Details</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Face Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Face Width"
                  value={config.faceWidth}
                  onChange={(value) => onConfigChange('faceWidth', value)}
                  description="Overall width of the face"
                />
                <SliderControl
                  label="Face Height"
                  value={config.faceHeight}
                  onChange={(value) => onConfigChange('faceHeight', value)}
                  description="Overall height of the face"
                />
                <SliderControl
                  label="Jaw Width"
                  value={config.jawWidth}
                  onChange={(value) => onConfigChange('jawWidth', value)}
                  description="Width of the jawline"
                />
                <SliderControl
                  label="Jaw Height" 
                  value={config.jawHeight}
                  onChange={(value) => onConfigChange('jawHeight', value)}
                  description="Height and prominence of the jaw"
                />
                <SliderControl
                  label="Cheekbone Height"
                  value={config.cheekboneHeight}
                  onChange={(value) => onConfigChange('cheekboneHeight', value)}
                  description="Height of the cheekbones"
                />
                <SliderControl
                  label="Cheekbone Width"
                  value={config.cheekboneWidth}
                  onChange={(value) => onConfigChange('cheekboneWidth', value)}
                  description="Width and prominence of cheekbones"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chin & Lower Face</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Chin Height"
                  value={config.chinHeight}
                  onChange={(value) => onConfigChange('chinHeight', value)}
                  description="Height of the chin"
                />
                <SliderControl
                  label="Chin Width"
                  value={config.chinWidth}
                  onChange={(value) => onConfigChange('chinWidth', value)}
                  description="Width of the chin"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eyes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Eye Size"
                  value={config.eyeSize}
                  onChange={(value) => onConfigChange('eyeSize', value)}
                  description="Overall size of the eyes"
                />
                <SliderControl
                  label="Eye Distance"
                  value={config.eyeDistance}
                  onChange={(value) => onConfigChange('eyeDistance', value)}
                  description="Distance between the eyes"
                />
                <SliderControl
                  label="Eye Height"
                  value={config.eyeHeight}
                  onChange={(value) => onConfigChange('eyeHeight', value)}
                  description="Vertical position of the eyes"
                />
                <SliderControl
                  label="Eye Angle"
                  value={config.eyeAngle}
                  onChange={(value) => onConfigChange('eyeAngle', value)}
                  description="Angle and tilt of the eyes"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eyebrows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Eyebrow Height"
                  value={config.eyebrowHeight}
                  onChange={(value) => onConfigChange('eyebrowHeight', value)}
                  description="Height of the eyebrows"
                />
                <SliderControl
                  label="Eyebrow Thickness"
                  value={config.eyebrowThickness}
                  onChange={(value) => onConfigChange('eyebrowThickness', value)}
                  description="Thickness of the eyebrows"
                />
                <SliderControl
                  label="Eyebrow Angle"
                  value={config.eyebrowAngle}
                  onChange={(value) => onConfigChange('eyebrowAngle', value)}
                  description="Angle and arch of the eyebrows"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nose</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Nose Width"
                  value={config.noseWidth}
                  onChange={(value) => onConfigChange('noseWidth', value)}
                  description="Width of the nose"
                />
                <SliderControl
                  label="Nose Height"
                  value={config.noseHeight}
                  onChange={(value) => onConfigChange('noseHeight', value)}
                  description="Length of the nose"
                />
                <SliderControl
                  label="Nose Bridge"
                  value={config.noseBridge}
                  onChange={(value) => onConfigChange('noseBridge', value)}
                  description="Height of the nose bridge"
                />
                <SliderControl
                  label="Nostril Width"
                  value={config.nostrilWidth}
                  onChange={(value) => onConfigChange('nostrilWidth', value)}
                  description="Width of the nostrils"
                />
                <SliderControl
                  label="Nostril Height"
                  value={config.nostrilHeight}
                  onChange={(value) => onConfigChange('nostrilHeight', value)}
                  description="Height of the nostrils"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mouth & Lips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Mouth Width"
                  value={config.mouthWidth}
                  onChange={(value) => onConfigChange('mouthWidth', value)}
                  description="Width of the mouth"
                />
                <SliderControl
                  label="Mouth Height"
                  value={config.mouthHeight}
                  onChange={(value) => onConfigChange('mouthHeight', value)}
                  description="Height of the mouth opening"
                />
                <SliderControl
                  label="Lip Thickness"
                  value={config.lipThickness}
                  onChange={(value) => onConfigChange('lipThickness', value)}
                  description="Overall thickness of the lips"
                />
                <SliderControl
                  label="Upper Lip Height"
                  value={config.upperLipHeight}
                  onChange={(value) => onConfigChange('upperLipHeight', value)}
                  description="Height of the upper lip"
                />
                <SliderControl
                  label="Lower Lip Height"
                  value={config.lowerLipHeight}
                  onChange={(value) => onConfigChange('lowerLipHeight', value)}
                  description="Height of the lower lip"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ears</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Ear Size"
                  value={config.earSize}
                  onChange={(value) => onConfigChange('earSize', value)}
                  description="Overall size of the ears"
                />
                <SliderControl
                  label="Ear Position"
                  value={config.earPosition}
                  onChange={(value) => onConfigChange('earPosition', value)}
                  description="Vertical position of the ears"
                />
                <SliderControl
                  label="Ear Angle"
                  value={config.earAngle}
                  onChange={(value) => onConfigChange('earAngle', value)}
                  description="Angle of the ears from the head"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Skin & Eyes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ColorPicker
                  label="Skin Tone"
                  value={config.skinTone}
                  onChange={(value) => onConfigChange('skinTone', value)}
                  colors={skinTones}
                />
                <ColorPicker
                  label="Eye Color"
                  value={config.eyeColor}
                  onChange={(value) => onConfigChange('eyeColor', value)}
                  colors={eyeColors}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hair</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Hair Style</label>
                  <Select value={config.hairStyle} onValueChange={(value) => onConfigChange('hairStyle', value)}>
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
                      <SelectItem value="ponytail">Ponytail</SelectItem>
                      <SelectItem value="braids">Braids</SelectItem>
                      <SelectItem value="afro">Afro</SelectItem>
                      <SelectItem value="dreadlocks">Dreadlocks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ColorPicker
                  label="Hair Color"
                  value={config.hairColor}
                  onChange={(value) => onConfigChange('hairColor', value)}
                  colors={hairColors}
                />

                <ColorPicker
                  label="Eyebrow Color"
                  value={config.eyebrowColor}
                  onChange={(value) => onConfigChange('eyebrowColor', value)}
                  colors={hairColors}
                />

                {showAdvanced && (
                  <>
                    <SliderControl
                      label="Hair Length"
                      value={config.hairLength}
                      onChange={(value) => onConfigChange('hairLength', value)}
                      description="Length modifier for the selected style"
                    />
                    <SliderControl
                      label="Hair Volume"
                      value={config.hairVolume}
                      onChange={(value) => onConfigChange('hairVolume', value)}
                      description="Volume and thickness of the hair"
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MakeHumanFaceTools;
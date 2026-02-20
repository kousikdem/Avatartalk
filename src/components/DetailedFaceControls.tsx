import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Smile, Ear } from 'lucide-react';

interface DetailedFaceControlsProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const DetailedFaceControls: React.FC<DetailedFaceControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Head & Face Structure */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm">Head & Face Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Head Size</span>
              <Badge variant="secondary">{config.headSize}%</Badge>
            </Label>
            <Slider
              value={[config.headSize]}
              onValueChange={([value]) => onChange('face', 'headSize', value)}
              min={80}
              max={120}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Head Shape</Label>
            <Select value={config.headShape} onValueChange={(value) => onChange('face', 'headShape', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oval">🥚 Oval</SelectItem>
                <SelectItem value="round">⚪ Round</SelectItem>
                <SelectItem value="square">⬜ Square</SelectItem>
                <SelectItem value="heart">❤️ Heart</SelectItem>
                <SelectItem value="diamond">💎 Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Skull Proportion</span>
              <Badge variant="secondary">{config.faceWidth || 50}%</Badge>
            </Label>
            <Slider
              value={[config.faceWidth || 50]}
              onValueChange={([value]) => onChange('face', 'faceWidth', value)}
              min={35}
              max={65}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Jawline</span>
              <Badge variant="secondary">{config.jawline}%</Badge>
            </Label>
            <Slider
              value={[config.jawline]}
              onValueChange={([value]) => onChange('face', 'jawline', value)}
              min={30}
              max={80}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Cheekbones</span>
              <Badge variant="secondary">{config.cheekbones}%</Badge>
            </Label>
            <Slider
              value={[config.cheekbones]}
              onValueChange={([value]) => onChange('face', 'cheekbones', value)}
              min={30}
              max={80}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Chin</span>
              <Badge variant="secondary">{config.chinSize || 50}%</Badge>
            </Label>
            <Slider
              value={[config.chinSize || 50]}
              onValueChange={([value]) => onChange('face', 'chinSize', value)}
              min={30}
              max={70}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Eyes */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Eyes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Eye Shape</Label>
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
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Eye Size</span>
              <Badge variant="secondary">{config.eyeSize}%</Badge>
            </Label>
            <Slider
              value={[config.eyeSize]}
              onValueChange={([value]) => onChange('face', 'eyeSize', value)}
              min={70}
              max={130}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Eye Distance</span>
              <Badge variant="secondary">{config.eyeDistance}%</Badge>
            </Label>
            <Slider
              value={[config.eyeDistance]}
              onValueChange={([value]) => onChange('face', 'eyeDistance', value)}
              min={40}
              max={65}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Iris Color</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {[
                { color: '#8B4513', name: 'Brown' },
                { color: '#4A90E2', name: 'Blue' },
                { color: '#50C878', name: 'Green' },
                { color: '#DAA520', name: 'Hazel' },
                { color: '#708090', name: 'Gray' },
                { color: '#2F4F4F', name: 'Black' },
                { color: '#9370DB', name: 'Violet' },
                { color: '#40E0D0', name: 'Turquoise' },
                { color: '#CD853F', name: 'Amber' },
                { color: '#FFD700', name: 'Gold' },
                { color: '#87CEEB', name: 'Sky' },
                { color: '#228B22', name: 'Forest' }
              ].map((eye) => (
                <button
                  key={eye.color}
                  title={eye.name}
                  className={`w-full h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    config.eyeColor === eye.color ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                  }`}
                  style={{ backgroundColor: eye.color }}
                  onClick={() => onChange('face', 'eyeColor', eye.color)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nose */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm">Nose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Nose Shape</Label>
            <Select value={config.noseShape} onValueChange={(value) => onChange('face', 'noseShape', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="curved">Curved</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
                <SelectItem value="narrow">Narrow</SelectItem>
                <SelectItem value="button">Button</SelectItem>
                <SelectItem value="aquiline">Aquiline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Nose Length</span>
              <Badge variant="secondary">{config.noseSize}%</Badge>
            </Label>
            <Slider
              value={[config.noseSize]}
              onValueChange={([value]) => onChange('face', 'noseSize', value)}
              min={35}
              max={70}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Nose Width</span>
              <Badge variant="secondary">{config.noseWidth}%</Badge>
            </Label>
            <Slider
              value={[config.noseWidth]}
              onValueChange={([value]) => onChange('face', 'noseWidth', value)}
              min={35}
              max={70}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mouth & Lips */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Mouth & Lips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Lip Shape</Label>
            <Select value={config.lipShape} onValueChange={(value) => onChange('face', 'lipShape', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
                <SelectItem value="heart">Heart-Shaped</SelectItem>
                <SelectItem value="cupid">Cupid's Bow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Mouth Width</span>
              <Badge variant="secondary">{config.mouthWidth}%</Badge>
            </Label>
            <Slider
              value={[config.mouthWidth]}
              onValueChange={([value]) => onChange('face', 'mouthWidth', value)}
              min={35}
              max={70}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Lip Thickness</span>
              <Badge variant="secondary">{config.lipThickness}%</Badge>
            </Label>
            <Slider
              value={[config.lipThickness]}
              onValueChange={([value]) => onChange('face', 'lipThickness', value)}
              min={30}
              max={80}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Smile Curvature</span>
              <Badge variant="secondary">{config.smileCurvature || 50}%</Badge>
            </Label>
            <Slider
              value={[config.smileCurvature || 50]}
              onValueChange={([value]) => onChange('face', 'smileCurvature', value)}
              min={30}
              max={70}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ears */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ear className="w-4 h-4" />
            Ears
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Ear Shape</Label>
            <Select value={config.earShape} onValueChange={(value) => onChange('face', 'earShape', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="round">Round</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="pointed">Pointed</SelectItem>
                <SelectItem value="attached">Attached</SelectItem>
                <SelectItem value="detached">Detached</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Ear Size</span>
              <Badge variant="secondary">{config.earSize}%</Badge>
            </Label>
            <Slider
              value={[config.earSize]}
              onValueChange={([value]) => onChange('face', 'earSize', value)}
              min={35}
              max={70}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Ear Position</span>
              <Badge variant="secondary">{config.earPosition}%</Badge>
            </Label>
            <Slider
              value={[config.earPosition]}
              onValueChange={([value]) => onChange('face', 'earPosition', value)}
              min={35}
              max={65}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedFaceControls;

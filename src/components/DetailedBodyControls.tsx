import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Ruler, Scale, Dumbbell, Hand, User2 } from 'lucide-react';

interface DetailedBodyControlsProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const DetailedBodyControls: React.FC<DetailedBodyControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Body Measurements */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Body Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Ruler className="w-3 h-3" />
                Height
              </span>
              <Badge variant="secondary">{config.height}cm</Badge>
            </Label>
            <Slider
              value={[config.height]}
              onValueChange={([value]) => onChange('body', 'height', value)}
              min={140}
              max={210}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Scale className="w-3 h-3" />
                Weight
              </span>
              <Badge variant="secondary">{config.weight}kg</Badge>
            </Label>
            <Slider
              value={[config.weight]}
              onValueChange={([value]) => onChange('body', 'weight', value)}
              min={40}
              max={150}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Dumbbell className="w-3 h-3" />
                Muscle Definition
              </span>
              <Badge variant="secondary">{config.muscle}%</Badge>
            </Label>
            <Slider
              value={[config.muscle]}
              onValueChange={([value]) => onChange('body', 'muscle', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Body Fat</span>
              <Badge variant="secondary">{config.fat}%</Badge>
            </Label>
            <Slider
              value={[config.fat]}
              onValueChange={([value]) => onChange('body', 'fat', value)}
              min={5}
              max={45}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Body Proportions */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm">Body Proportions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Torso Length</span>
              <Badge variant="secondary">{config.torsoLength || 50}%</Badge>
            </Label>
            <Slider
              value={[config.torsoLength || 50]}
              onValueChange={([value]) => onChange('body', 'torsoLength', value)}
              min={40}
              max={60}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User2 className="w-3 h-3" />
                Leg Length
              </span>
              <Badge variant="secondary">{config.legLength || 50}%</Badge>
            </Label>
            <Slider
              value={[config.legLength || 50]}
              onValueChange={([value]) => onChange('body', 'legLength', value)}
              min={40}
              max={60}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Shoulder Width</span>
              <Badge variant="secondary">{config.shoulderWidth || 50}%</Badge>
            </Label>
            <Slider
              value={[config.shoulderWidth || 50]}
              onValueChange={([value]) => onChange('body', 'shoulderWidth', value)}
              min={35}
              max={70}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Hand className="w-3 h-3" />
                Hand Size
              </span>
              <Badge variant="secondary">{config.handSize || 50}%</Badge>
            </Label>
            <Slider
              value={[config.handSize || 50]}
              onValueChange={([value]) => onChange('body', 'handSize', value)}
              min={40}
              max={60}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedBodyControls;

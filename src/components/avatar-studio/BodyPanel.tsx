import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  User, Activity, Ruler, Weight, Dumbbell, Percent, 
  UserCog, ArrowUpDown, Hand, Maximize2
} from 'lucide-react';

interface BodyPanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const BodyPanel: React.FC<BodyPanelProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Basic Body Structure */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Basic Body Structure</h3>
        </div>
        
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={config.gender} onValueChange={(value) => onChange('body', 'gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Age Group</Label>
              <Select value={config.ageCategory} onValueChange={(value) => onChange('body', 'ageCategory', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">Child (5-12)</SelectItem>
                  <SelectItem value="teen">Teen (13-17)</SelectItem>
                  <SelectItem value="adult">Adult (18-50)</SelectItem>
                  <SelectItem value="senior">Senior (50+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ethnicity</Label>
            <Select value={config.ethnicity} onValueChange={(value) => onChange('body', 'ethnicity', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caucasian">Caucasian</SelectItem>
                <SelectItem value="african">African</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                <SelectItem value="indigenous">Indigenous</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Body Measurements */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Body Measurements</h3>
        </div>
        
        <Card className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Label>Height</Label>
              </div>
              <Badge variant="secondary">{config.height} cm</Badge>
            </div>
            <Slider
              value={[config.height]}
              onValueChange={([value]) => onChange('body', 'height', value)}
              min={140}
              max={210}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-muted-foreground" />
                <Label>Weight</Label>
              </div>
              <Badge variant="secondary">{config.weight} kg</Badge>
            </div>
            <Slider
              value={[config.weight]}
              onValueChange={([value]) => onChange('body', 'weight', value)}
              min={40}
              max={150}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                <Label>Muscle Definition</Label>
              </div>
              <Badge variant="secondary">{config.muscle}%</Badge>
            </div>
            <Slider
              value={[config.muscle]}
              onValueChange={([value]) => onChange('body', 'muscle', value)}
              min={0}
              max={100}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <Label>Body Fat</Label>
              </div>
              <Badge variant="secondary">{config.fat}%</Badge>
            </div>
            <Slider
              value={[config.fat]}
              onValueChange={([value]) => onChange('body', 'fat', value)}
              min={5}
              max={50}
              step={1}
              className="py-2"
            />
          </div>
        </Card>
      </div>

      {/* Body Proportions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Body Proportions</h3>
        </div>
        
        <Card className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Shoulder Width</Label>
              </div>
              <Badge variant="secondary" className="text-xs">{config.shoulderWidth}%</Badge>
            </div>
            <Slider
              value={[config.shoulderWidth]}
              onValueChange={([value]) => onChange('body', 'shoulderWidth', value)}
              min={30}
              max={70}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Torso Length</Label>
              </div>
              <Badge variant="secondary" className="text-xs">{config.torsoLength}%</Badge>
            </div>
            <Slider
              value={[config.torsoLength]}
              onValueChange={([value]) => onChange('body', 'torsoLength', value)}
              min={30}
              max={70}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Leg Length</Label>
              </div>
              <Badge variant="secondary" className="text-xs">{config.legLength}%</Badge>
            </div>
            <Slider
              value={[config.legLength]}
              onValueChange={([value]) => onChange('body', 'legLength', value)}
              min={30}
              max={70}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hand className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Hand Size</Label>
              </div>
              <Badge variant="secondary" className="text-xs">{config.handSize}%</Badge>
            </div>
            <Slider
              value={[config.handSize]}
              onValueChange={([value]) => onChange('body', 'handSize', value)}
              min={30}
              max={70}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Head Size</Label>
              </div>
              <Badge variant="secondary" className="text-xs">{config.headSize}%</Badge>
            </div>
            <Slider
              value={[config.headSize]}
              onValueChange={([value]) => onChange('body', 'headSize', value)}
              min={30}
              max={70}
              step={1}
              className="py-2"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BodyPanel;

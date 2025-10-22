import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Ruler, Dumbbell } from 'lucide-react';
import VisualAssetLibrary from './VisualAssetLibrary';
import { bodyTypeAssets } from '@/data/visualAssets';

interface BodyAnatomyPanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const BodyAnatomyPanel: React.FC<BodyAnatomyPanelProps> = ({ config, onChange }) => {
  return (
    <Tabs defaultValue="measurements" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="measurements">Measurements</TabsTrigger>
        <TabsTrigger value="types">Body Types</TabsTrigger>
      </TabsList>

      <TabsContent value="measurements" className="space-y-4">
        {/* Height & Weight */}
        <Card className="avatar-control-panel">
          <CardHeader className="avatar-section-header">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Physical Measurements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Height</span>
                <Badge variant="secondary">{config.height || 170} cm</Badge>
              </Label>
              <Slider
                value={[config.height || 170]}
                onValueChange={([value]) => onChange('body', 'height', value)}
                min={140}
                max={210}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Weight</span>
                <Badge variant="secondary">{config.weight || 70} kg</Badge>
              </Label>
              <Slider
                value={[config.weight || 70]}
                onValueChange={([value]) => onChange('body', 'weight', value)}
                min={40}
                max={150}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Body Proportions */}
        <Card className="avatar-control-panel">
          <CardHeader className="avatar-section-header">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Body Proportions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Shoulder Width</span>
                <Badge variant="secondary">{config.shoulderWidth || 50}%</Badge>
              </Label>
              <Slider
                value={[config.shoulderWidth || 50]}
                onValueChange={([value]) => onChange('body', 'shoulderWidth', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Torso Length</span>
                <Badge variant="secondary">{config.torsoLength || 50}%</Badge>
              </Label>
              <Slider
                value={[config.torsoLength || 50]}
                onValueChange={([value]) => onChange('body', 'torsoLength', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Leg Length</span>
                <Badge variant="secondary">{config.legLength || 50}%</Badge>
              </Label>
              <Slider
                value={[config.legLength || 50]}
                onValueChange={([value]) => onChange('body', 'legLength', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Hand Size</span>
                <Badge variant="secondary">{config.handSize || 50}%</Badge>
              </Label>
              <Slider
                value={[config.handSize || 50]}
                onValueChange={([value]) => onChange('body', 'handSize', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Head Size</span>
                <Badge variant="secondary">{config.headSize || 50}%</Badge>
              </Label>
              <Slider
                value={[config.headSize || 50]}
                onValueChange={([value]) => onChange('body', 'headSize', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Muscle & Fat */}
        <Card className="avatar-control-panel">
          <CardHeader className="avatar-section-header">
            <CardTitle className="text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Muscle & Body Fat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Muscle Definition</span>
                <Badge variant="secondary">{config.muscle || 50}%</Badge>
              </Label>
              <Slider
                value={[config.muscle || 50]}
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
                <Badge variant="secondary">{config.fat || 20}%</Badge>
              </Label>
              <Slider
                value={[config.fat || 20]}
                onValueChange={([value]) => onChange('body', 'fat', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="types">
        <VisualAssetLibrary
          title="Body Type Presets"
          items={bodyTypeAssets}
          selectedId={config.bodyType}
          onSelect={(id) => onChange('body', 'bodyType', id)}
          columns={2}
          height="500px"
        />
      </TabsContent>
    </Tabs>
  );
};

export default BodyAnatomyPanel;

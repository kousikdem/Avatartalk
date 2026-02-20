import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Smile, Ear } from 'lucide-react';
import VisualAssetLibrary from './VisualAssetLibrary';
import { faceShapeAssets, eyeShapeAssets, noseShapeAssets, lipShapeAssets } from '@/data/visualAssets';

interface FacialFeaturesPanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const FacialFeaturesPanel: React.FC<FacialFeaturesPanelProps> = ({ config, onChange }) => {
  return (
    <Tabs defaultValue="head" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4 text-xs">
        <TabsTrigger value="head">Head</TabsTrigger>
        <TabsTrigger value="eyes">Eyes</TabsTrigger>
        <TabsTrigger value="nose">Nose</TabsTrigger>
        <TabsTrigger value="mouth">Mouth</TabsTrigger>
      </TabsList>

      {/* Head & Face Shape */}
      <TabsContent value="head" className="space-y-4">
        <VisualAssetLibrary
          title="Face Shape"
          items={faceShapeAssets}
          selectedId={config.headShape}
          onSelect={(id) => onChange('face', 'headShape', id)}
          columns={3}
          height="250px"
        />

        <Card className="avatar-control-panel">
          <CardHeader className="avatar-section-header">
            <CardTitle className="text-sm">Face Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Face Width</span>
                <Badge variant="secondary">{config.faceWidth || 50}%</Badge>
              </Label>
              <Slider
                value={[config.faceWidth || 50]}
                onValueChange={([value]) => onChange('face', 'faceWidth', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Jawline Definition</span>
                <Badge variant="secondary">{config.jawline || 50}%</Badge>
              </Label>
              <Slider
                value={[config.jawline || 50]}
                onValueChange={([value]) => onChange('face', 'jawline', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Cheekbones</span>
                <Badge variant="secondary">{config.cheekbones || 50}%</Badge>
              </Label>
              <Slider
                value={[config.cheekbones || 50]}
                onValueChange={([value]) => onChange('face', 'cheekbones', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Chin Size</span>
                <Badge variant="secondary">{config.chinSize || 50}%</Badge>
              </Label>
              <Slider
                value={[config.chinSize || 50]}
                onValueChange={([value]) => onChange('face', 'chinSize', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Eyes */}
      <TabsContent value="eyes" className="space-y-4">
        <VisualAssetLibrary
          title="Eye Shape"
          items={eyeShapeAssets}
          selectedId={config.eyeShape}
          onSelect={(id) => onChange('face', 'eyeShape', id)}
          columns={3}
          height="250px"
        />

        <Card className="avatar-control-panel">
          <CardHeader className="avatar-section-header">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Eye Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Eye Size</span>
                <Badge variant="secondary">{config.eyeSize || 50}%</Badge>
              </Label>
              <Slider
                value={[config.eyeSize || 50]}
                onValueChange={([value]) => onChange('face', 'eyeSize', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Eye Distance</span>
                <Badge variant="secondary">{config.eyeDistance || 50}%</Badge>
              </Label>
              <Slider
                value={[config.eyeDistance || 50]}
                onValueChange={([value]) => onChange('face', 'eyeDistance', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Eye Color</Label>
              <input
                type="color"
                value={config.eyeColor || '#8B4513'}
                onChange={(e) => onChange('face', 'eyeColor', e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Nose */}
      <TabsContent value="nose" className="space-y-4">
        <VisualAssetLibrary
          title="Nose Shape"
          items={noseShapeAssets}
          selectedId={config.noseShape}
          onSelect={(id) => onChange('face', 'noseShape', id)}
          columns={3}
          height="250px"
        />

        <Card className="avatar-control-panel">
          <CardHeader className="avatar-section-header">
            <CardTitle className="text-sm">Nose Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Nose Size</span>
                <Badge variant="secondary">{config.noseSize || 50}%</Badge>
              </Label>
              <Slider
                value={[config.noseSize || 50]}
                onValueChange={([value]) => onChange('face', 'noseSize', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Nose Width</span>
                <Badge variant="secondary">{config.noseWidth || 50}%</Badge>
              </Label>
              <Slider
                value={[config.noseWidth || 50]}
                onValueChange={([value]) => onChange('face', 'noseWidth', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Mouth & Lips */}
      <TabsContent value="mouth" className="space-y-4">
        <VisualAssetLibrary
          title="Lip Shape"
          items={lipShapeAssets}
          selectedId={config.lipShape}
          onSelect={(id) => onChange('face', 'lipShape', id)}
          columns={3}
          height="250px"
        />

        <Card className="avatar-control-panel">
          <CardHeader className="avatar-section-header">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Mouth Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Mouth Width</span>
                <Badge variant="secondary">{config.mouthWidth || 50}%</Badge>
              </Label>
              <Slider
                value={[config.mouthWidth || 50]}
                onValueChange={([value]) => onChange('face', 'mouthWidth', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Lip Thickness</span>
                <Badge variant="secondary">{config.lipThickness || 50}%</Badge>
              </Label>
              <Slider
                value={[config.lipThickness || 50]}
                onValueChange={([value]) => onChange('face', 'lipThickness', value)}
                min={0}
                max={100}
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
                min={0}
                max={100}
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
              Ear Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Ear Size</span>
                <Badge variant="secondary">{config.earSize || 50}%</Badge>
              </Label>
              <Slider
                value={[config.earSize || 50]}
                onValueChange={([value]) => onChange('face', 'earSize', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Ear Position</span>
                <Badge variant="secondary">{config.earPosition || 50}%</Badge>
              </Label>
              <Slider
                value={[config.earPosition || 50]}
                onValueChange={([value]) => onChange('face', 'earPosition', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FacialFeaturesPanel;

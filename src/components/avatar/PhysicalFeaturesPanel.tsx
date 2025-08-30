
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarConfig } from '@/types/avatar';
import { Activity, Ruler, Weight } from 'lucide-react';

interface PhysicalFeaturesPanelProps {
  config: AvatarConfig;
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}

const PhysicalFeaturesPanel: React.FC<PhysicalFeaturesPanelProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-green-600" />
            Physical Attributes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bodyType" className="text-sm font-medium">
              Body Type
            </Label>
            <Select 
              value={config.bodyType} 
              onValueChange={(value: any) => onUpdate({ bodyType: value })}
            >
              <SelectTrigger className="bg-white border-gray-200 focus:border-green-500 focus:ring-green-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slim">Slim</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="muscular">Muscular</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Height: <span className="text-green-600 font-semibold">{config.height}cm</span>
              </Label>
              <Slider
                value={[config.height]}
                onValueChange={(value) => onUpdate({ height: value[0] })}
                min={140}
                max={210}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>140cm</span>
                <span>210cm</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Weight className="w-4 h-4" />
                Weight: <span className="text-green-600 font-semibold">{config.weight}kg</span>
              </Label>
              <Slider
                value={[config.weight]}
                onValueChange={(value) => onUpdate({ weight: value[0] })}
                min={35}
                max={150}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>35kg</span>
                <span>150kg</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-lg border border-green-100">
            <p className="text-sm text-green-700 font-medium mb-2">Body Proportions</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600">BMI:</span>
                <span className="ml-2 font-medium">
                  {((config.weight / Math.pow(config.height / 100, 2)).toFixed(1))}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">
                  {config.bodyType === 'custom' ? 'Custom' : config.bodyType.charAt(0).toUpperCase() + config.bodyType.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhysicalFeaturesPanel;

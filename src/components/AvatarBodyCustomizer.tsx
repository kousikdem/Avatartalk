import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Ruler, Weight, Dumbbell } from 'lucide-react';

interface AvatarBodyCustomizerProps {
  config: any;
  onConfigChange: (category: string, key: string, value: any) => void;
}

const AvatarBodyCustomizer: React.FC<AvatarBodyCustomizerProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-4">
      {/* Basic Body Information */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-5 h-5 text-primary" />
            Basic Body Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <Select value={config.body?.gender || 'female'} onValueChange={(value) => onConfigChange('body', 'gender', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Age Group</label>
              <Select value={config.body?.ageGroup || 'adult'} onValueChange={(value) => onConfigChange('body', 'ageGroup', value)}>
                <SelectTrigger className="mt-1">
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

          <div>
            <label className="text-sm font-medium text-gray-700">Ethnicity</label>
            <Select value={config.body?.ethnicity || 'mixed'} onValueChange={(value) => onConfigChange('body', 'ethnicity', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="african">African</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="caucasian">Caucasian</SelectItem>
                <SelectItem value="hispanic">Hispanic</SelectItem>
                <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="indigenous">Indigenous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Body Measurements */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="w-5 h-5 text-primary" />
            Body Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Height</label>
              <span className="text-sm text-gray-500">{config.body?.height || 170} cm</span>
            </div>
            <Slider
              value={[config.body?.height || 170]}
              onValueChange={(value) => onConfigChange('body', 'height', value[0])}
              min={140}
              max={200}
              step={1}
              className="avatar-slider-track"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Weight</label>
              <span className="text-sm text-gray-500">{config.body?.weight || 65} kg</span>
            </div>
            <Slider
              value={[config.body?.weight || 65]}
              onValueChange={(value) => onConfigChange('body', 'weight', value[0])}
              min={40}
              max={150}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Muscle Definition</label>
              <span className="text-sm text-gray-500">{config.body?.muscle || 50}%</span>
            </div>
            <Slider
              value={[config.body?.muscle || 50]}
              onValueChange={(value) => onConfigChange('body', 'muscle', value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Body Fat</label>
              <span className="text-sm text-gray-500">{config.body?.fat || 30}%</span>
            </div>
            <Slider
              value={[config.body?.fat || 30]}
              onValueChange={(value) => onConfigChange('body', 'fat', value[0])}
              min={5}
              max={50}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Body Proportions */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="w-5 h-5 text-primary" />
            Body Proportions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Torso Length</label>
                <span className="text-sm text-gray-500">{config.body?.torsoLength || 50}%</span>
              </div>
              <Slider
                value={[config.body?.torsoLength || 50]}
                onValueChange={(value) => onConfigChange('body', 'torsoLength', value[0])}
                min={30}
                max={70}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Leg Length</label>
                <span className="text-sm text-gray-500">{config.body?.legLength || 50}%</span>
              </div>
              <Slider
                value={[config.body?.legLength || 50]}
                onValueChange={(value) => onConfigChange('body', 'legLength', value[0])}
                min={30}
                max={70}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Shoulder Width</label>
                <span className="text-sm text-gray-500">{config.body?.shoulderWidth || 50}%</span>
              </div>
              <Slider
                value={[config.body?.shoulderWidth || 50]}
                onValueChange={(value) => onConfigChange('body', 'shoulderWidth', value[0])}
                min={30}
                max={80}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Hand Size</label>
                <span className="text-sm text-gray-500">{config.body?.handSize || 50}%</span>
              </div>
              <Slider
                value={[config.body?.handSize || 50]}
                onValueChange={(value) => onConfigChange('body', 'handSize', value[0])}
                min={30}
                max={80}
                step={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarBodyCustomizer;
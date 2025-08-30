
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarConfig } from '@/types/avatar';
import { User, Users, Calendar } from 'lucide-react';

interface BasicInfoPanelProps {
  config: AvatarConfig;
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}

const BasicInfoPanel: React.FC<BasicInfoPanelProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-blue-600" />
            Identity Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gender
              </Label>
              <Select 
                value={config.gender} 
                onValueChange={(value: any) => onUpdate({ gender: value })}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRange" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Age Range
              </Label>
              <Select 
                value={config.ageRange} 
                onValueChange={(value: any) => onUpdate({ ageRange: value })}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">Child (5-12)</SelectItem>
                  <SelectItem value="teen">Teen (13-19)</SelectItem>
                  <SelectItem value="adult">Adult (20-64)</SelectItem>
                  <SelectItem value="senior">Senior (65+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700 font-medium mb-2">Preview Updates</p>
            <p className="text-xs text-blue-600">
              Your avatar will automatically update as you change these settings. 
              The 3D model adjusts proportions and features based on your selections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoPanel;

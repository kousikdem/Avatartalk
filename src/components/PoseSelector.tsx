
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Zap, PlayCircle, Users } from 'lucide-react';

interface PoseSelectorProps {
  currentPose: string;
  onPoseSelect: (pose: string) => void;
}

const PoseSelector: React.FC<PoseSelectorProps> = ({ currentPose, onPoseSelect }) => {
  const poses = [
    { id: 'standing', name: 'Standing', icon: User, description: 'Natural standing pose' },
    { id: 'sitting', name: 'Sitting', icon: Users, description: 'Relaxed sitting position' },
    { id: 'running', name: 'Running', icon: Zap, description: 'Dynamic running motion' },
    { id: 'dancing', name: 'Dancing', icon: PlayCircle, description: 'Expressive dance pose' },
    { id: 'fighting', name: 'Action', icon: Zap, description: 'Combat ready stance' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <PlayCircle className="w-4 h-4" />
          Poses & Animation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {poses.map((pose) => {
            const IconComponent = pose.icon;
            return (
              <Button
                key={pose.id}
                variant={currentPose === pose.id ? "default" : "outline"}
                className={`h-16 justify-start gap-3 ${
                  currentPose === pose.id ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
                onClick={() => onPoseSelect(pose.id)}
              >
                <IconComponent className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{pose.name}</div>
                  <div className="text-xs text-gray-500">{pose.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoseSelector;

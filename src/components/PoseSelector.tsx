
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Zap, PlayCircle, Users, Coffee, Dumbbell, Music, Swords } from 'lucide-react';

interface PoseSelectorProps {
  currentPose: string;
  onPoseSelect: (pose: string) => void;
}

const PoseSelector: React.FC<PoseSelectorProps> = ({ currentPose, onPoseSelect }) => {
  const poses = [
    { id: 'standing', name: 'Standing', icon: User, description: 'Natural standing pose', category: 'Basic' },
    { id: 'relaxed', name: 'Relaxed', icon: Coffee, description: 'Casual relaxed stance', category: 'Basic' },
    { id: 'sitting', name: 'Sitting', icon: Users, description: 'Comfortable sitting position', category: 'Basic' },
    { id: 'running', name: 'Running', icon: Zap, description: 'Dynamic running motion', category: 'Action' },
    { id: 'dancing', name: 'Dancing', icon: Music, description: 'Expressive dance pose', category: 'Action' },
    { id: 'fighting', name: 'Combat', icon: Swords, description: 'Combat ready stance', category: 'Action' },
    { id: 'workout', name: 'Exercise', icon: Dumbbell, description: 'Fitness workout pose', category: 'Sports' },
  ];

  const categories = [...new Set(poses.map(pose => pose.category))];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <PlayCircle className="w-4 h-4" />
          Poses & Animation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category}>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{category}</h4>
              <div className="grid grid-cols-1 gap-2">
                {poses
                  .filter(pose => pose.category === category)
                  .map((pose) => {
                    const IconComponent = pose.icon;
                    return (
                      <Button
                        key={pose.id}
                        variant={currentPose === pose.id ? "default" : "outline"}
                        className={`h-14 justify-start gap-3 transition-all duration-200 ${
                          currentPose === pose.id 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        onClick={() => onPoseSelect(pose.id)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentPose === pose.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            currentPose === pose.id ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">{pose.name}</div>
                          <div className={`text-xs ${
                            currentPose === pose.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {pose.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoseSelector;

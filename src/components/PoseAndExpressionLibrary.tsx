import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smile, Zap } from 'lucide-react';
import { posePresets, expressionPresets } from '@/data/avatarPresets';

interface PoseAndExpressionLibraryProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const additionalPoses = [
  { id: 'walking', name: 'Walking', icon: '🚶' },
  { id: 'waving', name: 'Waving', icon: '👋' },
  { id: 'thinking', name: 'Thinking', icon: '🤔' },
  { id: 'crossed_arms', name: 'Arms Crossed', icon: '🙅' },
  { id: 'pointing', name: 'Pointing', icon: '👉' },
  { id: 'saluting', name: 'Saluting', icon: '🫡' },
  { id: 'fighting', name: 'Fighting Stance', icon: '🥊' },
  { id: 'meditating', name: 'Meditating', icon: '🧘' },
];

const additionalExpressions = [
  { id: 'excited', name: 'Excited', icon: '🤩' },
  { id: 'worried', name: 'Worried', icon: '😟' },
  { id: 'shocked', name: 'Shocked', icon: '😱' },
  { id: 'love', name: 'In Love', icon: '😍' },
  { id: 'sleepy', name: 'Sleepy', icon: '😴' },
  { id: 'cool', name: 'Cool', icon: '😎' },
  { id: 'crying', name: 'Crying', icon: '😭' },
  { id: 'wink', name: 'Winking', icon: '😉' },
];

const allPoses = [...posePresets, ...additionalPoses];
const allExpressions = [...expressionPresets, ...additionalExpressions];

const PoseAndExpressionLibrary: React.FC<PoseAndExpressionLibraryProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Poses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Pose Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {allPoses.map((pose) => (
              <Button
                key={pose.id}
                variant={config.currentPose === pose.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange('pose', 'currentPose', pose.id)}
                className="justify-start"
              >
                <span className="mr-2">{pose.icon}</span>
                {pose.name}
              </Button>
            ))}
          </div>

          {config.currentPose && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-xs mb-2 block">Current Pose:</Label>
              <Badge variant="default" className="text-sm">
                {allPoses.find(p => p.id === config.currentPose)?.icon}{' '}
                {allPoses.find(p => p.id === config.currentPose)?.name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expressions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Expression Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {allExpressions.map((expr) => (
              <Button
                key={expr.id}
                variant={config.currentExpression === expr.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange('expression', 'currentExpression', expr.id)}
                className="justify-start"
              >
                <span className="mr-2">{expr.icon}</span>
                {expr.name}
              </Button>
            ))}
          </div>

          {config.currentExpression && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-xs mb-2 block">Current Expression:</Label>
              <Badge variant="default" className="text-sm">
                {allExpressions.find(e => e.id === config.currentExpression)?.icon}{' '}
                {allExpressions.find(e => e.id === config.currentExpression)?.name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Animation Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Combine different poses and expressions to create unique character states. 
            Custom animations can be uploaded as .fbx or .glb files.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Label import
import { Label } from '@/components/ui/label';

export default PoseAndExpressionLibrary;

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Smile } from 'lucide-react';
import VisualAssetLibrary from './VisualAssetLibrary';
import { poseAssets, expressionAssets } from '@/data/visualAssets';

interface PoseExpressionPanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const PoseExpressionPanel: React.FC<PoseExpressionPanelProps> = ({ config, onChange }) => {
  return (
    <Tabs defaultValue="poses" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="poses" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Poses
        </TabsTrigger>
        <TabsTrigger value="expressions" className="flex items-center gap-2">
          <Smile className="w-4 h-4" />
          Expressions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="poses">
        <VisualAssetLibrary
          title="Pose Library"
          items={poseAssets}
          selectedId={config.currentPose}
          onSelect={(id) => onChange('animation', 'currentPose', id)}
          columns={4}
          height="300px"
        />
      </TabsContent>

      <TabsContent value="expressions">
        <VisualAssetLibrary
          title="Expression Library"
          items={expressionAssets}
          selectedId={config.currentExpression}
          onSelect={(id) => onChange('animation', 'currentExpression', id)}
          columns={4}
          height="300px"
        />
      </TabsContent>
    </Tabs>
  );
};

export default PoseExpressionPanel;

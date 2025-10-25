import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shirt, Activity, Smile, Glasses, Watch } from 'lucide-react';
import VisualAssetLibrary from './VisualAssetLibrary';
import { 
  clothingTopAssets, 
  clothingBottomAssets, 
  shoesAssets, 
  accessoryAssets,
  poseAssets,
  expressionAssets
} from '@/data/visualAssets';

interface StylePanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const StylePanel: React.FC<StylePanelProps> = ({ config, onChange }) => {
  const handleAccessoryToggle = (accessoryId: string) => {
    const currentAccessories = config.accessories || [];
    const newAccessories = currentAccessories.includes(accessoryId)
      ? currentAccessories.filter((id: string) => id !== accessoryId)
      : [...currentAccessories, accessoryId];
    onChange('clothing', 'accessories', newAccessories);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="clothing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clothing">Clothing</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
          <TabsTrigger value="pose">Pose & Expression</TabsTrigger>
        </TabsList>

        <TabsContent value="clothing" className="space-y-4 mt-4">
          {/* Clothing Top */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="w-4 h-4 text-primary" />
              <Label className="font-semibold">Tops</Label>
              {config.clothingTop && (
                <Badge variant="secondary" className="text-xs">
                  {clothingTopAssets.find(item => item.id === config.clothingTop)?.name || config.clothingTop}
                </Badge>
              )}
            </div>
            <VisualAssetLibrary
              title=""
              items={clothingTopAssets}
              selectedId={config.clothingTop}
              onSelect={(id) => onChange('clothing', 'clothingTop', id)}
              columns={3}
              height="200px"
            />
          </div>

          {/* Clothing Bottom */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="w-4 h-4 text-primary" />
              <Label className="font-semibold">Bottoms</Label>
              {config.clothingBottom && (
                <Badge variant="secondary" className="text-xs">
                  {clothingBottomAssets.find(item => item.id === config.clothingBottom)?.name || config.clothingBottom}
                </Badge>
              )}
            </div>
            <VisualAssetLibrary
              title=""
              items={clothingBottomAssets}
              selectedId={config.clothingBottom}
              onSelect={(id) => onChange('clothing', 'clothingBottom', id)}
              columns={3}
              height="180px"
            />
          </div>

          {/* Shoes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <Label className="font-semibold">Shoes</Label>
              {config.shoes && (
                <Badge variant="secondary" className="text-xs">
                  {shoesAssets.find(item => item.id === config.shoes)?.name || config.shoes}
                </Badge>
              )}
            </div>
            <VisualAssetLibrary
              title=""
              items={shoesAssets}
              selectedId={config.shoes}
              onSelect={(id) => onChange('clothing', 'shoes', id)}
              columns={3}
              height="160px"
            />
          </div>
        </TabsContent>

        <TabsContent value="accessories" className="space-y-4 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Glasses className="w-4 h-4 text-primary" />
              <Label className="font-semibold">Accessories</Label>
              {config.accessories?.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {config.accessories.length} selected
                </Badge>
              )}
            </div>
            <Card className="p-3 bg-muted/20">
              <div className="grid grid-cols-3 gap-2">
                {accessoryAssets.map(accessory => {
                  const isSelected = config.accessories?.includes(accessory.id);
                  return (
                    <button
                      key={accessory.id}
                      onClick={() => handleAccessoryToggle(accessory.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-xs text-center ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                    >
                      {accessory.name}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pose" className="space-y-4 mt-4">
          {/* Pose */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <Label className="font-semibold">Poses</Label>
              {config.currentPose && (
                <Badge variant="secondary" className="text-xs">
                  {poseAssets.find(item => item.id === config.currentPose)?.name || config.currentPose}
                </Badge>
              )}
            </div>
            <VisualAssetLibrary
              title=""
              items={poseAssets}
              selectedId={config.currentPose}
              onSelect={(id) => onChange('animation', 'currentPose', id)}
              columns={4}
              height="250px"
            />
          </div>

          {/* Expression */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-primary" />
              <Label className="font-semibold">Expressions</Label>
              {config.currentExpression && (
                <Badge variant="secondary" className="text-xs">
                  {expressionAssets.find(item => item.id === config.currentExpression)?.name || config.currentExpression}
                </Badge>
              )}
            </div>
            <VisualAssetLibrary
              title=""
              items={expressionAssets}
              selectedId={config.currentExpression}
              onSelect={(id) => onChange('animation', 'currentExpression', id)}
              columns={4}
              height="250px"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StylePanel;

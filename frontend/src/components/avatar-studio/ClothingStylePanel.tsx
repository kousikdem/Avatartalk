import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, Footprints, Watch } from 'lucide-react';
import VisualAssetLibrary from './VisualAssetLibrary';
import { 
  clothingTopAssets, 
  clothingBottomAssets, 
  shoesAssets, 
  accessoryAssets 
} from '@/data/visualAssets';

interface ClothingStylePanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const ClothingStylePanel: React.FC<ClothingStylePanelProps> = ({ config, onChange }) => {
  const handleAccessoryToggle = (accessoryId: string) => {
    const currentAccessories = config.accessories || [];
    const isSelected = currentAccessories.includes(accessoryId);
    
    const newAccessories = isSelected
      ? currentAccessories.filter((id: string) => id !== accessoryId)
      : [...currentAccessories, accessoryId];
    
    onChange('clothing', 'accessories', newAccessories);
  };

  return (
    <Tabs defaultValue="tops" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4 text-xs">
        <TabsTrigger value="tops">
          <Shirt className="w-3 h-3 mr-1" />
          Tops
        </TabsTrigger>
        <TabsTrigger value="bottoms">Bottoms</TabsTrigger>
        <TabsTrigger value="shoes">
          <Footprints className="w-3 h-3 mr-1" />
          Shoes
        </TabsTrigger>
        <TabsTrigger value="accessories">
          <Watch className="w-3 h-3 mr-1" />
          Access.
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tops">
        <VisualAssetLibrary
          title="Clothing Tops"
          items={clothingTopAssets}
          selectedId={config.clothingTop}
          onSelect={(id) => onChange('clothing', 'clothingTop', id)}
          columns={3}
          height="450px"
        />
      </TabsContent>

      <TabsContent value="bottoms">
        <VisualAssetLibrary
          title="Clothing Bottoms"
          items={clothingBottomAssets}
          selectedId={config.clothingBottom}
          onSelect={(id) => onChange('clothing', 'clothingBottom', id)}
          columns={3}
          height="450px"
        />
      </TabsContent>

      <TabsContent value="shoes">
        <VisualAssetLibrary
          title="Footwear"
          items={shoesAssets}
          selectedId={config.shoes}
          onSelect={(id) => onChange('clothing', 'shoes', id)}
          columns={3}
          height="450px"
        />
      </TabsContent>

      <TabsContent value="accessories">
        <VisualAssetLibrary
          title="Accessories (Multi-select)"
          items={accessoryAssets}
          selectedId={undefined}
          onSelect={handleAccessoryToggle}
          columns={3}
          height="450px"
        />
      </TabsContent>
    </Tabs>
  );
};

export default ClothingStylePanel;

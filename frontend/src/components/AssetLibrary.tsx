
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shirt, Crown, Glasses, Watch, Shield, Briefcase } from 'lucide-react';

interface AssetLibraryProps {
  category: string;
  onAssetSelect: (asset: string) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ category, onAssetSelect }) => {
  const [selectedAsset, setSelectedAsset] = useState('');

  const clothingAssets = [
    { id: 'business', name: 'Business Suit', icon: Briefcase, color: 'bg-gray-700' },
    { id: 'casual', name: 'Casual Wear', icon: Shirt, color: 'bg-blue-500' },
    { id: 'formal', name: 'Formal Dress', icon: Crown, color: 'bg-purple-600' },
    { id: 'sports', name: 'Sportswear', icon: Shield, color: 'bg-green-600' },
  ];

  const accessoryAssets = [
    { id: 'glasses', name: 'Glasses', icon: Glasses, color: 'bg-amber-500' },
    { id: 'watch', name: 'Watch', icon: Watch, color: 'bg-silver-500' },
    { id: 'hat', name: 'Hat', icon: Crown, color: 'bg-red-500' },
  ];

  const assets = category === 'clothing' ? clothingAssets : accessoryAssets;

  const handleAssetSelect = (assetId: string) => {
    setSelectedAsset(assetId);
    onAssetSelect(assetId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shirt className="w-4 h-4" />
          {category === 'clothing' ? 'Clothing Library' : 'Accessories'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => {
            const IconComponent = asset.icon;
            return (
              <Button
                key={asset.id}
                variant={selectedAsset === asset.id ? "default" : "outline"}
                className={`h-20 flex flex-col items-center gap-1 ${
                  selectedAsset === asset.id ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
                onClick={() => handleAssetSelect(asset.id)}
              >
                <div className={`w-8 h-8 rounded-full ${asset.color} flex items-center justify-center`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs">{asset.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetLibrary;

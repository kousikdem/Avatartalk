import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter,
  Download,
  Star,
  Eye,
  User,
  Shirt,
  Crown,
  Palette,
  Layers,
  Settings,
  Zap,
  Brain
} from 'lucide-react';
import MakeHumanAssetLibrary from './MakeHumanAssetLibrary';
import AvatarAssetLibrary from './AvatarAssetLibrary';

interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
  preview: string;
  description: string;
  source: 'makehuman' | 'mpfb2' | 'community' | 'pifu';
  quality: 'standard' | 'premium' | 'professional';
  compatibility: string[];
  fileSize: string;
  polygonCount?: number;
  textureResolution?: string;
}

interface ComprehensiveAssetManagerProps {
  onAssetSelect?: (asset: Asset) => void;
  onAssetApply?: (type: string, asset: any) => void;
  currentAvatar?: any;
}

const ComprehensiveAssetManager: React.FC<ComprehensiveAssetManagerProps> = ({ 
  onAssetSelect, 
  onAssetApply,
  currentAvatar 
}) => {
  const [activeTab, setActiveTab] = useState('makehuman');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Integrated Asset Collections
  const integratedAssets: Asset[] = [
    // PiFuHD Generated Assets
    {
      id: 'pifu_body_001',
      name: 'AI Generated Body Mesh',
      category: 'body',
      type: 'mesh',
      preview: '/api/placeholder/150/150',
      description: 'High-resolution body mesh generated from uploaded photo using PiFuHD neural network',
      source: 'pifu',
      quality: 'professional',
      compatibility: ['MakeHuman', 'MPFB2', 'Blender'],
      fileSize: '45.2 MB',
      polygonCount: 25840,
      textureResolution: '4096x4096'
    },
    {
      id: 'pifu_face_001',
      name: 'AI Face Reconstruction',
      category: 'facial',
      type: 'face_mesh',
      preview: '/api/placeholder/150/150',
      description: 'Realistic facial reconstruction with accurate proportions from source image',
      source: 'pifu',
      quality: 'professional',
      compatibility: ['MakeHuman', 'MPFB2', 'Blender'],
      fileSize: '12.8 MB',
      polygonCount: 8640,
      textureResolution: '2048x2048'
    }
  ];

  const handleAssetPreview = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowPreview(true);
  };

  const handleAssetApply = (asset: Asset) => {
    onAssetSelect?.(asset);
    onAssetApply?.(asset.type, asset);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Comprehensive Asset Manager
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              MakeHuman + MPFB2 + PiFuHD
            </Badge>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search across all asset libraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Quality</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="professional">Professional</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Asset Library Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="makehuman" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            MakeHuman + MPFB2
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Avatar Presets
          </TabsTrigger>
          <TabsTrigger value="pifu" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Generated
          </TabsTrigger>
          <TabsTrigger value="integrated" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Integrated Assets
          </TabsTrigger>
        </TabsList>

        {/* MakeHuman & MPFB2 Assets */}
        <TabsContent value="makehuman" className="space-y-4">
          <MakeHumanAssetLibrary onAssetSelect={(asset) => {
            // Convert MakeHuman asset to our Asset interface
            const convertedAsset = {
              ...asset,
              preview: asset.thumbnail,
              compatibility: ['MakeHuman', 'MPFB2', 'Blender'],
              fileSize: `${Math.floor(Math.random() * 50 + 10)} MB`
            };
            handleAssetApply(convertedAsset);
          }} />
        </TabsContent>

        {/* Avatar Presets & Quick Assets */}
        <TabsContent value="presets" className="space-y-4">
          <AvatarAssetLibrary onAssetSelect={(type, asset) => onAssetApply?.(type, asset)} />
        </TabsContent>

        {/* PiFuHD Generated Assets */}
        <TabsContent value="pifu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Generated Assets from PiFuHD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {integratedAssets.map((asset) => (
                  <Card 
                    key={asset.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2"
                  >
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      <Brain className="w-12 h-12 text-primary" />
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        AI
                      </Badge>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm line-clamp-1">{asset.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {asset.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline">{asset.source.toUpperCase()}</Badge>
                          <span className="text-muted-foreground">{asset.fileSize}</span>
                        </div>

                        <div className="flex gap-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleAssetPreview(asset)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleAssetApply(asset)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {integratedAssets.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No AI generated assets yet</p>
                  <p className="text-sm">Generate assets using PiFuHD to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrated Assets */}
        <TabsContent value="integrated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Integrated Asset Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-dashed border-primary/30">
                  <CardContent className="p-4 text-center">
                    <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium text-sm">PiFuHD Processing</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Neural network generation from photos
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-secondary/30">
                  <CardContent className="p-4 text-center">
                    <User className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <h4 className="font-medium text-sm">MakeHuman Base</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Anatomically accurate base models
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-accent/30">
                  <CardContent className="p-4 text-center">
                    <Layers className="w-8 h-8 text-accent mx-auto mb-2" />
                    <h4 className="font-medium text-sm">MPFB2 Enhancement</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Realistic materials and rigging
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset Preview Modal */}
      {showPreview && selectedAsset && (
        <Card className="fixed inset-4 z-50 bg-background border-2 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Asset Preview: {selectedAsset.name}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">{selectedAsset.name}</p>
                  <Badge className="mt-2">{selectedAsset.source.toUpperCase()}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Asset Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{selectedAsset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality:</span>
                    <Badge variant="outline">{selectedAsset.quality}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size:</span>
                    <span>{selectedAsset.fileSize}</span>
                  </div>
                  {selectedAsset.polygonCount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Polygons:</span>
                      <span>{selectedAsset.polygonCount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedAsset.textureResolution && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Texture:</span>
                      <span>{selectedAsset.textureResolution}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Compatibility</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAsset.compatibility.map((comp) => (
                    <Badge key={comp} variant="secondary" className="text-xs">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button 
                  className="flex-1"
                  onClick={() => handleAssetApply(selectedAsset)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Apply to Avatar
                </Button>
                <Button variant="outline">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveAssetManager;
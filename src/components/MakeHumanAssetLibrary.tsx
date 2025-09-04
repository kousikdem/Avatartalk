import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  User, 
  Shirt, 
  Palette, 
  Eye, 
  Smile,
  Crown,
  Glasses,
  Watch,
  Footprints,
  Download,
  Star,
  Filter
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
  thumbnail: string;
  description: string;
  quality: 'standard' | 'premium' | 'professional';
  downloads: number;
  rating: number;
  tags: string[];
  source: 'makehuman' | 'mpfb2' | 'community';
}

interface MakeHumanAssetLibraryProps {
  onAssetSelect?: (asset: Asset) => void;
}

const MakeHumanAssetLibrary: React.FC<MakeHumanAssetLibraryProps> = ({ onAssetSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');

  // Mock MakeHuman/MPFB2 assets
  const mockAssets: Asset[] = [
    // Hair Assets
    {
      id: 'mh_hair_001',
      name: 'Professional Short Hair',
      category: 'hair',
      type: 'hair_style',
      thumbnail: '/api/placeholder/120/120',
      description: 'Realistic short professional hairstyle with natural textures',
      quality: 'professional',
      downloads: 2543,
      rating: 4.8,
      tags: ['professional', 'short', 'realistic', 'business'],
      source: 'makehuman'
    },
    {
      id: 'mpfb2_hair_002',
      name: 'Curly Long Hair',
      category: 'hair',
      type: 'hair_style',
      thumbnail: '/api/placeholder/120/120',
      description: 'Natural curly hair with advanced strand dynamics',
      quality: 'premium',
      downloads: 1876,
      rating: 4.6,
      tags: ['curly', 'long', 'natural', 'dynamic'],
      source: 'mpfb2'
    },
    
    // Clothing Assets
    {
      id: 'mh_cloth_001',
      name: 'Business Suit',
      category: 'clothing',
      type: 'formal_wear',
      thumbnail: '/api/placeholder/120/120',
      description: 'High-quality business suit with realistic fabric simulation',
      quality: 'professional',
      downloads: 3421,
      rating: 4.9,
      tags: ['formal', 'business', 'professional', 'suit'],
      source: 'makehuman'
    },
    {
      id: 'mpfb2_cloth_002',
      name: 'Casual T-Shirt',
      category: 'clothing',
      type: 'casual_wear',
      thumbnail: '/api/placeholder/120/120',
      description: 'Comfortable cotton t-shirt with natural fabric properties',
      quality: 'standard',
      downloads: 5632,
      rating: 4.4,
      tags: ['casual', 'comfort', 'cotton', 'everyday'],
      source: 'mpfb2'
    },

    // Facial Features
    {
      id: 'mh_face_001',
      name: 'Expressive Eyes Set',
      category: 'facial',
      type: 'eyes',
      thumbnail: '/api/placeholder/120/120',
      description: 'Collection of realistic eye shapes and expressions',
      quality: 'premium',
      downloads: 4152,
      rating: 4.7,
      tags: ['eyes', 'expressions', 'realistic', 'emotions'],
      source: 'makehuman'
    },
    {
      id: 'mpfb2_face_002',
      name: 'Natural Nose Variations',
      category: 'facial',
      type: 'nose',
      thumbnail: '/api/placeholder/120/120',
      description: 'Diverse nose shapes for authentic facial features',
      quality: 'professional',
      downloads: 2987,
      rating: 4.5,
      tags: ['nose', 'diversity', 'realistic', 'anatomy'],
      source: 'mpfb2'
    },

    // Accessories
    {
      id: 'mh_acc_001',
      name: 'Designer Glasses',
      category: 'accessories',
      type: 'eyewear',
      thumbnail: '/api/placeholder/120/120',
      description: 'Modern designer glasses with realistic reflections',
      quality: 'premium',
      downloads: 1543,
      rating: 4.6,
      tags: ['glasses', 'modern', 'designer', 'accessories'],
      source: 'makehuman'
    },
    {
      id: 'mpfb2_acc_002',
      name: 'Sport Watch',
      category: 'accessories',
      type: 'jewelry',
      thumbnail: '/api/placeholder/120/120',
      description: 'High-tech sport watch with detailed mechanisms',
      quality: 'professional',
      downloads: 876,
      rating: 4.3,
      tags: ['watch', 'sport', 'technology', 'accessories'],
      source: 'mpfb2'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Assets', icon: Star },
    { id: 'hair', name: 'Hair & Facial Hair', icon: User },
    { id: 'clothing', name: 'Clothing', icon: Shirt },
    { id: 'facial', name: 'Facial Features', icon: Eye },
    { id: 'accessories', name: 'Accessories', icon: Crown }
  ];

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesQuality = qualityFilter === 'all' || asset.quality === qualityFilter;
    
    return matchesSearch && matchesCategory && matchesQuality;
  });

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'professional':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Pro</Badge>;
      case 'premium':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Premium</Badge>;
      default:
        return <Badge variant="secondary">Standard</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'makehuman':
        return <Badge variant="outline" className="text-xs">MakeHuman</Badge>;
      case 'mpfb2':
        return <Badge variant="outline" className="text-xs">MPFB2</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Community</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          MakeHuman & MPFB2 Asset Library
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search assets..."
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <Icon className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <Card 
                  key={asset.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => onAssetSelect?.(asset)}
                >
                  <div className="aspect-square bg-muted/30 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      {asset.category === 'hair' && <User className="w-8 h-8 text-primary" />}
                      {asset.category === 'clothing' && <Shirt className="w-8 h-8 text-primary" />}
                      {asset.category === 'facial' && <Eye className="w-8 h-8 text-primary" />}
                      {asset.category === 'accessories' && <Crown className="w-8 h-8 text-primary" />}
                    </div>
                    <div className="absolute top-2 right-2">
                      {getQualityBadge(asset.quality)}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      {getSourceBadge(asset.source)}
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-1">{asset.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {asset.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{asset.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{asset.downloads}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {asset.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAssets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No assets found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MakeHumanAssetLibrary;
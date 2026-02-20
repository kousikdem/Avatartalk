import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shirt, ShoppingBag, Glasses, Watch, Crown } from 'lucide-react';

interface ComprehensiveClothingControlsProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const clothingCategories = {
  casual: {
    tops: ['T-Shirt', 'Polo', 'Hoodie', 'Sweater', 'Casual Shirt'],
    bottoms: ['Jeans', 'Chinos', 'Shorts', 'Joggers'],
    shoes: ['Sneakers', 'Loafers', 'Canvas Shoes']
  },
  formal: {
    tops: ['Dress Shirt', 'Suit Jacket', 'Blazer', 'Waistcoat'],
    bottoms: ['Dress Pants', 'Suit Pants', 'Skirt'],
    shoes: ['Oxford Shoes', 'Heels', 'Formal Boots']
  },
  sports: {
    tops: ['Sports Jersey', 'Athletic Shirt', 'Tank Top', 'Compression Top'],
    bottoms: ['Athletic Pants', 'Leggings', 'Sports Shorts'],
    shoes: ['Running Shoes', 'Training Shoes', 'Basketball Shoes']
  },
  professional: {
    tops: ['Lab Coat', 'Scrubs', 'Chef Uniform', 'Police Uniform'],
    bottoms: ['Uniform Pants', 'Cargo Pants'],
    shoes: ['Work Boots', 'Professional Shoes']
  }
};

const accessories = [
  { id: 'glasses', name: 'Glasses', icon: <Glasses className="w-4 h-4" /> },
  { id: 'watch', name: 'Watch', icon: <Watch className="w-4 h-4" /> },
  { id: 'hat', name: 'Hat', icon: <Crown className="w-4 h-4" /> },
  { id: 'necklace', name: 'Necklace', icon: '📿' },
  { id: 'earrings', name: 'Earrings', icon: '👂' },
  { id: 'bracelet', name: 'Bracelet', icon: '📿' },
  { id: 'ring', name: 'Ring', icon: '💍' },
  { id: 'scarf', name: 'Scarf', icon: '🧣' },
  { id: 'tie', name: 'Tie', icon: '👔' },
  { id: 'backpack', name: 'Backpack', icon: '🎒' }
];

const ComprehensiveClothingControls: React.FC<ComprehensiveClothingControlsProps> = ({ config, onChange }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('casual');

  const toggleAccessory = (accessoryId: string) => {
    const current = config.accessories || [];
    const updated = current.includes(accessoryId)
      ? current.filter((id: string) => id !== accessoryId)
      : [...current, accessoryId];
    onChange('clothing', 'accessories', updated);
  };

  return (
    <div className="space-y-4">
      {/* Clothing Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            Clothing Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(clothingCategories).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>

          <div>
            <Label className="text-xs">Top</Label>
            <Select 
              value={config.clothingTop} 
              onValueChange={(value) => onChange('clothing', 'clothingTop', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clothingCategories[selectedCategory as keyof typeof clothingCategories].tops.map((item) => (
                  <SelectItem key={item} value={item.toLowerCase().replace(' ', '_')}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Bottom</Label>
            <Select 
              value={config.clothingBottom} 
              onValueChange={(value) => onChange('clothing', 'clothingBottom', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clothingCategories[selectedCategory as keyof typeof clothingCategories].bottoms.map((item) => (
                  <SelectItem key={item} value={item.toLowerCase().replace(' ', '_')}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Shoes</Label>
            <Select 
              value={config.shoes} 
              onValueChange={(value) => onChange('clothing', 'shoes', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clothingCategories[selectedCategory as keyof typeof clothingCategories].shoes.map((item) => (
                  <SelectItem key={item} value={item.toLowerCase().replace(' ', '_')}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accessories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Accessories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {accessories.map((acc) => {
              const isSelected = (config.accessories || []).includes(acc.id);
              return (
                <Button
                  key={acc.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleAccessory(acc.id)}
                  className="justify-start"
                >
                  {typeof acc.icon === 'string' ? acc.icon : acc.icon}
                  <span className="ml-2">{acc.name}</span>
                </Button>
              );
            })}
          </div>

          {config.accessories?.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-xs mb-2 block">Selected Accessories:</Label>
              <div className="flex flex-wrap gap-1">
                {config.accessories.map((id: string) => {
                  const acc = accessories.find(a => a.id === id);
                  return acc ? (
                    <Badge key={id} variant="secondary">
                      {acc.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveClothingControls;

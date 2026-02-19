import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image } from 'lucide-react';

interface AssetItem {
  id: string;
  name: string;
  thumbnail: string;
  category?: string;
  premium?: boolean;
}

interface VisualAssetLibraryProps {
  title: string;
  items: AssetItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  columns?: number;
  height?: string;
}

const VisualAssetLibrary: React.FC<VisualAssetLibraryProps> = ({
  title,
  items,
  selectedId,
  onSelect,
  columns = 3,
  height = "400px"
}) => {
  return (
    <Card className="card-gradient">
      <CardHeader className="avatar-section-header pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`w-full pr-4`} style={{ height }}>
          <div 
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  selectedId === item.id
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-white text-xs font-medium truncate">
                      {item.name}
                    </div>
                    {item.category && (
                      <div className="text-white/70 text-[10px] truncate">
                        {item.category}
                      </div>
                    )}
                  </div>
                </div>
                
                {item.premium && (
                  <Badge className="absolute top-2 right-2 text-[10px] px-1 py-0">
                    PRO
                  </Badge>
                )}
                
                {selectedId === item.id && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VisualAssetLibrary;

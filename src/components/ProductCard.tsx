
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, TrendingUp, Calendar, Download, Users } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    type: string;
    description: string;
    price: number;
    isFree: boolean;
    status: string;
    thumbnail: string;
    createdAt: string;
    stats: Record<string, number>;
  };
  viewMode: 'grid' | 'list';
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewStats: (id: string) => void;
  getStatusColor: (status: string) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  onEdit,
  onDelete,
  onViewStats,
  getStatusColor
}) => {
  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'Virtual Meeting': return Calendar;
      case 'Digital Product': return Download;
      case 'Brand Collection': return Users;
      default: return TrendingUp;
    }
  };

  const ProductIcon = getProductIcon(product.type);

  if (viewMode === 'list') {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:bg-white/90 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ProductIcon className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 truncate">{product.title}</h3>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                    <Badge variant="outline" className="text-slate-600">
                      {product.type}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm line-clamp-2 mb-2">
                  {product.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Views: {Object.values(product.stats)[0]}</span>
                  <span>•</span>
                  <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900">
                  {formatPrice(product.price, product.isFree)}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewStats(product.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(product.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:bg-white/90 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <ProductIcon className="w-6 h-6 text-blue-600" />
          </div>
          <Badge className={getStatusColor(product.status)}>
            {product.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-2 mb-1">
              {product.title}
            </CardTitle>
            <Badge variant="outline" className="text-xs text-slate-600">
              {product.type}
            </Badge>
          </div>
          
          <p className="text-slate-600 text-sm line-clamp-3">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-xl font-bold text-slate-900">
              {formatPrice(product.price, product.isFree)}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewStats(product.id)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(product.id)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Views: {Object.values(product.stats)[0]}</span>
            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

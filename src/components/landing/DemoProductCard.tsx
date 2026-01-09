import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Download, 
  Star, 
  Video,
  Lock,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  thumbnail_url?: string;
  product_type: 'digital' | 'physical' | 'virtual_meeting';
  is_free?: boolean;
  is_paid?: boolean;
  rating?: number;
  reviews_count?: number;
  views_count?: number;
  category?: string;
}

interface DemoProductCardProps {
  product: DemoProduct;
}

const DemoProductCard: React.FC<DemoProductCardProps> = ({ product }) => {
  const discount = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) 
    : 0;

  const isDigital = product.product_type === 'digital';
  const isVirtualMeeting = product.product_type === 'virtual_meeting';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getProductIcon = () => {
    if (isVirtualMeeting) return <Video className="w-5 h-5 text-blue-500" />;
    if (isDigital) return <Download className="w-5 h-5 text-cyan-500" />;
    return <Package className="w-5 h-5 text-purple-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            {product.thumbnail_url ? (
              <img 
                src={product.thumbnail_url} 
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                {getProductIcon()}
              </div>
            )}
            
            {/* Discount Badge */}
            {discount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] px-1.5 py-0 border-0">
                <Tag className="w-2.5 h-2.5 mr-0.5" />
                -{discount}%
              </Badge>
            )}

            {/* Paid Badge */}
            {product.is_paid && (
              <Badge className="absolute -top-1 -left-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 py-0 border-0">
                <Lock className="w-2.5 h-2.5 mr-0.5" />
                Paid
              </Badge>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{product.title}</h4>
              {isVirtualMeeting && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">
                  <Video className="w-2.5 h-2.5 mr-0.5" />
                  Live
                </Badge>
              )}
              {isDigital && !isVirtualMeeting && (
                <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 text-[10px] px-1.5 py-0">
                  <Download className="w-2.5 h-2.5 mr-0.5" />
                  Digital
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                {product.is_free ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    FREE
                  </Badge>
                ) : (
                  <>
                    <span className="text-base font-bold text-blue-600">{formatPrice(product.price)}</span>
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
                    )}
                  </>
                )}
              </div>
              
              {product.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                  {product.reviews_count && (
                    <span className="text-xs text-gray-400">({product.reviews_count})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <Button 
            size="sm" 
            className="w-full h-8 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            {product.is_free ? 'Get Free' : product.is_paid ? 'Purchase Access' : 'Buy Now'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default DemoProductCard;

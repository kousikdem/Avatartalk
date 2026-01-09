import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Download, 
  Star, 
  TrendingUp, 
  Truck,
  Shield,
  Tag,
  Award,
  Video,
  Users
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
  rating?: number;
  reviews_count?: number;
  views_count?: number;
  category?: string;
}

interface DemoProductCardProps {
  product: DemoProduct;
  isDarkMode?: boolean;
  compact?: boolean;
}

const DemoProductCard: React.FC<DemoProductCardProps> = ({ 
  product, 
  isDarkMode = true,
  compact = true 
}) => {
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
    if (isVirtualMeeting) return <Video className="w-5 h-5 text-blue-400" />;
    if (isDigital) return <Download className="w-5 h-5 text-cyan-400" />;
    return <Package className="w-5 h-5 text-purple-400" />;
  };

  if (isDarkMode && compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 border-slate-600/40 overflow-hidden hover:from-slate-800/80 hover:to-slate-700/60 transition-all duration-300 group">
          <div className="flex items-start gap-3 p-3">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {product.thumbnail_url ? (
                <img 
                  src={product.thumbnail_url} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600/40 to-purple-600/40 flex items-center justify-center">
                  {getProductIcon()}
                </div>
              )}
              
              {/* Discount Badge */}
              {discount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] px-1 py-0 border-0">
                  -{discount}%
                </Badge>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-white line-clamp-1">{product.title}</h4>
                {isVirtualMeeting && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] px-1.5 py-0">
                    <Video className="w-2.5 h-2.5 mr-0.5" />
                    Live
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-slate-400 line-clamp-1 mb-2">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  {product.is_free ? (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      FREE
                    </Badge>
                  ) : (
                    <>
                      <span className="text-base font-bold text-blue-400">{formatPrice(product.price)}</span>
                      {product.compare_at_price && (
                        <span className="text-xs text-slate-500 line-through">{formatPrice(product.compare_at_price)}</span>
                      )}
                    </>
                  )}
                </div>
                
                {product.rating && (
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-slate-300">{product.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="px-3 pb-3">
            <Button 
              size="sm" 
              className="w-full h-7 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {product.is_free ? 'Get Free' : 'Buy Now'}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Full size card (for non-compact view)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 group ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700/50' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
          {product.thumbnail_url ? (
            <img 
              src={product.thumbnail_url} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getProductIcon()}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-xs">
                <Tag className="w-3 h-3 mr-1" />
                SAVE {discount}%
              </Badge>
            )}
            {isDigital && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-xs">
                <Download className="w-3 h-3 mr-1" />
                Instant
              </Badge>
            )}
            {isVirtualMeeting && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                <Video className="w-3 h-3 mr-1" />
                Live Session
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {product.title}
              </h3>
              {product.category && (
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              )}
            </div>
            
            {product.rating && (
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.rating}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            {product.description}
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                {isDigital ? (
                  <Download className="w-3 h-3 text-blue-400" />
                ) : isVirtualMeeting ? (
                  <Video className="w-3 h-3 text-blue-400" />
                ) : (
                  <Truck className="w-3 h-3 text-blue-400" />
                )}
              </div>
              <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                {isDigital ? 'Instant Download' : isVirtualMeeting ? 'Live Meeting' : 'Fast Shipping'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <Shield className="w-3 h-3 text-green-400" />
              </div>
              <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                Secure Payment
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-end gap-2 pt-2">
            {product.is_free ? (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg px-3 py-1">
                <Award className="w-4 h-4 mr-1" />
                FREE
              </Badge>
            ) : (
              <>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-primary'}`}>
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className={`text-base line-through ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Views */}
          {product.views_count && (
            <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              <TrendingUp className="w-3 h-3" />
              {product.views_count} views
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.is_free ? 'Get Free Access' : 'Buy Now'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DemoProductCard;

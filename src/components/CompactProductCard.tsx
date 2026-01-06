import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Download, 
  Star, 
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Eye
} from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { CheckoutModal } from '@/components/CheckoutModal';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getShortTaxLabel, calculateTax } from '@/utils/taxCalculation';
import { useViewTracking } from '@/hooks/useViewTracking';

interface CompactProductCardProps {
  product: Product;
  sellerName?: string;
  showBuyButton?: boolean;
  currency?: string;
  exchangeRate?: number;
}

export const CompactProductCard = ({ 
  product, 
  sellerName,
  showBuyButton = true,
  currency = 'INR',
  exchangeRate = 1
}: CompactProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user for view tracking
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Track product view after 3 seconds when expanded
  useViewTracking({
    type: 'product',
    targetId: isExpanded ? product.id : '',
    viewerId: currentUserId,
    delaySeconds: 3
  });

  const handleBuyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Trigger voice notification for unregistered user
      try {
        const speechSynthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance("Please sign in or create an account to purchase this product.");
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Speech synthesis error:', e);
      }
      
      toast({
        title: "Sign In Required",
        description: "Please sign in or create an account to purchase products.",
        variant: "destructive",
      });
      
      // Dispatch event to show auth modal
      window.dispatchEvent(new CustomEvent('show-visitor-auth'));
      return;
    }
    
    setCheckoutOpen(true);
  };

  const displayPrice = product.price ? Math.round(product.price * exchangeRate) : 0;
  const compareAtPrice = product.compare_at_price ? Math.round(product.compare_at_price * exchangeRate) : null;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100) : 0;

  const isDigital = product.product_type === 'digital';
  const inStock = !product.track_inventory || (product.inventory_quantity || 0) > 0;
  const lowStock = product.track_inventory && 
                   (product.inventory_quantity || 0) <= (product.low_stock_threshold || 5) &&
                   (product.inventory_quantity || 0) > 0;

  return (
    <>
      <motion.div layout>
        <Card 
          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Compact View */}
          <div className="flex items-center gap-3 p-3">
            {/* Product Image */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {product.thumbnail_url ? (
                <img 
                  src={product.thumbnail_url} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {isDigital ? (
                    <Download className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              )}
              
              {/* Badges */}
              {discount > 0 && (
                <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  -{discount}%
                </Badge>
              )}
              {lowStock && inStock && (
                <Badge className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5">
                  <Clock className="w-2 h-2 mr-1" />
                  {product.inventory_quantity}
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                {product.title}
              </h3>
              <div className="flex items-center gap-2 mb-1">
                {product.product_category && (
                  <Badge variant="secondary" className="text-xs py-0 px-1.5">
                    {product.product_category}
                  </Badge>
                )}
                {product.average_rating && product.average_rating > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.average_rating}</span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0
                  }).format(displayPrice / 100)}
                </span>
                {compareAtPrice && compareAtPrice > displayPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: currency,
                      minimumFractionDigits: 0
                    }).format(compareAtPrice / 100)}
                  </span>
                )}
              </div>
            </div>

            {/* Expand Icon */}
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="pt-0 pb-4 px-4 space-y-3 border-t">
                  {/* Full Description */}
                  {product.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Seller Info */}
                  {sellerName && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Sold by</span>
                      <span className="font-medium">{sellerName}</span>
                    </div>
                  )}

                  {/* Product Type Badge */}
                  <div className="flex items-center gap-2">
                    <Badge className={isDigital ? "bg-blue-500" : "bg-green-500"}>
                      {isDigital ? (
                        <>
                          <Download className="w-3 h-3 mr-1" />
                          Digital - Instant Access
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3 mr-1" />
                          Physical - Fast Shipping
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Stock Status */}
                  {inStock ? (
                    lowStock ? (
                      <p className="text-sm text-orange-500 font-medium">
                        ⚠️ Only {product.inventory_quantity} left in stock
                      </p>
                    ) : product.track_inventory ? (
                      <p className="text-sm text-green-500 font-medium">
                        ✓ In Stock ({product.inventory_quantity} available)
                      </p>
                    ) : (
                      <p className="text-sm text-green-500 font-medium">
                        ✓ In Stock
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-red-500 font-medium">
                      ✗ Out of Stock
                    </p>
                  )}

                  {/* Reviews */}
                  {product.average_rating && product.average_rating > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(product.average_rating!) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground">
                        {product.average_rating} ({product.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Additional Pricing Info */}
                  {product.taxable && (
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>+ Tax ({getShortTaxLabel(product.tax_class)})</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: currency,
                          minimumFractionDigits: 0
                        }).format(calculateTax(displayPrice, product.tax_class, product.taxable) / 100)}
                      </span>
                    </div>
                  )}

                  {/* Buy Button */}
                  {showBuyButton && (
                    <Button 
                      className="w-full mt-2"
                      onClick={handleBuyClick}
                      disabled={!inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.is_free || product.price === 0 ? 'Get Free Access' : 'Buy Now'}
                    </Button>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={product}
        currency={currency}
      />
    </>
  );
};
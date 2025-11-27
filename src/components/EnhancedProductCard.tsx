import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Download, Star, TrendingUp } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { CheckoutModal } from '@/components/CheckoutModal';

interface EnhancedProductCardProps {
  product: Product;
  sellerName?: string;
  showBuyButton?: boolean;
  currency?: string;
  exchangeRate?: number;
}

export const EnhancedProductCard = ({ 
  product, 
  sellerName,
  showBuyButton = true,
  currency = 'INR',
  exchangeRate = 1
}: EnhancedProductCardProps) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const displayPrice = product.price ? Math.round(product.price * exchangeRate) : 0;
  const compareAtPrice = product.compare_at_price ? Math.round(product.compare_at_price * exchangeRate) : null;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100) : 0;

  const isDigital = product.product_type === 'digital';
  const isPhysical = product.product_type === 'physical';
  const inStock = !product.track_inventory || (product.inventory_quantity || 0) > 0;
  const lowStock = product.track_inventory && 
                   (product.inventory_quantity || 0) <= (product.low_stock_threshold || 5) &&
                   (product.inventory_quantity || 0) > 0;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.thumbnail_url ? (
            <img 
              src={product.thumbnail_url} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isDigital ? (
                <Download className="w-16 h-16 text-muted-foreground" />
              ) : (
                <Package className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}
            {isDigital && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                <Download className="w-3 h-3 mr-1" />
                Digital
              </Badge>
            )}
            {product.is_free && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                FREE
              </Badge>
            )}
          </div>

          {/* Stock status */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
          {lowStock && inStock && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-orange-500 text-white border-0">
              Only {product.inventory_quantity} left!
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Seller info */}
          {sellerName && (
            <p className="text-sm text-muted-foreground mb-2">
              by <span className="font-medium text-foreground">{sellerName}</span>
            </p>
          )}

          {/* Product title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Category & Tags */}
          {product.product_category && (
            <Badge variant="outline" className="mb-2">
              {product.product_category}
            </Badge>
          )}

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-3">
            {!product.is_free && (
              <>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0
                  }).format(displayPrice / 100)}
                </span>
                {compareAtPrice && compareAtPrice > displayPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: currency,
                      minimumFractionDigits: 0
                    }).format(compareAtPrice / 100)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Additional info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>4.5</span>
            </div>
            {product.views_count > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{product.views_count} views</span>
              </div>
            )}
          </div>
        </CardContent>

        {showBuyButton && (
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => setCheckoutOpen(true)}
              disabled={!inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.is_free ? 'Get Now' : 'Buy Now'}
            </Button>
          </CardFooter>
        )}

        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground border-t">
          <div className="w-full flex justify-between">
            <span>
              {isDigital ? '📥 Instant Download' : '📦 Physical Delivery'}
            </span>
            {isPhysical && product.shipping_enabled && (
              <span>
                + Shipping: {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0
                }).format((product.shipping_cost || 0) / 100)}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={product}
        currency={currency}
      />
    </>
  );
};
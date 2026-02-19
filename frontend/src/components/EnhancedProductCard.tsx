import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Package, 
  Download, 
  Star, 
  TrendingUp, 
  Truck,
  Shield,
  Clock,
  Tag,
  Award,
  CheckCircle2
} from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { CheckoutModal } from '@/components/CheckoutModal';
import { getTaxRate, getTaxLabel, calculateTax, getShortTaxLabel } from '@/utils/taxCalculation';

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
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 hover:border-primary/50">
        {/* Product Image with Enhanced Overlay */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {product.thumbnail_url ? (
            <img 
              src={product.thumbnail_url} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              {isDigital ? (
                <Download className="w-20 h-20 text-primary/40" />
              ) : (
                <Package className="w-20 h-20 text-primary/40" />
              )}
            </div>
          )}
          
          {/* Enhanced Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg px-3 py-1">
                <Tag className="w-3 h-3 mr-1" />
                SAVE {discount}%
              </Badge>
            )}
            {isDigital && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                <Download className="w-3 h-3 mr-1" />
                Instant Access
              </Badge>
            )}
            {product.is_free && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <Award className="w-3 h-3 mr-1" />
                FREE
              </Badge>
            )}
          </div>

          {/* Stock Status Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Badge variant="destructive" className="text-lg px-6 py-3 shadow-xl">
                  Out of Stock
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Check back soon</p>
              </div>
            </div>
          )}
          {lowStock && inStock && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0 shadow-lg animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              Only {product.inventory_quantity} left!
            </Badge>
          )}

          {/* Seller Badge */}
          {sellerName && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">
                  Sold by <span className="font-semibold text-foreground">{sellerName}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {product.title}
              </h3>
              
              {/* Category & Brand */}
              <div className="flex items-center gap-2 mb-2">
                {product.product_category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.product_category}
                  </Badge>
                )}
                {product.brand && (
                  <span className="text-xs text-muted-foreground">by {product.brand}</span>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.average_rating && product.average_rating > 0 ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{product.average_rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.total_reviews} reviews)</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No reviews yet</div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {product.description}
            </p>
          )}

          <Separator />

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              {isDigital ? (
                <>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Instant Download</p>
                    <p className="text-xs text-muted-foreground">Digital delivery</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Fast Shipping</p>
                    <p className="text-xs text-muted-foreground">2-5 business days</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% Protected</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing Section */}
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              {!product.is_free ? (
                <>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: currency,
                          minimumFractionDigits: 0
                        }).format(displayPrice / 100)}
                      </span>
                      {compareAtPrice && compareAtPrice > displayPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: currency,
                            minimumFractionDigits: 0
                          }).format(compareAtPrice / 100)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {discount > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">You Save</p>
                      <p className="text-lg font-bold text-green-500">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: currency,
                          minimumFractionDigits: 0
                        }).format((compareAtPrice! - displayPrice) / 100)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1">
                  <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500">
                    <Award className="w-4 h-4 mr-2" />
                    FREE Product
                  </Badge>
                </div>
              )}
            </div>

            {/* Additional Costs */}
            {isPhysical && product.shipping_enabled && product.shipping_cost && (
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Shipping Cost
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0
                  }).format((product.shipping_cost || 0) / 100)}
                </span>
              </div>
            )}

            {product.taxable && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>+ Tax ({getShortTaxLabel(product.tax_class)})</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: currency,
                      minimumFractionDigits: 0
                    }).format(calculateTax(displayPrice, product.tax_class, product.taxable) / 100)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stock Info */}
          {inStock && product.track_inventory && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>
                {lowStock 
                  ? `Hurry! Only ${product.inventory_quantity} left in stock`
                  : `In Stock (${product.inventory_quantity} available)`
                }
              </span>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {product.views_count || 0} views
              </span>
              {product.sku && (
                <span>SKU: {product.sku}</span>
              )}
            </div>
          </div>
        </CardContent>

        {/* Action Buttons */}
        {showBuyButton && (
          <CardFooter className="p-4 pt-0 flex flex-col gap-2">
            <Button 
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => setCheckoutOpen(true)}
              disabled={!inStock}
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.is_free ? 'Get Free Access' : 'Buy Now - Secure Checkout'}
            </Button>
            
            {inStock && (
              <p className="text-xs text-center text-muted-foreground">
                {isDigital 
                  ? '📥 Instant access after payment • Lifetime access'
                  : '📦 Fast delivery • Easy returns within 7 days'
                }
              </p>
            )}
          </CardFooter>
        )}
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
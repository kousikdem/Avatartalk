import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
  X
} from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { CheckoutModal } from '@/components/CheckoutModal';

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
  const [expanded, setExpanded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const displayPrice = product.price ? Math.round(product.price * exchangeRate) : 0;
  const compareAtPrice = product.compare_at_price ? Math.round(product.compare_at_price * exchangeRate) : null;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100) : 0;

  const isDigital = product.product_type === 'digital';
  const inStock = !product.track_inventory || (product.inventory_quantity || 0) > 0;

  return (
    <>
      {/* Compact Card */}
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30"
        onClick={() => setExpanded(true)}
      >
        {/* Compact Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {product.thumbnail_url ? (
            <img 
              src={product.thumbnail_url} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isDigital ? (
                <Download className="w-12 h-12 text-primary/40" />
              ) : (
                <Package className="w-12 h-12 text-primary/40" />
              )}
            </div>
          )}
          
          {/* Compact Badges */}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-xs">
              -{discount}%
            </Badge>
          )}
          {product.is_free && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0 text-xs">
              FREE
            </Badge>
          )}
        </div>

        {/* Compact Details */}
        <CardContent className="p-3 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
            {product.title}
          </h3>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            {!product.is_free ? (
              <div className="flex items-baseline gap-1">
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
            ) : (
              <Badge className="bg-green-500 text-white">FREE</Badge>
            )}

            {/* Rating */}
            {product.average_rating && product.average_rating > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.average_rating}</span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {!inStock && (
            <Badge variant="destructive" className="text-xs w-full justify-center">
              Out of Stock
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Expanded Modal */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-8">{product.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Image Gallery */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
              {product.thumbnail_url ? (
                <img 
                  src={product.thumbnail_url} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {isDigital ? (
                    <Download className="w-20 h-20 text-primary/40" />
                  ) : (
                    <Package className="w-20 h-20 text-primary/40" />
                  )}
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                    <Tag className="w-3 h-3 mr-1" />
                    SAVE {discount}%
                  </Badge>
                )}
                {isDigital && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                    <Download className="w-3 h-3 mr-1" />
                    Digital Product
                  </Badge>
                )}
                {product.is_free && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                    <Award className="w-3 h-3 mr-1" />
                    FREE
                  </Badge>
                )}
              </div>

              {!inStock && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-6 py-3 shadow-xl">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Category & Brand */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.product_category && (
                  <Badge variant="secondary">{product.product_category}</Badge>
                )}
                {product.brand && (
                  <span className="text-sm text-muted-foreground">by {product.brand}</span>
                )}
                {sellerName && (
                  <span className="text-sm text-muted-foreground">
                    Sold by <span className="font-semibold">{sellerName}</span>
                  </span>
                )}
              </div>

              {/* Rating */}
              {product.average_rating && product.average_rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-md">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.average_rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.total_reviews} reviews)</span>
                </div>
              )}

              <Separator />

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="font-semibold mb-2">Product Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {isDigital ? (
                    <>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Instant Download</p>
                        <p className="text-xs text-muted-foreground">Digital delivery</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Fast Shipping</p>
                        <p className="text-xs text-muted-foreground">2-5 business days</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">100% Protected</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pricing Section */}
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-end justify-between">
                  {!product.is_free ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
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
                  ) : (
                    <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500">
                      <Award className="w-4 h-4 mr-2" />
                      FREE Product
                    </Badge>
                  )}

                  {discount > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">You Save</p>
                      <p className="text-xl font-bold text-green-500">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: currency,
                          minimumFractionDigits: 0
                        }).format((compareAtPrice! - displayPrice) / 100)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Costs */}
                {!isDigital && product.shipping_enabled && product.shipping_cost && (
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
                  <p className="text-xs text-muted-foreground">
                    + Taxes as applicable (GST 18%)
                  </p>
                )}
              </div>

              {/* Stock Info */}
              {inStock && product.track_inventory && (
                <p className="text-sm text-muted-foreground">
                  In Stock: {product.inventory_quantity} available
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {product.views_count || 0} views
                </span>
                {product.sku && (
                  <span>SKU: {product.sku}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {showBuyButton && (
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => {
                    setExpanded(false);
                    setCheckoutOpen(true);
                  }}
                  disabled={!inStock}
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.is_free ? 'Get Free Access' : 'Buy Now - Secure Checkout'}
                </Button>
                
                {inStock && (
                  <p className="text-xs text-center text-muted-foreground">
                    {isDigital 
                      ? '📥 Instant access after payment'
                      : '📦 Fast delivery • Easy returns within 7 days'
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={product}
        currency={currency}
      />
    </>
  );
};

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
  Truck,
  Shield,
  Tag,
  Award,
  CheckCircle2,
  X
} from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { CheckoutModal } from '@/components/CheckoutModal';

interface CompactProductCardProps {
  product: Product;
  sellerName?: string;
  currency?: string;
  exchangeRate?: number;
}

export const CompactProductCard = ({ 
  product, 
  sellerName,
  currency = 'INR',
  exchangeRate = 1
}: CompactProductCardProps) => {
  const [expanded, setExpanded] = useState(false);
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
      {/* Compact Card */}
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => setExpanded(true)}
      >
        <div className="flex gap-3 p-3">
          {/* Compact Image */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {product.thumbnail_url ? (
              <img 
                src={product.thumbnail_url} 
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                {isDigital ? (
                  <Download className="w-8 h-8 text-primary/40" />
                ) : (
                  <Package className="w-8 h-8 text-primary/40" />
                )}
              </div>
            )}
            
            {/* Small Badge */}
            {discount > 0 && (
              <Badge className="absolute top-1 left-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Compact Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {product.title}
              </h4>
              
              <div className="flex items-center gap-2 mb-1">
                {product.average_rating && product.average_rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.average_rating}</span>
                  </div>
                ) : null}
                {isDigital && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    Digital
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
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
                  <Badge className="bg-green-500 text-xs">FREE</Badge>
                )}
              </div>
              
              <Button 
                size="sm" 
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setCheckoutOpen(true);
                }}
                disabled={!inStock}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Expanded Modal */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{product.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Large Product Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
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
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {discount > 0 && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-lg">
                    <Tag className="w-3 h-3 mr-1" />
                    SAVE {discount}%
                  </Badge>
                )}
                {isDigital && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0">
                    <Download className="w-3 h-3 mr-1" />
                    Instant Access
                  </Badge>
                )}
                {product.is_free && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0">
                    <Award className="w-3 h-3 mr-1" />
                    FREE
                  </Badge>
                )}
              </div>

              {!inStock && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-6 py-3">Out of Stock</Badge>
                </div>
              )}
            </div>

            {/* Seller Info */}
            {sellerName && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Sold by <span className="font-semibold text-foreground">{sellerName}</span>
                </p>
              </div>
            )}

            {/* Rating */}
            {product.average_rating && product.average_rating > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-md">
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
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                {isDigital ? (
                  <>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Instant Download</p>
                      <p className="text-xs text-muted-foreground">Digital delivery</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Fast Shipping</p>
                      <p className="text-xs text-muted-foreground">2-5 business days</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% Protected</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-3">
              {!product.is_free ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <div className="text-right">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
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
                      {discount > 0 && (
                        <p className="text-sm text-green-500 font-medium">
                          Save {discount}%
                        </p>
                      )}
                    </div>
                  </div>

                  {isPhysical && product.shipping_enabled && product.shipping_cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
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
                </>
              ) : (
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 w-full justify-center">
                  <Award className="w-4 h-4 mr-2" />
                  FREE Product
                </Badge>
              )}
            </div>

            {/* Stock Status */}
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

            <Separator />

            {/* Action Button */}
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
                  ? '📥 Instant access after payment • Lifetime access'
                  : '📦 Fast delivery • Easy returns within 7 days'
                }
              </p>
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
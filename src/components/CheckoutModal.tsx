import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { Loader2, Package, CreditCard, MapPin } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  currency: string;
}

export const CheckoutModal = ({ open, onClose, product, currency }: CheckoutModalProps) => {
  const { createCheckout, verifyPayment } = useOrders();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<{
    valid: boolean;
    message: string;
    discount?: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const isPhysical = product.product_type === 'physical';
  const isDigital = product.product_type === 'digital';

  const validatePromoCode = async () => {
    if (!discountCode || discountCode.length < 3) {
      setPromoValidation(null);
      return;
    }

    setIsValidatingPromo(true);
    try {
      const { data: promo, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !promo) {
        setPromoValidation({
          valid: false,
          message: 'Invalid promo code'
        });
        return;
      }

      // Check date validity
      const now = new Date();
      if (promo.starts_at && new Date(promo.starts_at) > now) {
        setPromoValidation({
          valid: false,
          message: 'Promo has not started yet'
        });
        return;
      }

      if (promo.expires_at && new Date(promo.expires_at) < now) {
        setPromoValidation({
          valid: false,
          message: 'Promo has expired'
        });
        return;
      }

      // Calculate discount
      const subtotal = (product.price || 0) * quantity;
      let discount = 0;
      
      if (promo.discount_type === 'percent') {
        discount = Math.round((subtotal * promo.discount_value) / 100);
      } else if (promo.discount_type === 'fixed') {
        discount = Math.min(promo.discount_value, subtotal);
      }

      setPromoValidation({
        valid: true,
        message: promo.discount_type === 'free_shipping' 
          ? 'Free shipping applied!' 
          : `Save ₹${(discount / 100).toFixed(2)}`,
        discount
      });
    } catch (error) {
      console.error('Error validating promo:', error);
      setPromoValidation(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      validatePromoCode();
    }, 500);
    return () => clearTimeout(timer);
  }, [discountCode]);

  const handleCheckout = async () => {
    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      return;
    }

    // Validate minimum order amount (₹1 minimum)
    const calculatedTotal = (product.price || 0) * quantity + (isPhysical && product.shipping_cost ? product.shipping_cost : 0);
    if (calculatedTotal < 100) {
      toast({
        title: "Invalid Order Amount",
        description: "Order total must be at least ₹1. Please check the product pricing.",
        variant: "destructive",
      });
      return;
    }

    // Validate shipping address for physical products
    if (isPhysical) {
      if (!shippingAddress.full_name || !shippingAddress.phone || 
          !shippingAddress.address_line1 || !shippingAddress.city || 
          !shippingAddress.state || !shippingAddress.pincode) {
        toast({
          title: "Error",
          description: "Please fill in all shipping details",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Create checkout session
      const checkoutData = await createCheckout({
        productId: product.id,
        quantity,
        shippingAddress: isPhysical ? shippingAddress : null,
        discountCode: discountCode || undefined,
        currency
      });

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      // Initialize Razorpay checkout
      const options = {
        key: checkoutData.key_id,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: product.title,
        description: product.description || `Purchase of ${product.title}`,
        order_id: checkoutData.razorpay_order_id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: checkoutData.order_id
            });
            
            onClose();
            
            toast({
              title: "Success!",
              description: isDigital 
                ? "Purchase complete! Check your chat for download links." 
                : "Order placed successfully! You'll receive updates via email.",
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
          }
        },
        prefill: isPhysical ? {
          name: shippingAddress.full_name,
          contact: shippingAddress.phone,
        } : {},
        theme: {
          color: '#6366f1'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function (response: any) {
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive",
        });
      });

    } catch (error: any) {
      console.error('Checkout error:', error);
      
      let errorMessage = "Failed to initiate checkout";
      
      // Provide specific error messages
      if (error.message?.includes('Unauthorized')) {
        errorMessage = "Please sign in to complete your purchase";
      } else if (error.message?.includes('Product not found')) {
        errorMessage = "This product is no longer available";
      } else if (error.message?.includes('Insufficient inventory')) {
        errorMessage = "Not enough items in stock";
      } else if (error.message?.includes('Razorpay credentials')) {
        errorMessage = "Payment system not configured. Please contact the seller.";
      } else if (error.message?.includes('minimum') || error.message?.includes('₹1')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Complete Your Purchase</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Product Details */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-background rounded-lg overflow-hidden border-2">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-lg">{product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {product.product_category && (
                    <Badge variant="secondary">{product.product_category}</Badge>
                  )}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        max={product.inventory_quantity || 999}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: currency,
                          minimumFractionDigits: 0
                        }).format((product.price || 0) / 100)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Type & Delivery Info */}
              <Separator />
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                {isDigital ? (
                  <>
                    <Badge className="bg-blue-500">Digital Product</Badge>
                    <span className="text-sm text-muted-foreground">
                      📥 Instant delivery via download link in chat
                    </span>
                  </>
                ) : (
                  <>
                    <Badge className="bg-green-500">Physical Product</Badge>
                    <span className="text-sm text-muted-foreground">
                      📦 Ships within 2-5 business days
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Full Description</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address (Physical products only) */}
          {isPhysical && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={shippingAddress.full_name}
                    onChange={(e) => setShippingAddress({...shippingAddress, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line1">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  value={shippingAddress.address_line1}
                  onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={shippingAddress.address_line2}
                  onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Discount Code */}
          <div className="space-y-2">
            <Label htmlFor="discount">Discount Code</Label>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  id="discount"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                />
                {promoValidation && (
                  <p className={`text-xs ${promoValidation.valid ? 'text-green-600' : 'text-destructive'}`}>
                    {promoValidation.message}
                  </p>
                )}
                {isValidatingPromo && (
                  <p className="text-xs text-muted-foreground">Validating...</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0
              }).format(((product.price || 0) * quantity) / 100)}</span>
            </div>
            {promoValidation?.valid && promoValidation.discount && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discountCode})</span>
                <span>-{new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0
                }).format((promoValidation.discount || 0) / 100)}</span>
              </div>
            )}
            {isPhysical && product.shipping_cost && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0
                }).format((product.shipping_cost || 0) / 100)}</span>
              </div>
            )}
            {product.taxable && (
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Tax (GST 18%)</span>
                <span>Calculated at payment</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0
              }).format(((product.price || 0) * quantity - (promoValidation?.discount || 0) + (isPhysical && product.shipping_cost ? product.shipping_cost : 0)) / 100)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button 
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Payment
              </>
            )}
          </Button>

          {isDigital && (
            <p className="text-xs text-center text-muted-foreground">
              📥 You'll receive download links via chat immediately after payment
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
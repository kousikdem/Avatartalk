import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
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

  const handleCheckout = async () => {
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

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout",
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
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="w-20 h-20 bg-background rounded flex items-center justify-center overflow-hidden">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-sm text-muted-foreground">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0
                }).format((product.price || 0) / 100)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Label>Quantity:</Label>
                <Input
                  type="number"
                  min="1"
                  max={product.inventory_quantity || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </div>
            </div>
          </div>

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
              <Input
                id="discount"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
              />
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
              }).format(((product.price || 0) * quantity + (isPhysical && product.shipping_cost ? product.shipping_cost : 0)) / 100)}</span>
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
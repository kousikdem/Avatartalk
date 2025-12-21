import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Video, Users, Clock, Calendar, 
  Zap, RefreshCw, ExternalLink, DollarSign,
  Play, Ticket, MapPin, Image
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VirtualProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  product_type: 'one_to_one' | 'webinar' | 'brand_collaboration' | 'recurring';
  price: number;
  currency: string;
  duration_mins: number;
  capacity: number;
  provider: 'google_meet' | 'zoom' | 'manual';
  join_url?: string;
  status: 'draft' | 'published' | 'hidden';
  event_date?: string;
  thumbnail_url?: string;
  created_at: string;
}

interface VirtualCollaborationCardProps {
  product: VirtualProduct;
  sellerName?: string;
  sellerAvatar?: string;
  currentUserId?: string | null;
  isDarkTheme?: boolean;
}

const VirtualCollaborationCard: React.FC<VirtualCollaborationCardProps> = ({
  product,
  sellerName,
  sellerAvatar,
  currentUserId,
  isDarkTheme = true
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const getProductTypeIcon = () => {
    switch (product.product_type) {
      case 'one_to_one': return <Users className="w-4 h-4" />;
      case 'webinar': return <Video className="w-4 h-4" />;
      case 'brand_collaboration': return <Zap className="w-4 h-4" />;
      case 'recurring': return <RefreshCw className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getProductTypeLabel = () => {
    switch (product.product_type) {
      case 'one_to_one': return 'One-to-One Call';
      case 'webinar': return 'Webinar/Event';
      case 'brand_collaboration': return 'Brand Collaboration';
      case 'recurring': return 'Recurring Series';
      default: return 'Virtual Meeting';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0
    }).format(price / 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Flexible Schedule';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProviderLabel = () => {
    switch (product.provider) {
      case 'google_meet': return 'Google Meet';
      case 'zoom': return 'Zoom';
      case 'manual': return 'Custom Link';
      default: return 'Virtual';
    }
  };

  const handleBookMeeting = async () => {
    if (!currentUserId) {
      // Trigger voice notification for unregistered user
      try {
        const speechSynthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance("Please sign in or create an account to book this virtual collaboration session.");
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Speech synthesis error:', e);
      }
      
      toast({
        title: "Sign In Required",
        description: "Please sign in or create an account to book this meeting.",
        variant: "destructive"
      });
      
      // Dispatch event to show auth modal
      window.dispatchEvent(new CustomEvent('show-visitor-auth'));
      return;
    }

    if (!bookingForm.full_name || !bookingForm.email) {
      toast({
        title: "Required Fields",
        description: "Please fill in your name and email.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Handle FREE products without Razorpay
      if (product.price === 0) {
        // Create order directly without payment - product_id is nullable for virtual collaborations
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: currentUserId,
            seller_id: product.user_id,
            // product_id is omitted for virtual collaborations as they use events table, not products
            amount: 0,
            total_amount: 0,
            currency: product.currency || 'INR',
            payment_method: 'free',
            payment_status: 'completed',
            order_status: 'completed',
            quantity: 1,
            metadata: {
              is_virtual_collaboration: true,
              virtual_product_id: product.id,
              product_type: product.product_type,
              duration_mins: product.duration_mins,
              buyer_info: bookingForm,
              event_date: product.event_date,
              join_url: product.join_url,
              title: product.title
            }
          });

        if (orderError) {
          console.error('Order creation error:', orderError);
          throw new Error(orderError.message || 'Failed to create booking');
        }

        toast({
          title: "Booking Confirmed!",
          description: product.join_url 
            ? "You can now join the meeting using the provided link." 
            : "You will receive the meeting link via email shortly.",
        });

        setIsBookingOpen(false);
        setBookingForm({ full_name: '', email: '', phone: '' });
        setIsProcessing(false);
        return;
      }

      // Paid products - use Razorpay
      const bookingAmount = Math.max(product.price, 100);

      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          amount: bookingAmount,
          currency: product.currency || 'INR',
          productId: product.id,
          productType: 'virtual_collaboration',
          buyerId: currentUserId,
          sellerId: product.user_id,
          metadata: {
            is_virtual_collaboration: true,
            product_type: product.product_type,
            duration_mins: product.duration_mins,
            buyer_info: bookingForm,
            event_date: product.event_date
          }
        }
      });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Failed to create order');
      }

      if (!orderData?.order_id && !orderData?.orderId) {
        throw new Error('No order ID received from payment gateway');
      }

      const razorpayOrderId = orderData.order_id || orderData.orderId;
      const razorpayKeyId = orderData.key_id;

      if (!razorpayKeyId) {
        throw new Error('Payment gateway not configured properly');
      }

      if (typeof window.Razorpay === 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load payment gateway'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Virtual Collaboration',
        description: product.title,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            const { error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
              body: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                productId: product.id,
                productType: 'virtual_collaboration',
                buyerId: currentUserId,
                sellerId: product.user_id,
                amount: orderData.amount,
                metadata: {
                  is_virtual_collaboration: true,
                  buyer_info: bookingForm,
                  event_date: product.event_date,
                  join_url: product.join_url
                }
              }
            });

            if (verifyError) throw verifyError;

            toast({
              title: "Booking Confirmed!",
              description: "You will receive the meeting link via email shortly.",
            });

            setIsBookingOpen(false);
            setBookingForm({ full_name: '', email: '', phone: '' });
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: bookingForm.full_name,
          email: bookingForm.email,
          contact: bookingForm.phone
        },
        theme: {
          color: '#6366f1'
        }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Your payment could not be processed.",
          variant: "destructive"
        });
        setIsProcessing(false);
      });
      razorpay.open();

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to process your booking. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleJoinMeeting = () => {
    if (product.join_url) {
      window.open(product.join_url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Meeting Link Not Available",
        description: "The meeting link will be shared after booking.",
      });
    }
  };

  const isPastEvent = product.event_date && new Date(product.event_date) < new Date();
  const isUpcoming = product.event_date && new Date(product.event_date) > new Date();

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <Card className="overflow-hidden border-2 transition-all duration-300 bg-white border-gray-200 hover:border-primary/50 shadow-md">
          {/* Thumbnail */}
          {product.thumbnail_url ? (
            <div className="relative h-32 overflow-hidden">
              <img 
                src={product.thumbnail_url} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <Badge 
                className="absolute top-2 left-2 gap-1 bg-primary/90 text-white"
                variant={product.product_type === 'webinar' ? 'default' : 'secondary'}
              >
                {getProductTypeIcon()}
                {getProductTypeLabel()}
              </Badge>
              {isUpcoming && (
                <Badge className="absolute top-2 right-2 bg-green-500 text-white font-semibold">
                  Upcoming
                </Badge>
              )}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="text-gray-600">
                  {getProductTypeIcon()}
                </div>
                <Badge className="mt-2 bg-primary/80 text-white" variant="secondary">
                  {getProductTypeLabel()}
                </Badge>
              </div>
            </div>
          )}

          <CardContent className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-bold text-base line-clamp-2 text-gray-900">
              {product.title}
            </h3>

            {/* Description */}
            <p className="text-sm line-clamp-2 text-gray-600">
              {product.description || 'Join this virtual collaboration session'}
            </p>

            {/* Event Date */}
            {product.event_date && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatDate(product.event_date)}</span>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {product.duration_mins}m
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {product.capacity}
                </span>
              </div>
              <span className="flex items-center gap-1 font-medium text-blue-600">
                <MapPin className="w-4 h-4" />
                {getProviderLabel()}
              </span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="font-bold text-lg text-primary">
                {product.price > 0 ? formatPrice(product.price, product.currency) : 'Free'}
              </div>
              <Button 
                size="sm" 
                className="gap-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-semibold shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.join_url && isPastEvent === false) {
                    handleJoinMeeting();
                  } else {
                    setIsBookingOpen(true);
                  }
                }}
              >
                {product.join_url && !isPastEvent ? (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Join
                  </>
                ) : (
                  <>
                    <Ticket className="w-3.5 h-3.5" />
                    Book
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getProductTypeIcon()}
              {product.title}
            </DialogTitle>
            <DialogDescription>
              {getProductTypeLabel()} • {product.duration_mins} minutes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {product.thumbnail_url && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={product.thumbnail_url} 
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <p className="text-muted-foreground text-sm">
              {product.description || 'Join this virtual collaboration session for an engaging experience.'}
            </p>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date & Time</p>
                <p className="font-medium">{formatDate(product.event_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{product.duration_mins} minutes</p>
              </div>
              <div>
                <p className="text-muted-foreground">Platform</p>
                <p className="font-medium">{getProviderLabel()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Capacity</p>
                <p className="font-medium">{product.capacity} participants</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Price</p>
                <p className="text-2xl font-bold text-primary">
                  {product.price > 0 ? formatPrice(product.price, product.currency) : 'Free'}
                </p>
              </div>
              <Button 
                size="lg"
                className="gap-2"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsBookingOpen(true);
                }}
              >
                <Ticket className="w-4 h-4" />
                Book Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book: {product.title}</DialogTitle>
            <DialogDescription>
              Fill in your details to complete the booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                placeholder="Enter your full name"
                value={bookingForm.full_name}
                onChange={(e) => setBookingForm(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={bookingForm.email}
                onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-xs text-muted-foreground">{product.title}</p>
              </div>
              <p className="text-xl font-bold text-primary">
                {product.price > 0 ? formatPrice(product.price, product.currency) : 'Free'}
              </p>
            </div>

            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleBookMeeting}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  {product.price > 0 ? 'Pay & Book' : 'Book for Free'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VirtualCollaborationCard;

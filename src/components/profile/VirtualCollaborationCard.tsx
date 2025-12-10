import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  MapPin,
  Star,
  ChevronRight,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VirtualProduct } from '@/hooks/useVirtualProducts';

interface VirtualCollaborationCardProps {
  product: VirtualProduct;
  sellerName?: string;
  sellerAvatar?: string;
  onBookingComplete?: () => void;
}

export const VirtualCollaborationCard = ({
  product,
  sellerName,
  sellerAvatar,
  onBookingComplete
}: VirtualCollaborationCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0
    }).format(price / 100);
  };

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'one_to_one': '1:1 Call',
      'webinar': 'Webinar',
      'group_session': 'Group Session',
      'workshop': 'Workshop',
      'consultation': 'Consultation',
      'coaching': 'Coaching'
    };
    return labels[type] || type;
  };

  const getProductTypeIcon = (type: string) => {
    switch(type) {
      case 'one_to_one': return <Video className="w-4 h-4" />;
      case 'webinar': return <Users className="w-4 h-4" />;
      case 'group_session': return <Users className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const handleBookNow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this session",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    
    try {
      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          amount: product.price,
          currency: product.currency || 'INR',
          receipt: `vc_${product.id}_${Date.now()}`,
          notes: {
            product_id: product.id,
            product_type: 'virtual_collaboration',
            buyer_id: user.id,
            seller_id: product.user_id
          }
        }
      });

      if (orderError) throw orderError;

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: product.price,
        currency: product.currency || 'INR',
        name: 'AvatarTalk.Co',
        description: product.title,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          // Verify payment
          const { error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              product_id: product.id,
              product_type: 'virtual_collaboration'
            }
          });

          if (verifyError) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Booking Confirmed!",
              description: "You will receive meeting details via email",
            });
            setIsDetailOpen(false);
            onBookingComplete?.();
          }
        },
        prefill: {
          email: user.email
        },
        theme: {
          color: '#3B82F6'
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsDetailOpen(true)}
        className="cursor-pointer"
      >
        <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Thumbnail */}
            <div className="relative h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
              {product.thumbnail_url ? (
                <img 
                  src={product.thumbnail_url} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-blue-400/50" />
                </div>
              )}
              
              {/* Type Badge */}
              <Badge className="absolute top-2 left-2 bg-blue-600/90 text-white text-xs px-2 py-1 flex items-center gap-1">
                {getProductTypeIcon(product.product_type)}
                {getProductTypeLabel(product.product_type)}
              </Badge>

              {/* Price Badge */}
              <Badge className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1">
                {formatPrice(product.price, product.currency)}
              </Badge>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2">
                {product.title}
              </h3>
              
              {product.tagline && (
                <p className="text-xs text-slate-400 line-clamp-1">
                  {product.tagline}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{product.duration_mins} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{product.capacity} {product.capacity > 1 ? 'spots' : 'spot'}</span>
                </div>
              </div>

              {/* Seller Info */}
              {sellerName && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                  {sellerAvatar ? (
                    <img src={sellerAvatar} alt={sellerName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{sellerName[0]}</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-300">{sellerName}</span>
                </div>
              )}

              {/* CTA */}
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDetailOpen(true);
                }}
              >
                Book Now
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{product.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Thumbnail */}
            {product.thumbnail_url && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={product.thumbnail_url} 
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                {getProductTypeIcon(product.product_type)}
                <span className="ml-1">{getProductTypeLabel(product.product_type)}</span>
              </Badge>
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                <Clock className="w-3 h-3 mr-1" />
                {product.duration_mins} minutes
              </Badge>
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                <Users className="w-3 h-3 mr-1" />
                {product.capacity} {product.capacity > 1 ? 'participants' : 'participant'}
              </Badge>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="font-semibold text-sm text-slate-300 mb-2">About this session</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Meeting Details */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-white">Session Details</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span className="capitalize">{product.meeting_provider.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{product.timezone}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 pt-2 border-t border-slate-700">
                {product.send_calendar_invite && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <Check className="w-3 h-3" />
                    <span>Calendar invite included</span>
                  </div>
                )}
                {product.reminder_24h && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <Check className="w-3 h-3" />
                    <span>24-hour reminder</span>
                  </div>
                )}
                {product.recording_allowed && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <Check className="w-3 h-3" />
                    <span>Recording available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Session Price</p>
                  <p className="text-2xl font-bold text-white">
                    {formatPrice(product.price, product.currency)}
                  </p>
                  {product.tax_rate && !product.tax_inclusive && (
                    <p className="text-xs text-slate-400">+ {product.tax_rate}% tax</p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                  onClick={handleBookNow}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Book & Pay
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Refund Policy */}
            {product.refund_policy && (
              <p className="text-xs text-slate-500 text-center">
                {product.refund_policy}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

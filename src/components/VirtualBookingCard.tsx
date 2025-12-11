import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, DollarSign, Video, User, 
  ExternalLink, CheckCircle2, XCircle, AlertCircle,
  Mail, Phone
} from 'lucide-react';
import { VirtualBooking } from '@/hooks/useVirtualCollaborations';

interface VirtualBookingCardProps {
  booking: VirtualBooking;
  type: 'received' | 'purchased';
}

const VirtualBookingCard: React.FC<VirtualBookingCardProps> = ({ booking, type }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'captured': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = new Date(booking.scheduled_at) > new Date();
  const canJoin = booking.status === 'confirmed' && isUpcoming && booking.join_url;

  return (
    <Card className="border-2 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
              <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                {booking.payment_status === 'captured' ? 'Paid' : booking.payment_status}
              </Badge>
              {isUpcoming && (
                <Badge variant="secondary">Upcoming</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(booking.scheduled_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(booking.scheduled_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {booking.duration_mins} min
              </span>
            </div>

            {/* Buyer Info (for received bookings) */}
            {type === 'received' && booking.buyer_info && (
              <div className="space-y-1 text-sm">
                {booking.buyer_info.full_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span>{booking.buyer_info.full_name}</span>
                  </div>
                )}
                {booking.buyer_info.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span>{booking.buyer_info.email}</span>
                  </div>
                )}
                {booking.buyer_info.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span>{booking.buyer_info.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Info */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(booking.amount)}
              </span>
              {type === 'received' && (
                <>
                  <span className="text-muted-foreground">
                    Fee: {formatCurrency(booking.platform_fee)}
                  </span>
                  <span className="text-green-600 font-medium">
                    Earnings: {formatCurrency(booking.seller_earnings)}
                  </span>
                </>
              )}
              {booking.discount_amount > 0 && (
                <span className="text-orange-600">
                  Discount: {formatCurrency(booking.discount_amount)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {canJoin && (
              <Button 
                className="gap-2"
                onClick={() => window.open(booking.join_url, '_blank')}
              >
                <Video className="w-4 h-4" />
                Join Meeting
              </Button>
            )}
            {!canJoin && booking.status === 'confirmed' && !isUpcoming && (
              <Button variant="outline" disabled>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </Button>
            )}
            {booking.status === 'pending' && (
              <Button variant="outline" disabled>
                <AlertCircle className="w-4 h-4 mr-2" />
                Awaiting Confirmation
              </Button>
            )}
            {booking.status === 'cancelled' && (
              <Button variant="outline" disabled className="text-red-500">
                <XCircle className="w-4 h-4 mr-2" />
                Cancelled
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualBookingCard;

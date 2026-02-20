import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, Clock, DollarSign, Video, User, 
  ExternalLink, CheckCircle2, XCircle, AlertCircle,
  Mail, Phone, Printer, Copy, Download, Eye,
  MapPin, Ticket, Share2
} from 'lucide-react';
import { VirtualBooking } from '@/hooks/useVirtualCollaborations';
import { useToast } from '@/hooks/use-toast';

interface VirtualBookingCardProps {
  booking: VirtualBooking;
  type: 'received' | 'purchased';
  productTitle?: string;
}

const VirtualBookingCard: React.FC<VirtualBookingCardProps> = ({ booking, type, productTitle }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

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
  const canJoin = (booking.status === 'confirmed' || booking.status === 'completed') && booking.join_url;

  const handleJoinMeeting = () => {
    if (booking.join_url) {
      window.open(booking.join_url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Meeting Link Not Available",
        description: "The meeting link will be shared shortly.",
      });
    }
  };

  const handleCopyLink = () => {
    if (booking.join_url) {
      navigator.clipboard.writeText(booking.join_url);
      toast({ title: "Copied!", description: "Meeting link copied to clipboard." });
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Booking Details</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #6366f1; margin-bottom: 4px; }
        .section { margin: 16px 0; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .label { color: #6b7280; font-size: 14px; }
        .value { font-weight: 600; font-size: 14px; }
        .divider { border-top: 1px solid #e5e7eb; margin: 12px 0; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .green { background: #dcfce7; color: #166534; }
        .yellow { background: #fef3c7; color: #92400e; }
        .blue { background: #dbeafe; color: #1e40af; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>${productTitle || 'Virtual Collaboration'}</h1>
      <p style="color:#6b7280;">Booking ID: ${booking.id.slice(0, 8)}...</p>
      <div class="section">
        <div class="row"><span class="label">Status</span><span class="badge ${booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'yellow' : 'blue'}">${booking.status}</span></div>
        <div class="row"><span class="label">Payment</span><span class="badge ${booking.payment_status === 'captured' ? 'green' : 'yellow'}">${booking.payment_status === 'captured' ? 'Paid' : booking.payment_status}</span></div>
      </div>
      <div class="section">
        <div class="row"><span class="label">Date</span><span class="value">${formatDate(booking.scheduled_at)}</span></div>
        <div class="row"><span class="label">Time</span><span class="value">${formatTime(booking.scheduled_at)}</span></div>
        <div class="row"><span class="label">Duration</span><span class="value">${booking.duration_mins} minutes</span></div>
      </div>
      ${booking.buyer_info?.full_name ? `<div class="section">
        <div class="row"><span class="label">Name</span><span class="value">${booking.buyer_info.full_name}</span></div>
        ${booking.buyer_info.email ? `<div class="row"><span class="label">Email</span><span class="value">${booking.buyer_info.email}</span></div>` : ''}
        ${booking.buyer_info.phone ? `<div class="row"><span class="label">Phone</span><span class="value">${booking.buyer_info.phone}</span></div>` : ''}
      </div>` : ''}
      <div class="section">
        <div class="row"><span class="label">Amount</span><span class="value">${formatCurrency(booking.amount)}</span></div>
        ${type === 'received' ? `
          <div class="row"><span class="label">Platform Fee</span><span class="value">${formatCurrency(booking.platform_fee)}</span></div>
          <div class="row"><span class="label">Earnings</span><span class="value" style="color:#16a34a">${formatCurrency(booking.seller_earnings)}</span></div>
        ` : ''}
        ${booking.discount_amount > 0 ? `<div class="row"><span class="label">Discount</span><span class="value" style="color:#ea580c">${formatCurrency(booking.discount_amount)}</span></div>` : ''}
      </div>
      ${booking.join_url ? `<div class="section"><div class="row"><span class="label">Meeting Link</span><span class="value"><a href="${booking.join_url}">${booking.join_url}</a></span></div></div>` : ''}
      <p style="text-align:center;color:#9ca3af;margin-top:24px;font-size:12px;">Printed on ${new Date().toLocaleString()}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <Card className="border-2 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
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
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(booking.amount)}
                </span>
                {type === 'received' && (
                  <span className="text-green-600 font-medium">
                    Earnings: {formatCurrency(booking.seller_earnings)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {canJoin && (
                <Button 
                  className="gap-2"
                  onClick={handleJoinMeeting}
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
              
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(true)} className="gap-1">
                <Eye className="w-3.5 h-3.5" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Booking Details
            </DialogTitle>
            <DialogDescription>
              {productTitle || 'Virtual Collaboration'} • ID: {booking.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>

          <div ref={printRef} className="space-y-4">
            {/* Status Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
              <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                {booking.payment_status === 'captured' ? 'Paid' : booking.payment_status}
              </Badge>
              {isUpcoming && <Badge variant="secondary">Upcoming</Badge>}
            </div>

            <Separator />

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(booking.scheduled_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">{formatTime(booking.scheduled_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{booking.duration_mins} minutes</p>
              </div>
              <div>
                <p className="text-muted-foreground">Booking ID</p>
                <p className="font-medium font-mono text-xs">{booking.id.slice(0, 12)}...</p>
              </div>
            </div>

            <Separator />

            {/* Attendee Info */}
            {booking.buyer_info && (
              <>
                <div>
                  <p className="text-sm font-semibold mb-2">Attendee Information</p>
                  <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-3">
                    {booking.buyer_info.full_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{booking.buyer_info.full_name}</span>
                      </div>
                    )}
                    {booking.buyer_info.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.buyer_info.email}</span>
                      </div>
                    )}
                    {booking.buyer_info.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.buyer_info.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Payment Info */}
            <div>
              <p className="text-sm font-semibold mb-2">Payment Details</p>
              <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">{formatCurrency(booking.amount)}</span>
                </div>
                {type === 'received' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="text-red-600">{formatCurrency(booking.platform_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Earnings</span>
                      <span className="font-bold text-green-600">{formatCurrency(booking.seller_earnings)}</span>
                    </div>
                  </>
                )}
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-orange-600">-{formatCurrency(booking.discount_amount)}</span>
                  </div>
                )}
                {booking.razorpay_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID</span>
                    <span className="font-mono text-xs">{booking.razorpay_payment_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Link */}
            {booking.join_url && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-2">Meeting Link</p>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Video className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-mono truncate flex-1">{booking.join_url}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopyLink}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 flex-wrap">
            {canJoin && (
              <Button className="gap-2 flex-1" onClick={handleJoinMeeting}>
                <Video className="w-4 h-4" />
                Join Meeting
              </Button>
            )}
            {booking.join_url && (
              <Button variant="outline" size="sm" className="gap-1" onClick={handleCopyLink}>
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VirtualBookingCard;

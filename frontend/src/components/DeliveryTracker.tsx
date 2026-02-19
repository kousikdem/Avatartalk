import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Package, Truck, CheckCircle, Download, 
  MapPin, Clock, FileText, AlertCircle 
} from 'lucide-react';
import { Order } from '@/hooks/useOrders';

interface DeliveryTrackerProps {
  order: Order;
}

export const DeliveryTracker = ({ order }: DeliveryTrackerProps) => {
  const isDigital = order.metadata && (order.metadata as any).product_type === 'digital';
  const isPhysical = !isDigital;

  const getStatusIcon = () => {
    switch (order.fulfillment_status) {
      case 'fulfilled': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_transit': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-orange-500" />;
      default: return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (order.fulfillment_status) {
      case 'fulfilled': return 'bg-green-500';
      case 'in_transit': return 'bg-blue-500';
      case 'processing': return 'bg-orange-500';
      default: return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Delivery Status
          </CardTitle>
          <Badge className={getStatusColor()}>
            {order.fulfillment_status || 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Digital Product Delivery */}
        {isDigital && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Download className="w-6 h-6 text-blue-500" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Digital Download</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Instant access to your digital product
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Delivery Method</h5>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Download Links Sent via Chat</p>
                  <p className="text-xs">Check your chat messages for instant download access</p>
                </div>
              </div>
            </div>

            <Separator />

            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              View Download Links in Chat
            </Button>
          </div>
        )}

        {/* Physical Product Delivery */}
        {isPhysical && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <Package className="w-6 h-6 text-green-500" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">Physical Delivery</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Shipping to your address
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h5>
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="font-medium">{(order.shipping_address as any).full_name}</p>
                  <p>{(order.shipping_address as any).address_line1}</p>
                  {(order.shipping_address as any).address_line2 && (
                    <p>{(order.shipping_address as any).address_line2}</p>
                  )}
                  <p>
                    {(order.shipping_address as any).city}, {(order.shipping_address as any).state} - {(order.shipping_address as any).pincode}
                  </p>
                  <p className="text-muted-foreground">{(order.shipping_address as any).country}</p>
                </div>
              </div>
            )}

            {/* Tracking Info */}
            {order.tracking_number && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Tracking Information
                </h5>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-mono">{order.tracking_number}</p>
                  <Button variant="link" className="p-0 h-auto text-xs mt-1">
                    Track Shipment
                  </Button>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Delivery Timeline</h5>
              <div className="space-y-3 ml-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-px h-8 bg-border" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm font-medium">Order Confirmed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {order.fulfillment_status === 'processing' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <div className="w-px h-8 bg-border" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm font-medium">Processing</p>
                      <p className="text-xs text-muted-foreground">Preparing your order</p>
                    </div>
                  </div>
                )}

                {order.fulfillment_status === 'in_transit' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <div className="w-px h-8 bg-border" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm font-medium">In Transit</p>
                      <p className="text-xs text-muted-foreground">On the way to you</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${order.fulfillment_status === 'fulfilled' ? 'bg-green-500' : 'bg-muted'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {order.fulfillment_status === 'fulfilled' ? 'Delivered' : 'Expected Delivery'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.fulfillment_status === 'fulfilled'
                        ? new Date(order.completed_at || '').toLocaleDateString()
                        : '2-5 business days'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-blue-700 dark:text-blue-300">
                You'll receive shipping updates via email and SMS
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
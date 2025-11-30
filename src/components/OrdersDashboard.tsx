import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, DollarSign, ShoppingCart, MapPin, Calendar } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDistanceToNow } from 'date-fns';
import { DeliveryTracker } from '@/components/DeliveryTracker';
import { useState } from 'react';

interface OrdersDashboardProps {
  type: 'buyer' | 'seller';
}

export const OrdersDashboard = ({ type }: OrdersDashboardProps) => {
  const { profileData } = useUserProfile();
  const { orders: buyerOrders } = useOrders(profileData?.id, 'buyer');
  const { orders: sellerOrders } = useOrders(profileData?.id, 'seller');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = type === 'buyer' ? buyerOrders : sellerOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'captured':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  // Calculate stats
  const totalOrders = orders.length;
  const totalSpent = orders.filter(o => type === 'buyer').reduce((sum, o) => sum + o.total_amount, 0);
  const totalEarnings = orders.filter(o => type === 'seller' && o.payment_status === 'captured').reduce((sum, o) => sum + (o.seller_earnings || 0), 0);
  const totalSales = orders.filter(o => type === 'seller').length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {type === 'buyer' ? 'Total Orders' : 'Total Sales'}
                </p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {type === 'buyer' ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalSpent, 'INR')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(orders.reduce((sum, o) => sum + o.amount, 0), 'INR')}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalEarnings, 'INR')}
                    </p>
                    <p className="text-xs text-muted-foreground">After platform fees</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {type === 'buyer' ? 'My Purchases' : 'Sales Orders'}
        </h3>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {type === 'buyer' ? 'No purchases yet' : 'No sales yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                      <Badge variant="outline">
                        {order.order_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Product Type</p>
                      <p className="font-medium">Digital</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {formatCurrency(order.amount, order.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(order.total_amount, order.currency)}
                      </p>
                    </div>
                  </div>

                  {type === 'seller' && order.seller_earnings && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span className="text-red-600">
                          - {formatCurrency(order.platform_fee || 0, order.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold mt-1">
                        <span>Your Earnings</span>
                        <span className="text-green-600">
                          {formatCurrency(order.seller_earnings, order.currency)}
                        </span>
                      </div>
                    </div>
                  )}

                  {order.shipping_address && (
                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">{order.shipping_address.full_name}</p>
                          <p className="text-muted-foreground">
                            {order.shipping_address.address_line1}
                            {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                          </p>
                          <p className="text-muted-foreground">
                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                          </p>
                          <p className="text-muted-foreground">
                            Phone: {order.shipping_address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        Tracking: <span className="font-mono font-medium text-foreground">{order.tracking_number}</span>
                      </p>
                    </div>
                  )}

                  {(order.order_status === 'completed' || order.order_status === 'shipped') && (
                    <DeliveryTracker order={order} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

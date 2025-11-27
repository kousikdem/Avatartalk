import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, TrendingUp, ShoppingBag, Download, MapPin } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useUserProfile } from '@/hooks/useUserProfile';

export const OrdersDashboard = () => {
  const { profileData } = useUserProfile();
  const { orders: buyerOrders, isLoading: buyerLoading } = useOrders(profileData?.id, 'buyer');
  const { orders: sellerOrders, isLoading: sellerLoading } = useOrders(profileData?.id, 'seller');

  const totalSpent = buyerOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalEarnings = sellerOrders.reduce((sum, order) => sum + order.seller_earnings, 0);
  const totalOrders = buyerOrders.length;
  const totalSales = sellerOrders.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent, 'INR')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings, 'INR')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchases">
            My Purchases ({buyerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="sales">
            My Sales ({sellerOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          {buyerLoading ? (
            <div>Loading...</div>
          ) : buyerOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No purchases yet</p>
              </CardContent>
            </Card>
          ) : (
            buyerOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{order.metadata?.product_title || 'Product'}</h3>
                        <Badge className={getStatusColor(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                        <Badge variant="outline">
                          {order.metadata?.product_type === 'digital' ? (
                            <><Download className="w-3 h-3 mr-1" />Digital</>
                          ) : (
                            <><Package className="w-3 h-3 mr-1" />Physical</>
                          )}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Order ID:</span> {order.id.slice(0, 8)}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {order.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {formatCurrency(order.total_amount, order.currency)}
                        </div>
                      </div>

                      {order.shipping_address && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium mb-2">
                            <MapPin className="w-4 h-4" />
                            Shipping Address
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>{order.shipping_address.full_name}</p>
                            <p>{order.shipping_address.address_line1}</p>
                            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                            <p>{order.shipping_address.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {sellerLoading ? (
            <div>Loading...</div>
          ) : sellerOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sales yet</p>
              </CardContent>
            </Card>
          ) : (
            sellerOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{order.metadata?.product_title || 'Product'}</h3>
                        <Badge className={getStatusColor(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                        <Badge variant="outline" className="bg-green-500 text-white">
                          +{formatCurrency(order.seller_earnings, order.currency)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Order ID:</span> {order.id.slice(0, 8)}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {order.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Order Total:</span> {formatCurrency(order.total_amount, order.currency)}
                        </div>
                        <div>
                          <span className="font-medium">Platform Fee:</span> -{formatCurrency(order.platform_fee, order.currency)}
                        </div>
                        <div>
                          <span className="font-medium">Your Earnings:</span> {formatCurrency(order.seller_earnings, order.currency)}
                        </div>
                      </div>

                      {order.shipping_address && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium mb-2">
                            <MapPin className="w-4 h-4" />
                            Deliver To
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>{order.shipping_address.full_name}</p>
                            <p>{order.shipping_address.address_line1}</p>
                            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                            <p>{order.shipping_address.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
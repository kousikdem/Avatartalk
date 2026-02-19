import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, ShoppingCart, DollarSign, TrendingUp, Users, 
  Calendar, BarChart3, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';

interface ProductAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

interface ProductStats {
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  recentOrders: any[];
  reviewStats: {
    averageRating: number;
    totalReviews: number;
  };
}

const ProductAnalyticsModal: React.FC<ProductAnalyticsModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [stats, setStats] = useState<ProductStats>({
    totalViews: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    recentOrders: [],
    reviewStats: { averageRating: 0, totalReviews: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && product) {
      fetchProductStats();
    }
  }, [isOpen, product]);

  const fetchProductStats = async () => {
    if (!product) return;
    
    setIsLoading(true);
    try {
      // Fetch orders for this product
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('product_id', product.id)
        .eq('payment_status', 'captured')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch reviews for this product
      const { data: reviews, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', product.id);

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + o.amount, 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = product.views_count > 0 
        ? (totalOrders / product.views_count) * 100 
        : 0;

      const totalReviews = reviews?.length || 0;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;

      setStats({
        totalViews: product.views_count,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        conversionRate,
        recentOrders: orders?.slice(0, 10) || [],
        reviewStats: { averageRating, totalReviews }
      });
    } catch (error) {
      console.error('Error fetching product stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics: {product.title}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Views</p>
                      <p className="text-xl font-bold">{stats.totalViews.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="text-xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                      <p className="text-xl font-bold">{stats.conversionRate.toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{product.product_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {product.is_free ? 'Free' : formatCurrency(product.price || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Order Value</p>
                    <p className="font-medium">{formatCurrency(stats.averageOrderValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">
                    {stats.reviewStats.averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= Math.round(stats.reviewStats.averageRating)
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats.reviewStats.totalReviews} reviews
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.amount)}</p>
                          <Badge variant="outline" className="text-xs">
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductAnalyticsModal;

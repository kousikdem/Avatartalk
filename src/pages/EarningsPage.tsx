import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingBag, Video, FileText, Users, TrendingUp, Clock } from 'lucide-react';
import { useEarnings } from '@/hooks/useEarnings';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardHeader from '@/components/DashboardHeader';

const typeLabels: Record<string, { label: string; color: string; icon: any }> = {
  product: { label: 'Product Sale', color: 'bg-blue-100 text-blue-800', icon: ShoppingBag },
  virtual_collab: { label: 'Virtual Collab', color: 'bg-purple-100 text-purple-800', icon: Video },
  post: { label: 'Post Sale', color: 'bg-pink-100 text-pink-800', icon: FileText },
  subscription: { label: 'Subscription', color: 'bg-green-100 text-green-800', icon: Users },
};

const formatUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

const EarningsPage = () => {
  const { earnings, loading } = useEarnings();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Earnings', value: formatUSD(earnings.totalEarnings), icon: DollarSign, gradient: 'from-emerald-500 to-green-600' },
    { title: 'Product Sales', value: formatUSD(earnings.productEarnings), icon: ShoppingBag, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Virtual Collabs', value: formatUSD(earnings.virtualCollabEarnings), icon: Video, gradient: 'from-purple-500 to-pink-600' },
    { title: 'Subscriptions', value: formatUSD(earnings.subscriptionEarnings), icon: Users, gradient: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <DashboardHeader
        title="Earnings"
        description="Track all your revenue streams in real-time"
        icon={<div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600"><DollarSign className="h-6 w-6 text-white" /></div>}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="overflow-hidden relative group hover:shadow-lg transition-all">
            <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${stat.gradient}`} />
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Recent Sales
            <Badge variant="secondary" className="ml-2">{earnings.recentSales.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.recentSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No sales yet. Start selling to see your earnings here!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {earnings.recentSales.map((sale) => {
                const typeInfo = typeLabels[sale.type] || typeLabels.product;
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sale.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{typeInfo.label}</Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">{formatUSD(sale.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsPage;

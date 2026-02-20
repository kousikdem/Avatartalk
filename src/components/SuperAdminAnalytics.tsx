import { useState } from 'react';
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Users, ShoppingCart, 
  Package, Brain, Coins, MessageSquare, RefreshCw,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const SuperAdminAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  const { analytics, loading, refetch } = usePlatformAnalytics(dateRange);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const end = new Date();
    let start: Date;
    
    switch (period) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      case '1y':
        start = subDays(end, 365);
        break;
      default:
        start = subDays(end, 30);
    }
    
    setDateRange({ start, end });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color = 'primary' }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-foreground">{value}</h3>
              {change !== undefined && (
                <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'} className="text-xs">
                  {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : null}
                  {change > 0 ? '+' : ''}{change}%
                </Badge>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-full bg-${color}/10`}>
            <Icon className={`h-5 w-5 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Analytics</h2>
          <p className="text-muted-foreground">Complete platform performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Platform Revenue KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard
          title="Platform Revenue"
          value={formatCurrency(analytics?.totalPlatformRevenue || 0)}
          change={15}
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Total Users"
          value={formatNumber(analytics?.totalUsers || 0)}
          change={8}
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(analytics?.activeUsers || 0)}
          icon={Users}
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(analytics?.totalOrders || 0)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Tokens Sold"
          value={formatNumber(analytics?.totalTokensSold || 0)}
          icon={Coins}
        />
        <StatCard
          title="AI Messages"
          value={formatNumber(analytics?.totalAIMessages || 0)}
          icon={Brain}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="tokens">Tokens & AI</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="top">Top Performers</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Product Fees" value={formatCurrency(analytics?.platformProductFees || 0)} icon={Package} />
            <StatCard title="Subscription Fees" value={formatCurrency(analytics?.platformSubscriptionFees || 0)} icon={Users} />
            <StatCard title="Token Revenue" value={formatCurrency(analytics?.totalTokenRevenue || 0)} icon={Coins} />
            <StatCard title="Total Revenue" value={formatCurrency(analytics?.totalPlatformRevenue || 0)} icon={DollarSign} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueTrend || []}>
                    <defs>
                      <linearGradient id="colorProdRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSubRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTokenRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickFormatter={(value) => `₹${formatNumber(value)}`} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="products" name="Products" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorProdRev)" />
                    <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#10b981" fillOpacity={1} fill="url(#colorSubRev)" />
                    <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTokenRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Products', value: analytics?.platformProductFees || 0 },
                          { name: 'Subscriptions', value: analytics?.platformSubscriptionFees || 0 },
                          { name: 'Tokens', value: analytics?.totalTokenRevenue || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[0, 1, 2].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Orders Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: analytics?.completedOrders || 0 },
                          { name: 'Pending', value: analytics?.pendingOrders || 0 },
                          { name: 'Failed', value: analytics?.failedOrders || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total Users" value={formatNumber(analytics?.totalUsers || 0)} icon={Users} />
            <StatCard title="New Today" value={formatNumber(analytics?.newUsersToday || 0)} icon={Users} />
            <StatCard title="New This Week" value={formatNumber(analytics?.newUsersThisWeek || 0)} icon={Users} />
            <StatCard title="New This Month" value={formatNumber(analytics?.newUsersThisMonth || 0)} icon={Users} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.userGrowthTrend || []}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Area type="monotone" dataKey="total" name="Total Users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" />
                    <Bar dataKey="new" name="New Users" fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total Products" value={formatNumber(analytics?.totalProducts || 0)} icon={Package} />
            <StatCard title="Published" value={formatNumber(analytics?.publishedProducts || 0)} icon={Package} />
            <StatCard title="Total Sales" value={formatNumber(analytics?.totalProductSales || 0)} icon={ShoppingCart} />
            <StatCard title="Revenue" value={formatCurrency(analytics?.totalProductRevenue || 0)} icon={DollarSign} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.productSalesTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value: number, name) => name === 'Revenue' ? formatCurrency(value) : value}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="sales" name="Sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topSellingProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge variant="outline">{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{product.seller}</TableCell>
                      <TableCell className="text-right">{product.sales}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                  {(!analytics?.topSellingProducts || analytics.topSellingProducts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No sales data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tokens & AI Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Tokens Sold" value={formatNumber(analytics?.totalTokensSold || 0)} icon={Coins} />
            <StatCard title="Token Revenue" value={formatCurrency(analytics?.totalTokenRevenue || 0)} icon={DollarSign} />
            <StatCard title="Tokens Used" value={formatNumber(analytics?.totalTokensUsed || 0)} icon={Brain} />
            <StatCard title="AI Conversations" value={formatNumber(analytics?.totalAIConversations || 0)} icon={MessageSquare} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Token Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.tokenUsageTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Bar dataKey="sold" name="Sold" fill="hsl(var(--primary))" />
                      <Bar dataKey="used" name="Used" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">AI Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.aiUsageTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Line type="monotone" dataKey="conversations" name="Conversations" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="messages" name="Messages" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total Posts" value={formatNumber(analytics?.totalPosts || 0)} icon={MessageSquare} />
            <StatCard title="Total Likes" value={formatNumber(analytics?.totalLikes || 0)} icon={TrendingUp} />
            <StatCard title="Total Comments" value={formatNumber(analytics?.totalComments || 0)} icon={MessageSquare} />
            <StatCard title="Total Follows" value={formatNumber(analytics?.totalFollows || 0)} icon={Users} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Engagement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.engagementTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Bar dataKey="posts" name="Posts" fill="hsl(var(--primary))" />
                    <Bar dataKey="likes" name="Likes" fill="#10b981" />
                    <Bar dataKey="comments" name="Comments" fill="#f59e0b" />
                    <Bar dataKey="follows" name="Follows" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="top" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Top Sellers</CardTitle>
                <CardDescription>Highest earning sellers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.topSellers.map((seller, index) => (
                      <TableRow key={seller.id}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'outline'}>{index + 1}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{seller.name}</p>
                            <p className="text-xs text-muted-foreground">{seller.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{seller.sales}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(seller.revenue)}</TableCell>
                      </TableRow>
                    ))}
                    {(!analytics?.topSellers || analytics.topSellers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No seller data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Top Creators</CardTitle>
                <CardDescription>Most followed creators</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Followers</TableHead>
                      <TableHead className="text-right">Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.topCreators.map((creator, index) => (
                      <TableRow key={creator.id}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'outline'}>{index + 1}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{creator.name}</TableCell>
                        <TableCell className="text-right">{formatNumber(creator.followers)}</TableCell>
                        <TableCell className="text-right">{formatNumber(creator.engagement)}</TableCell>
                      </TableRow>
                    ))}
                    {(!analytics?.topCreators || analytics.topCreators.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No creator data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminAnalytics;

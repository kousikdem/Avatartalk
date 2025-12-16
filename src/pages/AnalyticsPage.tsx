import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Eye, ShoppingCart, Users, 
  Heart, MessageSquare, Calendar as CalendarIcon, Package, Video,
  BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight, Globe
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import TokenDisplay from '@/components/TokenDisplay';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  const { analytics, loading, refetch } = useAnalytics(dateRange);

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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, suffix = '' }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    suffix?: string;
  }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground">{value}{suffix}</h3>
              {change !== undefined && (
                <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                  {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
                  {change > 0 ? '+' : ''}{change}%
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your performance and growth</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TokenDisplay />
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(analytics?.totalEarnings || 0)}
          change={12}
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Total Followers"
          value={formatNumber(analytics?.totalFollowers || 0)}
          change={8}
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Profile Views"
          value={formatNumber(analytics?.profileViews || 0)}
          change={-3}
          trend="down"
          icon={Eye}
        />
        <StatCard
          title="Engagement Score"
          value={analytics?.engagementScore?.toFixed(0) || '0'}
          suffix="/100"
          icon={TrendingUp}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Earnings Chart */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Earnings Overview</CardTitle>
              <CardDescription>Total earnings breakdown over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.earningsTrend || []}>
                    <defs>
                      <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${formatNumber(value)}`}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="products" name="Products" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorProducts)" />
                    <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#10b981" fillOpacity={1} fill="url(#colorSubs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Products Sold" value={formatNumber(analytics?.totalProductSales || 0)} icon={ShoppingCart} />
            <StatCard title="Subscribers" value={formatNumber(analytics?.totalSubscribers || 0)} icon={Users} />
            <StatCard title="Total Posts" value={formatNumber(analytics?.totalPosts || 0)} icon={MessageSquare} />
            <StatCard title="Total Likes" value={formatNumber(analytics?.totalPostLikes || 0)} icon={Heart} />
          </div>

          {/* Top Products */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Top Performing Products</CardTitle>
              <CardDescription>Your best selling products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.title}</p>
                        <p className="text-sm text-muted-foreground">{product.views} views • {product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(product.earnings)}</p>
                    </div>
                  </div>
                ))}
                {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No product data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Products" value={formatNumber(analytics?.totalProducts || 0)} icon={Package} />
            <StatCard title="Product Views" value={formatNumber(analytics?.totalProductViews || 0)} icon={Eye} />
            <StatCard title="Total Sales" value={formatNumber(analytics?.totalProductSales || 0)} icon={ShoppingCart} />
            <StatCard title="Product Earnings" value={formatCurrency(analytics?.totalProductEarnings || 0)} icon={DollarSign} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.productSalesTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" name="Sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Product Type Distribution */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Sales by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Physical', value: analytics?.physicalProductSales || 0 },
                          { name: 'Digital', value: analytics?.digitalProductSales || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Post Views" value={formatNumber(analytics?.totalPostViews || 0)} icon={Eye} />
            <StatCard title="Total Likes" value={formatNumber(analytics?.totalPostLikes || 0)} icon={Heart} />
            <StatCard title="Total Comments" value={formatNumber(analytics?.totalPostComments || 0)} icon={MessageSquare} />
            <StatCard title="Conversations" value={formatNumber(analytics?.totalConversations || 0)} icon={MessageSquare} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Engagement Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.postEngagementTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Bar dataKey="likes" name="Likes" fill="hsl(var(--primary))" />
                    <Bar dataKey="comments" name="Comments" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Followers" value={formatNumber(analytics?.totalFollowers || 0)} icon={Users} />
            <StatCard title="Following" value={formatNumber(analytics?.totalFollowing || 0)} icon={Users} />
            <StatCard title="Profile Views" value={formatNumber(analytics?.profileViews || 0)} icon={Eye} />
            <StatCard title="Link Clicks" value={formatNumber(analytics?.linkClicks || 0)} icon={Globe} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Follower Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.followerGrowthTrend || []}>
                    <defs>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Area type="monotone" dataKey="followers" name="Total Followers" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorFollowers)" />
                    <Line type="monotone" dataKey="gained" name="Gained" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="lost" name="Lost" stroke="#ef4444" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Views by Location */}
          {analytics?.viewsByLocation && analytics.viewsByLocation.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Views by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.viewsByLocation.map((location, index) => (
                    <div key={location.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span className="font-medium text-foreground">{location.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(location.views / analytics.viewsByLocation[0].views) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{location.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Subscribers" value={formatNumber(analytics?.totalSubscribers || 0)} icon={Users} />
            <StatCard title="Subscription Earnings" value={formatCurrency(analytics?.totalSubscriptionEarnings || 0)} icon={DollarSign} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Subscription Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.subscriptionTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="subscribers" name="New Subscribers" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="earnings" name="Earnings (₹)" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborations Tab */}
        <TabsContent value="collaborations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Events" value={formatNumber(analytics?.totalCollaborations || 0)} icon={Video} />
            <StatCard title="Total Bookings" value={formatNumber(analytics?.totalBookings || 0)} icon={CalendarIcon} />
            <StatCard title="Collaboration Earnings" value={formatCurrency(analytics?.totalCollaborationEarnings || 0)} icon={DollarSign} />
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Virtual Collaboration Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.collaborationTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Bar dataKey="bookings" name="Bookings" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;

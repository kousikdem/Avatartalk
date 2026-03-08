import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Eye, ShoppingCart, Users, 
  Heart, MessageSquare, Calendar as CalendarIcon, Package, Video,
  BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight, Globe, Lock, Zap
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import TokenDisplay from '@/components/TokenDisplay';
import PlanBadge, { planColors } from '@/components/PlanBadge';

// Modern gradient color palette
const CHART_GRADIENTS = {
  primary: { start: '#8B5CF6', end: '#6366F1' },
  success: { start: '#10B981', end: '#059669' },
  warning: { start: '#F59E0B', end: '#D97706' },
  danger: { start: '#EF4444', end: '#DC2626' },
  info: { start: '#06B6D4', end: '#0891B2' },
  pink: { start: '#EC4899', end: '#DB2777' },
  purple: { start: '#A855F7', end: '#9333EA' },
  indigo: { start: '#6366F1', end: '#4F46E5' },
};

const PIE_COLORS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#EC4899', '#6366F1', '#A855F7', '#EF4444'
];

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  const { analytics, loading, refetch } = useAnalytics(dateRange);
  const { canAccessAnalytics } = usePlanFeatures();
  const creatorPlanConfig = planColors.creator;

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

  const StatCard = ({ title, value, change, icon: Icon, trend, suffix = '', gradientFrom, gradientTo }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    suffix?: string;
    gradientFrom?: string;
    gradientTo?: string;
  }) => (
    <Card className="bg-card border-border overflow-hidden relative group hover:shadow-lg transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ 
          background: gradientFrom && gradientTo 
            ? `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` 
            : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.5))'
        }}
      />
      <CardContent className="p-6 relative z-10">
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
          <div 
            className="p-3 rounded-xl"
            style={{ 
              background: gradientFrom && gradientTo 
                ? `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` 
                : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))'
            }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Custom tooltip component for modern look
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ background: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold text-foreground">
                {formatter ? formatter(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // No loading skeleton - instant render
  if (loading) {
    return null;
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-6 sm:space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div 
            className="p-2 sm:p-3 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${CHART_GRADIENTS.primary.start}, ${CHART_GRADIENTS.primary.end})` }}
          >
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Track your performance and growth</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <TokenDisplay />
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32 bg-card border-border">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={refetch} className="hover:bg-primary/10">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(analytics?.totalEarnings || 0)}
          change={12}
          trend="up"
          icon={DollarSign}
          gradientFrom={CHART_GRADIENTS.success.start}
          gradientTo={CHART_GRADIENTS.success.end}
        />
        <StatCard
          title="Total Followers"
          value={formatNumber(analytics?.totalFollowers || 0)}
          change={8}
          trend="up"
          icon={Users}
          gradientFrom={CHART_GRADIENTS.primary.start}
          gradientTo={CHART_GRADIENTS.primary.end}
        />
        <StatCard
          title="Profile Views"
          value={formatNumber(analytics?.profileViews || 0)}
          change={-3}
          trend="down"
          icon={Eye}
          gradientFrom={CHART_GRADIENTS.info.start}
          gradientTo={CHART_GRADIENTS.info.end}
        />
        <StatCard
          title="Engagement Score"
          value={analytics?.engagementScore?.toFixed(0) || '0'}
          suffix="/100"
          icon={TrendingUp}
          gradientFrom={CHART_GRADIENTS.pink.start}
          gradientTo={CHART_GRADIENTS.pink.end}
        />
      </div>

      {/* Locked Content Component */}
      {!canAccessAnalytics ? (
        <Card className={`${creatorPlanConfig.bgClass} ${creatorPlanConfig.borderClass} border`}>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className={`p-4 rounded-full bg-gradient-to-r ${creatorPlanConfig.gradient}`}>
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className={`text-xl font-semibold ${creatorPlanConfig.textClass}`}>
                  Analytics Dashboard
                </h3>
                <PlanBadge planKey="creator" size="sm" />
              </div>
              <p className="text-muted-foreground max-w-md">
                Unlock detailed analytics to track your performance, monitor engagement, and grow your audience with actionable insights.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/pricing')}
              className={`bg-gradient-to-r ${creatorPlanConfig.gradient} text-white hover:opacity-90`}
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Creator
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1.5 rounded-xl flex overflow-x-auto scrollbar-none backdrop-blur-sm">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="visitors" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
              Visitors
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
              Products
            </TabsTrigger>
            <TabsTrigger value="engagement" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="followers" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
              Followers
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="collaborations" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
              Collaborations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
          {/* Earnings Chart */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                Earnings Overview
              </CardTitle>
              <CardDescription>Total earnings breakdown over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.earningsTrend || []}>
                    <defs>
                      <linearGradient id="gradientProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.primary.start} stopOpacity={0.4}/>
                        <stop offset="50%" stopColor={CHART_GRADIENTS.primary.end} stopOpacity={0.15}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.primary.end} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradientSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.success.start} stopOpacity={0.4}/>
                        <stop offset="50%" stopColor={CHART_GRADIENTS.success.end} stopOpacity={0.15}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.success.end} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="strokeProducts" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.primary.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.primary.end}/>
                      </linearGradient>
                      <linearGradient id="strokeSubs" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.success.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.success.end}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${formatNumber(value)}`}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      content={<CustomTooltip formatter={formatCurrency} />}
                      labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 20 }}
                      formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="products" 
                      name="Products" 
                      stroke="url(#strokeProducts)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#gradientProducts)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="subscriptions" 
                      name="Subscriptions" 
                      stroke="url(#strokeSubs)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#gradientSubs)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Products Sold" 
              value={formatNumber(analytics?.totalProductSales || 0)} 
              icon={ShoppingCart} 
              gradientFrom={CHART_GRADIENTS.warning.start}
              gradientTo={CHART_GRADIENTS.warning.end}
            />
            <StatCard 
              title="Subscribers" 
              value={formatNumber(analytics?.totalSubscribers || 0)} 
              icon={Users} 
              gradientFrom={CHART_GRADIENTS.purple.start}
              gradientTo={CHART_GRADIENTS.purple.end}
            />
            <StatCard 
              title="Total Posts" 
              value={formatNumber(analytics?.totalPosts || 0)} 
              icon={MessageSquare} 
              gradientFrom={CHART_GRADIENTS.info.start}
              gradientTo={CHART_GRADIENTS.info.end}
            />
            <StatCard 
              title="Total Likes" 
              value={formatNumber(analytics?.totalPostLikes || 0)} 
              icon={Heart} 
              gradientFrom={CHART_GRADIENTS.danger.start}
              gradientTo={CHART_GRADIENTS.danger.end}
            />
          </div>

          {/* Top Products */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                Top Performing Products
              </CardTitle>
              <CardDescription>Your best selling products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ 
                          background: `linear-gradient(135deg, ${PIE_COLORS[index % PIE_COLORS.length]}, ${PIE_COLORS[(index + 1) % PIE_COLORS.length]})`
                        }}
                      >
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

        {/* Visitors Tab */}
        <TabsContent value="visitors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Profile Views" value={formatNumber(analytics?.profileViews || 0)} icon={Eye} gradientFrom={CHART_GRADIENTS.primary.start} gradientTo={CHART_GRADIENTS.primary.end} />
            <StatCard title="Product Views" value={formatNumber(analytics?.totalProductViews || 0)} icon={Package} gradientFrom={CHART_GRADIENTS.success.start} gradientTo={CHART_GRADIENTS.success.end} />
            <StatCard title="Post Views" value={formatNumber(analytics?.totalPostViews || 0)} icon={MessageSquare} gradientFrom={CHART_GRADIENTS.info.start} gradientTo={CHART_GRADIENTS.info.end} />
            <StatCard title="Total Conversations" value={formatNumber(analytics?.totalConversations || 0)} icon={Users} gradientFrom={CHART_GRADIENTS.purple.start} gradientTo={CHART_GRADIENTS.purple.end} />
          </div>

          {/* Profile Views Trend */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                Visitor Trend
              </CardTitle>
              <CardDescription>Profile views over time (3s+ duration)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.engagementTrend || []}>
                    <defs>
                      <linearGradient id="gradientViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.info.start} stopOpacity={0.4}/>
                        <stop offset="50%" stopColor={CHART_GRADIENTS.info.end} stopOpacity={0.15}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.info.end} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="strokeViews" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.info.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.info.end}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                    <Area type="monotone" dataKey="views" name="Profile Views" stroke="url(#strokeViews)" strokeWidth={3} fillOpacity={1} fill="url(#gradientViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Views by Location */}
          {analytics?.viewsByLocation && analytics.viewsByLocation.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  Visitors by Location
                </CardTitle>
                <CardDescription>Geographic distribution of your profile visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.viewsByLocation.map((location, index) => (
                    <div key={location.country} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${PIE_COLORS[index % PIE_COLORS.length]}, ${PIE_COLORS[(index + 1) % PIE_COLORS.length]})` }}
                        >
                          {index + 1}
                        </span>
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{location.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(location.views / analytics.viewsByLocation[0].views) * 100}%`,
                              background: `linear-gradient(90deg, ${PIE_COLORS[index % PIE_COLORS.length]}, ${PIE_COLORS[(index + 1) % PIE_COLORS.length]})`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-12 text-right">{location.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* View Analytics Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                  View Distribution
                </CardTitle>
                <CardDescription>Breakdown of views across different content types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="pieGrad0" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.primary.start}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.primary.end}/>
                        </linearGradient>
                        <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.success.start}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.success.end}/>
                        </linearGradient>
                        <linearGradient id="pieGrad2" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.info.start}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.info.end}/>
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[
                          { name: 'Profile Views', value: analytics?.profileViews || 0 },
                          { name: 'Product Views', value: analytics?.totalProductViews || 0 },
                          { name: 'Post Views', value: analytics?.totalPostViews || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={80}
                        innerRadius={50}
                        strokeWidth={0}
                        dataKey="value"
                      >
                        <Cell fill="url(#pieGrad0)" />
                        <Cell fill="url(#pieGrad1)" />
                        <Cell fill="url(#pieGrad2)" />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                  Engagement Metrics
                </CardTitle>
                <CardDescription>How visitors interact with your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Profile Views</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: CHART_GRADIENTS.primary.start }}>{formatNumber(analytics?.profileViews || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Product Views</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: CHART_GRADIENTS.success.start }}>{formatNumber(analytics?.totalProductViews || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Post Views</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: CHART_GRADIENTS.info.start }}>{formatNumber(analytics?.totalPostViews || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Engagement Score</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: CHART_GRADIENTS.purple.start }}>{analytics?.engagementScore?.toFixed(0) || '0'}/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Products" value={formatNumber(analytics?.totalProducts || 0)} icon={Package} gradientFrom={CHART_GRADIENTS.indigo.start} gradientTo={CHART_GRADIENTS.indigo.end} />
            <StatCard title="Product Views" value={formatNumber(analytics?.totalProductViews || 0)} icon={Eye} gradientFrom={CHART_GRADIENTS.info.start} gradientTo={CHART_GRADIENTS.info.end} />
            <StatCard title="Total Sales" value={formatNumber(analytics?.totalProductSales || 0)} icon={ShoppingCart} gradientFrom={CHART_GRADIENTS.warning.start} gradientTo={CHART_GRADIENTS.warning.end} />
            <StatCard title="Product Earnings" value={formatCurrency(analytics?.totalProductEarnings || 0)} icon={DollarSign} gradientFrom={CHART_GRADIENTS.success.start} gradientTo={CHART_GRADIENTS.success.end} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.productSalesTrend || []}>
                      <defs>
                        <linearGradient id="strokeSales" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.indigo.start}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.purple.end}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        name="Sales" 
                        stroke="url(#strokeSales)" 
                        strokeWidth={3}
                        dot={{ fill: CHART_GRADIENTS.indigo.start, strokeWidth: 0, r: 4 }}
                        activeDot={{ fill: CHART_GRADIENTS.purple.end, strokeWidth: 0, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Product Type Distribution */}
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                  Sales by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="piePhysical" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.warning.start}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.warning.end}/>
                        </linearGradient>
                        <linearGradient id="pieDigital" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.info.start}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.info.end}/>
                        </linearGradient>
                      </defs>
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
                        innerRadius={50}
                        strokeWidth={0}
                        dataKey="value"
                      >
                        <Cell fill="url(#piePhysical)" />
                        <Cell fill="url(#pieDigital)" />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
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
            <StatCard title="Post Views" value={formatNumber(analytics?.totalPostViews || 0)} icon={Eye} gradientFrom={CHART_GRADIENTS.info.start} gradientTo={CHART_GRADIENTS.info.end} />
            <StatCard title="Total Likes" value={formatNumber(analytics?.totalPostLikes || 0)} icon={Heart} gradientFrom={CHART_GRADIENTS.danger.start} gradientTo={CHART_GRADIENTS.danger.end} />
            <StatCard title="Total Comments" value={formatNumber(analytics?.totalPostComments || 0)} icon={MessageSquare} gradientFrom={CHART_GRADIENTS.success.start} gradientTo={CHART_GRADIENTS.success.end} />
            <StatCard title="Conversations" value={formatNumber(analytics?.totalConversations || 0)} icon={MessageSquare} gradientFrom={CHART_GRADIENTS.purple.start} gradientTo={CHART_GRADIENTS.purple.end} />
          </div>

          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />
                Engagement Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.postEngagementTrend || []}>
                    <defs>
                      <linearGradient id="barLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.danger.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.danger.end}/>
                      </linearGradient>
                      <linearGradient id="barComments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.success.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.success.end}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                    <Bar dataKey="likes" name="Likes" fill="url(#barLikes)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comments" name="Comments" fill="url(#barComments)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Followers" value={formatNumber(analytics?.totalFollowers || 0)} icon={Users} gradientFrom={CHART_GRADIENTS.primary.start} gradientTo={CHART_GRADIENTS.primary.end} />
            <StatCard title="Following" value={formatNumber(analytics?.totalFollowing || 0)} icon={Users} gradientFrom={CHART_GRADIENTS.info.start} gradientTo={CHART_GRADIENTS.info.end} />
            <StatCard title="Profile Views" value={formatNumber(analytics?.profileViews || 0)} icon={Eye} gradientFrom={CHART_GRADIENTS.success.start} gradientTo={CHART_GRADIENTS.success.end} />
            <StatCard title="Link Clicks" value={formatNumber(analytics?.linkClicks || 0)} icon={Globe} gradientFrom={CHART_GRADIENTS.warning.start} gradientTo={CHART_GRADIENTS.warning.end} />
          </div>

          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                Follower Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.followerGrowthTrend || []}>
                    <defs>
                      <linearGradient id="gradientFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.primary.start} stopOpacity={0.4}/>
                        <stop offset="50%" stopColor={CHART_GRADIENTS.primary.end} stopOpacity={0.15}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.primary.end} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="strokeFollowers" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.primary.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.primary.end}/>
                      </linearGradient>
                      <linearGradient id="strokeGained" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.success.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.success.end}/>
                      </linearGradient>
                      <linearGradient id="strokeLost" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.danger.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.danger.end}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                    <Area type="monotone" dataKey="followers" name="Total Followers" stroke="url(#strokeFollowers)" strokeWidth={3} fillOpacity={1} fill="url(#gradientFollowers)" />
                    <Line type="monotone" dataKey="gained" name="Gained" stroke="url(#strokeGained)" strokeWidth={2} dot={{ fill: CHART_GRADIENTS.success.start, strokeWidth: 0, r: 3 }} />
                    <Line type="monotone" dataKey="lost" name="Lost" stroke="url(#strokeLost)" strokeWidth={2} dot={{ fill: CHART_GRADIENTS.danger.start, strokeWidth: 0, r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Views by Location */}
          {analytics?.viewsByLocation && analytics.viewsByLocation.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                  Views by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.viewsByLocation.map((location, index) => (
                    <div key={location.country} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${PIE_COLORS[index % PIE_COLORS.length]}, ${PIE_COLORS[(index + 1) % PIE_COLORS.length]})` }}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground">{location.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(location.views / analytics.viewsByLocation[0].views) * 100}%`,
                              background: `linear-gradient(90deg, ${PIE_COLORS[index % PIE_COLORS.length]}, ${PIE_COLORS[(index + 1) % PIE_COLORS.length]})`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-12 text-right">{location.views}</span>
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
            <StatCard title="Active Subscribers" value={formatNumber(analytics?.totalSubscribers || 0)} icon={Users} gradientFrom={CHART_GRADIENTS.purple.start} gradientTo={CHART_GRADIENTS.purple.end} />
            <StatCard title="Subscription Earnings" value={formatCurrency(analytics?.totalSubscriptionEarnings || 0)} icon={DollarSign} gradientFrom={CHART_GRADIENTS.success.start} gradientTo={CHART_GRADIENTS.success.end} />
          </div>

          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500" />
                Subscription Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.subscriptionTrend || []}>
                    <defs>
                      <linearGradient id="strokeSubscribers" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.purple.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.purple.end}/>
                      </linearGradient>
                      <linearGradient id="strokeSubEarnings" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.success.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.success.end}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="subscribers" 
                      name="New Subscribers" 
                      stroke="url(#strokeSubscribers)" 
                      strokeWidth={3}
                      dot={{ fill: CHART_GRADIENTS.purple.start, strokeWidth: 0, r: 4 }}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="earnings" 
                      name="Earnings (₹)" 
                      stroke="url(#strokeSubEarnings)" 
                      strokeWidth={3}
                      dot={{ fill: CHART_GRADIENTS.success.start, strokeWidth: 0, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborations Tab */}
        <TabsContent value="collaborations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Events" value={formatNumber(analytics?.totalCollaborations || 0)} icon={Video} gradientFrom={CHART_GRADIENTS.pink.start} gradientTo={CHART_GRADIENTS.pink.end} />
            <StatCard title="Total Bookings" value={formatNumber(analytics?.totalBookings || 0)} icon={CalendarIcon} gradientFrom={CHART_GRADIENTS.info.start} gradientTo={CHART_GRADIENTS.info.end} />
            <StatCard title="Collaboration Earnings" value={formatCurrency(analytics?.totalCollaborationEarnings || 0)} icon={DollarSign} gradientFrom={CHART_GRADIENTS.success.start} gradientTo={CHART_GRADIENTS.success.end} />
          </div>

          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                Virtual Collaboration Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.collaborationTrend || []}>
                    <defs>
                      <linearGradient id="barBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.pink.start}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.pink.end}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                    <Bar dataKey="bookings" name="Bookings" fill="url(#barBookings)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalyticsPage;

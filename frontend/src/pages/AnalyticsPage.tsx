import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  RadialBarChart, RadialBar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Eye, ShoppingCart, Users,
  Heart, MessageSquare, Package, Video, CalendarIcon,
  BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight, Globe, Lock, Zap, Activity
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import TokenDisplay from '@/components/TokenDisplay';
import PlanBadge, { planColors } from '@/components/PlanBadge';

// ─── Colour System ──────────────────────────────────────────────────────────
const C = {
  violet:  { a: '#8B5CF6', b: '#6D28D9' },
  cyan:    { a: '#06B6D4', b: '#0891B2' },
  emerald: { a: '#10B981', b: '#047857' },
  amber:   { a: '#F59E0B', b: '#B45309' },
  rose:    { a: '#F43F5E', b: '#BE123C' },
  blue:    { a: '#3B82F6', b: '#1D4ED8' },
  fuchsia: { a: '#D946EF', b: '#A21CAF' },
  indigo:  { a: '#6366F1', b: '#4338CA' },
} as const;

const PIE_RING = [
  '#8B5CF6','#06B6D4','#10B981','#F59E0B',
  '#F43F5E','#3B82F6','#D946EF','#6366F1',
];

// ─── Shared chart defaults ───────────────────────────────────────────────────
const AXIS_STYLE = { fill: '#64748b', fontSize: 11, fontFamily: 'inherit' };
const GRID_COLOR = 'rgba(255,255,255,0.04)';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ModernTooltip = ({ active, payload, label, fmtValue }: any) => {
  if (!active || !payload?.length) return null;
  let displayLabel = label;
  try { displayLabel = format(new Date(label), 'MMM d, yyyy'); } catch {}
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/60 min-w-[160px]">
      <p className="text-xs text-slate-400 font-medium mb-3 pb-2 border-b border-white/8">{displayLabel}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color || e.fill }} />
            <span className="text-xs text-slate-400">{e.name}</span>
          </div>
          <span className="text-sm font-bold text-white">
            {fmtValue ? fmtValue(e.value) : e.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Glowing Active Dot ───────────────────────────────────────────────────────
const GlowDot = (color: string) => (props: any) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill={color} opacity={0.5} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
};

// ─── Custom Legend Row ───────────────────────────────────────────────────────
const ChartLegend = ({ items }: { items: { label: string; color: string }[] }) => (
  <div className="flex flex-wrap gap-4 justify-center mt-4">
    {items.map(it => (
      <div key={it.label} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: it.color }} />
        <span className="text-xs text-slate-400">{it.label}</span>
      </div>
    ))}
  </div>
);

// ─── KPI Stat Card ────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, change, trend, icon: Icon, from, to }: {
  title: string; value: string; change?: number;
  trend?: 'up' | 'down'; icon: any; from: string; to: string;
}) => (
  <div
    className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 group cursor-default"
    style={{
      background: 'rgba(15,15,25,0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: `0 0 30px ${from}18`,
    }}
  >
    {/* glow blob */}
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
      style={{ background: `radial-gradient(circle, ${from}, ${to})` }} />
    <div className="flex items-center justify-between relative z-10">
      <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</p>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 4px 15px ${from}40` }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-white tracking-tight relative z-10">{value}</p>
    {change !== undefined && (
      <div className="flex items-center gap-1 relative z-10">
        {trend === 'up'
          ? <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
        <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
        <span className="text-xs text-slate-500 ml-1">vs prev period</span>
      </div>
    )}
  </div>
);

// ─── Chart Card Wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, accent, children }: {
  title: string; subtitle?: string; accent: string; children: React.ReactNode;
}) => (
  <div
    className="rounded-2xl p-5 sm:p-6"
    style={{
      background: 'rgba(10,10,20,0.8)',
      border: `1px solid ${accent}25`,
      boxShadow: `0 0 40px ${accent}10, inset 0 1px 0 rgba(255,255,255,0.05)`,
    }}
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ─── Donut with centre stat ───────────────────────────────────────────────────
const DonutCenter = ({ data, colors, centerLabel, centerValue, fmtValue }: {
  data: { name: string; value: number }[];
  colors: string[]; centerLabel: string; centerValue: string;
  fmtValue?: (v: number) => string;
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {colors.map((c, i) => (
              <radialGradient key={i} id={`dg${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c} stopOpacity={1} />
                <stop offset="100%" stopColor={c} stopOpacity={0.6} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={60} outerRadius={88}
            dataKey="value" strokeWidth={0}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#dg${i})`}
                style={{ filter: `drop-shadow(0 0 6px ${colors[i % colors.length]}80)` }} />
            ))}
          </Pie>
          <Tooltip content={<ModernTooltip fmtValue={fmtValue} />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-white">{centerValue}</span>
        <span className="text-xs text-slate-400 mt-0.5">{centerLabel}</span>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState({ start: subDays(new Date(), 30), end: new Date() });
  const { analytics, loading, refetch } = useAnalytics(dateRange);
  const { canAccessAnalytics } = usePlanFeatures();
  const creatorPlanConfig = planColors.creator;

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const end = new Date();
    const days: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    setDateRange({ start: subDays(end, days[period] ?? 30), end });
  };

  const $$ = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  const fmtN = (v: number) =>
    v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v);

  const xFmt = (d: string) => { try { return format(new Date(d), 'MMM d'); } catch { return d; } };

  if (loading) return null;

  return (
    <div
      className="min-h-screen p-3 sm:p-5 space-y-6"
      style={{ background: 'linear-gradient(160deg,#08080f 0%,#0d0d1a 50%,#08080f 100%)' }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${C.violet.a},${C.indigo.b})`,
              boxShadow: `0 0 20px ${C.violet.a}60` }}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Analytics</h1>
            <p className="text-xs text-slate-500">Track performance & growth</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TokenDisplay />
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32 bg-slate-900/60 border-slate-700/50 text-slate-300 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {[['7d','Last 7 days'],['30d','Last 30 days'],['90d','Last 90 days'],['1y','Last year']]
                .map(([v, l]) => <SelectItem key={v} value={v} className="text-slate-300">{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon"
            className="border-slate-700/50 bg-slate-900/60 text-slate-400 hover:text-white rounded-xl w-8 h-8"
            onClick={refetch}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Top KPI row (always visible) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Total Earnings" value={$$(analytics?.totalEarnings||0)} change={12} trend="up" icon={DollarSign} from={C.emerald.a} to={C.emerald.b} />
        <KpiCard title="Total Followers" value={fmtN(analytics?.totalFollowers||0)} change={8} trend="up" icon={Users} from={C.violet.a} to={C.violet.b} />
        <KpiCard title="Profile Views" value={fmtN(analytics?.profileViews||0)} change={-3} trend="down" icon={Eye} from={C.cyan.a} to={C.cyan.b} />
        <KpiCard title="Engagement Score" value={`${analytics?.engagementScore?.toFixed(0)||'0'}/100`} icon={Activity} from={C.fuchsia.a} to={C.fuchsia.b} />
      </div>

      {/* ── Locked state ── */}
      {!canAccessAnalytics ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-5"
          style={{ background:'rgba(10,10,20,0.8)', border:`1px solid ${C.violet.a}30` }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background:`linear-gradient(135deg,${C.violet.a},${C.indigo.b})`, boxShadow:`0 0 30px ${C.violet.a}50` }}>
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-center">
              Analytics Dashboard <PlanBadge planKey="creator" size="sm" />
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              Unlock detailed analytics to track performance, monitor engagement, and grow your audience.
            </p>
          </div>
          <Button onClick={() => navigate('/pricing')}
            className={`bg-gradient-to-r ${creatorPlanConfig.gradient} text-white hover:opacity-90 rounded-xl`}>
            <Zap className="w-4 h-4 mr-2" /> Upgrade to Creator
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-5">
          {/* Tab list */}
          <TabsList className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-1.5 flex overflow-x-auto gap-1 scrollbar-none h-auto">
            {[['overview','Overview'],['visitors','Visitors'],['products','Products'],
              ['engagement','Engagement'],['followers','Followers'],
              ['subscriptions','Subscriptions'],['collaborations','Collab']].map(([v,l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-xl text-xs px-3 py-1.5 text-slate-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-600/30 whitespace-nowrap transition-all">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ───────────── OVERVIEW TAB ───────────── */}
          <TabsContent value="overview" className="space-y-5 mt-0">

            {/* Earnings Multi-Area */}
            <ChartCard title="Earnings Overview" subtitle="Products & Subscriptions revenue over time" accent={C.violet.a}>
              <div className="h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.earningsTrend||[]} margin={{ top:8,right:8,left:0,bottom:0 }}>
                    <defs>
                      <linearGradient id="aEarn1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.violet.a} stopOpacity={0.6}/>
                        <stop offset="100%" stopColor={C.violet.a} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="aEarn2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.emerald.a} stopOpacity={0.6}/>
                        <stop offset="100%" stopColor={C.emerald.a} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={xFmt} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v=>`$${fmtN(v)}`} tick={AXIS_STYLE} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<ModernTooltip fmtValue={$$} />} />
                    <Area type="monotone" dataKey="products" name="Products" stroke={C.violet.a} strokeWidth={2.5} fill="url(#aEarn1)"
                      dot={false} activeDot={GlowDot(C.violet.a)} style={{ filter:`drop-shadow(0 0 6px ${C.violet.a})` }} />
                    <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke={C.emerald.a} strokeWidth={2.5} fill="url(#aEarn2)"
                      dot={false} activeDot={GlowDot(C.emerald.a)} style={{ filter:`drop-shadow(0 0 6px ${C.emerald.a})` }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <ChartLegend items={[{label:'Products',color:C.violet.a},{label:'Subscriptions',color:C.emerald.a}]} />
            </ChartCard>

            {/* 4-col mini stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Products Sold"    value={fmtN(analytics?.totalProductSales||0)} icon={ShoppingCart} from={C.amber.a}   to={C.amber.b} />
              <KpiCard title="Subscribers"      value={fmtN(analytics?.totalSubscribers||0)}  icon={Users}        from={C.fuchsia.a} to={C.fuchsia.b} />
              <KpiCard title="Total Posts"       value={fmtN(analytics?.totalPosts||0)}         icon={MessageSquare} from={C.cyan.a}    to={C.cyan.b} />
              <KpiCard title="Total Likes"       value={fmtN(analytics?.totalPostLikes||0)}     icon={Heart}        from={C.rose.a}    to={C.rose.b} />
            </div>

            {/* Top Products table */}
            <ChartCard title="Top Performing Products" subtitle="Best-selling products by earnings" accent={C.amber.a}>
              <div className="space-y-2">
                {(analytics?.topProducts||[]).slice(0,5).map((p,i) => (
                  <div key={p.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background:`rgba(255,255,255,0.03)`, border:`1px solid rgba(255,255,255,0.05)` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background:`linear-gradient(135deg,${PIE_RING[i%PIE_RING.length]},${PIE_RING[(i+2)%PIE_RING.length]})`,
                          boxShadow:`0 0 10px ${PIE_RING[i%PIE_RING.length]}50` }}>
                        {i+1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.views} views · {p.sales} sales</p>
                      </div>
                    </div>
                    <p className="text-sm font-extrabold" style={{ color:PIE_RING[i%PIE_RING.length] }}>{$$(p.earnings)}</p>
                  </div>
                ))}
                {!analytics?.topProducts?.length && (
                  <p className="text-center text-slate-500 py-6 text-sm">No product data yet</p>
                )}
              </div>
            </ChartCard>
          </TabsContent>

          {/* ───────────── VISITORS TAB ───────────── */}
          <TabsContent value="visitors" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Profile Views"     value={fmtN(analytics?.profileViews||0)}       icon={Eye}          from={C.violet.a} to={C.violet.b} />
              <KpiCard title="Product Views"     value={fmtN(analytics?.totalProductViews||0)}  icon={Package}      from={C.emerald.a} to={C.emerald.b} />
              <KpiCard title="Post Views"         value={fmtN(analytics?.totalPostViews||0)}     icon={MessageSquare} from={C.cyan.a}   to={C.cyan.b} />
              <KpiCard title="Conversations"     value={fmtN(analytics?.totalConversations||0)} icon={Users}        from={C.fuchsia.a} to={C.fuchsia.b} />
            </div>

            {/* Visitor trend — cyan glow area */}
            <ChartCard title="Visitor Trend" subtitle="Profile views (3 s+ sessions)" accent={C.cyan.a}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.engagementTrend||[]} margin={{ top:8,right:8,left:0,bottom:0 }}>
                    <defs>
                      <linearGradient id="aVis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.cyan.a} stopOpacity={0.7}/>
                        <stop offset="100%" stopColor={C.cyan.a} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={xFmt} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
                    <Tooltip content={<ModernTooltip />} />
                    <Area type="monotone" dataKey="views" name="Profile Views" stroke={C.cyan.a} strokeWidth={3}
                      fill="url(#aVis)" dot={false} activeDot={GlowDot(C.cyan.a)}
                      style={{ filter:`drop-shadow(0 0 8px ${C.cyan.a})` }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Donut — view distribution */}
              <ChartCard title="View Distribution" subtitle="Breakdown across content types" accent={C.fuchsia.a}>
                <DonutCenter
                  data={[
                    { name:'Profile Views', value: analytics?.profileViews||0 },
                    { name:'Product Views', value: analytics?.totalProductViews||0 },
                    { name:'Post Views',    value: analytics?.totalPostViews||0 },
                  ]}
                  colors={[C.violet.a, C.emerald.a, C.cyan.a]}
                  centerLabel="Total" centerValue={fmtN((analytics?.profileViews||0)+(analytics?.totalProductViews||0)+(analytics?.totalPostViews||0))}
                />
                <ChartLegend items={[
                  {label:'Profile Views',color:C.violet.a},
                  {label:'Product Views',color:C.emerald.a},
                  {label:'Post Views',   color:C.cyan.a},
                ]} />
              </ChartCard>

              {/* Engagement metrics list */}
              <ChartCard title="Engagement Metrics" subtitle="How visitors interact with your content" accent={C.rose.a}>
                <div className="space-y-3">
                  {[
                    { label:'Profile Views',     val: analytics?.profileViews||0,      color: C.violet.a,  icon: Eye },
                    { label:'Product Views',     val: analytics?.totalProductViews||0, color: C.emerald.a, icon: Package },
                    { label:'Post Views',        val: analytics?.totalPostViews||0,    color: C.cyan.a,    icon: MessageSquare },
                    { label:'Engagement Score',  val: analytics?.engagementScore||0,   color: C.fuchsia.a, icon: TrendingUp, suffix:'/100' },
                  ].map(({ label, val, color, icon: Icon, suffix }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background:`${color}10`, border:`1px solid ${color}25` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background:`linear-gradient(135deg,${color}cc,${color}80)`, boxShadow:`0 4px 12px ${color}40` }}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-slate-300">{label}</span>
                      </div>
                      <span className="text-base font-extrabold" style={{ color }}>
                        {fmtN(val)}{suffix||''}
                      </span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Location bar */}
            {(analytics?.viewsByLocation?.length ?? 0) > 0 && (
              <ChartCard title="Visitors by Location" subtitle="Geographic distribution" accent={C.emerald.a}>
                <div className="space-y-2">
                  {analytics!.viewsByLocation.map((loc, i) => {
                    const pct = analytics!.viewsByLocation[0].views > 0
                      ? (loc.views / analytics!.viewsByLocation[0].views) * 100 : 0;
                    return (
                      <div key={loc.country} className="flex items-center gap-3 py-1.5">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background:`linear-gradient(135deg,${PIE_RING[i%PIE_RING.length]},${PIE_RING[(i+1)%PIE_RING.length]})` }}>{i+1}</span>
                        <span className="text-sm text-slate-300 w-28 truncate">{loc.country}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width:`${pct}%`, background:`linear-gradient(90deg,${PIE_RING[i%PIE_RING.length]},${PIE_RING[(i+2)%PIE_RING.length]})`,
                              boxShadow:`0 0 6px ${PIE_RING[i%PIE_RING.length]}80` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400 w-10 text-right">{loc.views}</span>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            )}
          </TabsContent>

          {/* ───────────── PRODUCTS TAB ───────────── */}
          <TabsContent value="products" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Total Products"   value={fmtN(analytics?.totalProducts||0)}       icon={Package}      from={C.indigo.a} to={C.indigo.b} />
              <KpiCard title="Product Views"    value={fmtN(analytics?.totalProductViews||0)}   icon={Eye}          from={C.cyan.a}   to={C.cyan.b} />
              <KpiCard title="Total Sales"       value={fmtN(analytics?.totalProductSales||0)}   icon={ShoppingCart} from={C.amber.a}  to={C.amber.b} />
              <KpiCard title="Product Earnings" value={$$(analytics?.totalProductEarnings||0)}  icon={DollarSign}   from={C.emerald.a} to={C.emerald.b} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Sales trend — indigo glow line */}
              <ChartCard title="Sales Trend" accent={C.indigo.a}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.productSalesTrend||[]} margin={{ top:8,right:8,left:0,bottom:0 }}>
                      <defs>
                        <linearGradient id="aSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.indigo.a} stopOpacity={0.6}/>
                          <stop offset="100%" stopColor={C.indigo.a} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tickFormatter={xFmt} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                      <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
                      <Tooltip content={<ModernTooltip />} />
                      <Area type="monotone" dataKey="sales" name="Sales" stroke={C.indigo.a} strokeWidth={3}
                        fill="url(#aSales)" dot={false} activeDot={GlowDot(C.indigo.a)}
                        style={{ filter:`drop-shadow(0 0 8px ${C.indigo.a})` }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Sales by type — donut */}
              <ChartCard title="Sales by Type" subtitle="Physical vs Digital breakdown" accent={C.amber.a}>
                <DonutCenter
                  data={[
                    { name:'Physical', value: analytics?.physicalProductSales||0 },
                    { name:'Digital',  value: analytics?.digitalProductSales||0  },
                  ]}
                  colors={[C.amber.a, C.cyan.a]}
                  centerLabel="Total"
                  centerValue={fmtN((analytics?.physicalProductSales||0)+(analytics?.digitalProductSales||0))}
                />
                <ChartLegend items={[{label:'Physical',color:C.amber.a},{label:'Digital',color:C.cyan.a}]} />
              </ChartCard>
            </div>
          </TabsContent>

          {/* ───────────── ENGAGEMENT TAB ───────────── */}
          <TabsContent value="engagement" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Post Views"    value={fmtN(analytics?.totalPostViews||0)}    icon={Eye}          from={C.cyan.a}    to={C.cyan.b} />
              <KpiCard title="Total Likes"   value={fmtN(analytics?.totalPostLikes||0)}    icon={Heart}        from={C.rose.a}    to={C.rose.b} />
              <KpiCard title="Comments"      value={fmtN(analytics?.totalPostComments||0)} icon={MessageSquare} from={C.emerald.a} to={C.emerald.b} />
              <KpiCard title="Conversations" value={fmtN(analytics?.totalConversations||0)} icon={Users}       from={C.fuchsia.a} to={C.fuchsia.b} />
            </div>

            {/* Engagement bar chart — grouped, colourful */}
            <ChartCard title="Engagement Over Time" subtitle="Likes & comments per day" accent={C.rose.a}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.postEngagementTrend||[]} margin={{ top:8,right:8,left:0,bottom:0 }} barGap={4}>
                    <defs>
                      <linearGradient id="bLike" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.rose.a} stopOpacity={1}/>
                        <stop offset="100%" stopColor={C.rose.b} stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="bCmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.emerald.a} stopOpacity={1}/>
                        <stop offset="100%" stopColor={C.emerald.b} stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={xFmt} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<ModernTooltip />} />
                    <Bar dataKey="likes" name="Likes" fill="url(#bLike)" radius={[6,6,0,0]} maxBarSize={28}
                      style={{ filter:`drop-shadow(0 2px 8px ${C.rose.a}50)` }} />
                    <Bar dataKey="comments" name="Comments" fill="url(#bCmt)" radius={[6,6,0,0]} maxBarSize={28}
                      style={{ filter:`drop-shadow(0 2px 8px ${C.emerald.a}50)` }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ChartLegend items={[{label:'Likes',color:C.rose.a},{label:'Comments',color:C.emerald.a}]} />
            </ChartCard>

            {/* Engagement Score radial */}
            <ChartCard title="Engagement Score" subtitle="Your overall engagement rating" accent={C.fuchsia.a}>
              <div className="h-52 flex flex-col items-center justify-center">
                <div className="relative w-44 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="95%"
                      data={[{ name:'Score', value: analytics?.engagementScore||0, fill:`url(#radGrad)` }]}
                      startAngle={220} endAngle={-40}>
                      <defs>
                        <linearGradient id="radGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={C.fuchsia.a}/>
                          <stop offset="100%" stopColor={C.violet.a}/>
                        </linearGradient>
                        {/* track */}
                        <linearGradient id="radTrack" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#1e1e2e"/>
                          <stop offset="100%" stopColor="#1e1e2e"/>
                        </linearGradient>
                      </defs>
                      <RadialBar dataKey="value" cornerRadius={10} background={{ fill:'#1a1a2e' }}
                        style={{ filter:`drop-shadow(0 0 10px ${C.fuchsia.a}80)` }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{analytics?.engagementScore?.toFixed(0)||'0'}</span>
                    <span className="text-xs text-slate-400">out of 100</span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </TabsContent>

          {/* ───────────── FOLLOWERS TAB ───────────── */}
          <TabsContent value="followers" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Total Followers" value={fmtN(analytics?.totalFollowers||0)} icon={Users}  from={C.violet.a} to={C.violet.b} />
              <KpiCard title="Following"        value={fmtN(analytics?.totalFollowing||0)} icon={Users}  from={C.blue.a}   to={C.blue.b} />
              <KpiCard title="Profile Views"   value={fmtN(analytics?.profileViews||0)}   icon={Eye}    from={C.emerald.a} to={C.emerald.b} />
              <KpiCard title="Link Clicks"     value={fmtN(analytics?.linkClicks||0)}     icon={Globe}  from={C.amber.a}  to={C.amber.b} />
            </div>

            {/* Follower growth — area + two lines */}
            <ChartCard title="Follower Growth" subtitle="Total, gained & lost over time" accent={C.violet.a}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.followerGrowthTrend||[]} margin={{ top:8,right:8,left:0,bottom:0 }}>
                    <defs>
                      <linearGradient id="aFoll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.violet.a} stopOpacity={0.5}/>
                        <stop offset="100%" stopColor={C.violet.a} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={xFmt} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<ModernTooltip />} />
                    <Area type="monotone" dataKey="followers" name="Total Followers" stroke={C.violet.a} strokeWidth={3}
                      fill="url(#aFoll)" dot={false} activeDot={GlowDot(C.violet.a)}
                      style={{ filter:`drop-shadow(0 0 8px ${C.violet.a})` }} />
                    <Line type="monotone" dataKey="gained" name="Gained" stroke={C.emerald.a} strokeWidth={2}
                      dot={false} activeDot={GlowDot(C.emerald.a)}
                      style={{ filter:`drop-shadow(0 0 5px ${C.emerald.a})` }} />
                    <Line type="monotone" dataKey="lost" name="Lost" stroke={C.rose.a} strokeWidth={2}
                      dot={false} activeDot={GlowDot(C.rose.a)}
                      style={{ filter:`drop-shadow(0 0 5px ${C.rose.a})` }} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <ChartLegend items={[{label:'Total',color:C.violet.a},{label:'Gained',color:C.emerald.a},{label:'Lost',color:C.rose.a}]} />
            </ChartCard>

            {(analytics?.viewsByLocation?.length??0) > 0 && (
              <ChartCard title="Views by Location" accent={C.emerald.a}>
                <div className="space-y-2">
                  {analytics!.viewsByLocation.map((loc,i) => {
                    const pct = analytics!.viewsByLocation[0].views > 0
                      ? (loc.views/analytics!.viewsByLocation[0].views)*100 : 0;
                    return (
                      <div key={loc.country} className="flex items-center gap-3 py-1">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background:PIE_RING[i%PIE_RING.length] }}>{i+1}</span>
                        <span className="text-sm text-slate-300 w-24 truncate">{loc.country}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`,
                            background:`linear-gradient(90deg,${PIE_RING[i%PIE_RING.length]},${PIE_RING[(i+2)%PIE_RING.length]})` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-right">{loc.views}</span>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            )}
          </TabsContent>

          {/* ───────────── SUBSCRIPTIONS TAB ───────────── */}
          <TabsContent value="subscriptions" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Active Subscribers"    value={fmtN(analytics?.totalSubscribers||0)}          icon={Users}      from={C.fuchsia.a} to={C.fuchsia.b} />
              <KpiCard title="Subscription Earnings" value={$$(analytics?.totalSubscriptionEarnings||0)}  icon={DollarSign} from={C.emerald.a}  to={C.emerald.b} />
            </div>

            {/* Dual-axis line chart */}
            <ChartCard title="Subscription Growth" subtitle="New subscribers & earnings over time" accent={C.fuchsia.a}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.subscriptionTrend||[]} margin={{ top:8,right:8,left:0,bottom:0 }}>
                    <XAxis dataKey="date" tickFormatter={xFmt} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="l" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
                    <YAxis yAxisId="r" orientation="right" tickFormatter={v=>`$${fmtN(v)}`}
                      tick={AXIS_STYLE} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<ModernTooltip fmtValue={undefined} />} />
                    <Line yAxisId="l" type="monotone" dataKey="subscribers" name="New Subscribers"
                      stroke={C.fuchsia.a} strokeWidth={3} dot={false} activeDot={GlowDot(C.fuchsia.a)}
                      style={{ filter:`drop-shadow(0 0 8px ${C.fuchsia.a})` }} />
                    <Line yAxisId="r" type="monotone" dataKey="earnings" name="Earnings ($)"
                      stroke={C.emerald.a} strokeWidth={3} dot={false} activeDot={GlowDot(C.emerald.a)}
                      style={{ filter:`drop-shadow(0 0 8px ${C.emerald.a})` }} strokeDasharray="6 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <ChartLegend items={[{label:'New Subscribers',color:C.fuchsia.a},{label:'Earnings',color:C.emerald.a}]} />
            </ChartCard>
          </TabsContent>

          {/* ───────────── COLLABORATIONS TAB ───────────── */}
          <TabsContent value="collaborations" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Total Events"     value={fmtN(analytics?.totalCollaborations||0)}      icon={Video}        from={C.rose.a}    to={C.rose.b} />
              <KpiCard title="Total Bookings"   value={fmtN(analytics?.totalBookings||0)}             icon={CalendarIcon} from={C.cyan.a}    to={C.cyan.b} />
              <KpiCard title="Collab Earnings"  value={$$(analytics?.totalCollaborationEarnings||0)} icon={DollarSign}   from={C.emerald.a} to={C.emerald.b} />
            </div>

            {/* Bookings bar — fuchsia glow */}
            <ChartCard title="Virtual Collaboration Trend" subtitle="Bookings over time" accent={C.rose.a}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.collaborationTrend||[]} margin={{ top:8,right:8,left:0,bottom:0 }}>
                    <defs>
                      <linearGradient id="bBook" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.rose.a} stopOpacity={1}/>
                        <stop offset="100%" stopColor={C.fuchsia.b} stopOpacity={0.5}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={xFmt} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<ModernTooltip />} />
                    <Bar dataKey="bookings" name="Bookings" fill="url(#bBook)" radius={[8,8,0,0]} maxBarSize={36}
                      style={{ filter:`drop-shadow(0 2px 10px ${C.rose.a}60)` }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalyticsPage;

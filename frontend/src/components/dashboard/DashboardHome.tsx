import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Pencil, Share2, Eye, QrCode, Users, MessageSquare, IndianRupee, SquarePen, Bot, Package, Video, BrainCircuit,
  Link2, BarChart3, Wallet, UserRound, Settings, Wand2, CheckCircle2, Circle, ArrowUp, Bell, ShoppingBag,
  CalendarCheck, Coins, Crown, Calendar, ShoppingCart, MessageCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';
import { useEarnings } from '@/hooks/useEarnings';
import { useCurrency } from '@/hooks/useCurrency';
import { useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';
import { useMonthlyTokenDrip } from '@/hooks/useMonthlyTokenDrip';
import ShareModal from '@/components/ShareModal';

interface Stats { profile_views: number; followers_count: number; following_count: number; total_chats_received: number }
interface Notif { id: string; type: string | null; title: string; message: string | null; created_at: string; data?: any }

const card = 'bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(76,61,190,0.25)]';

const QUICK = [
  { t: 'Create Post', d: 'Share with your followers', icon: SquarePen, c: 'from-blue-500 to-indigo-500', to: 'post' },
  { t: 'Avatar Studio', d: 'Create & customize', icon: Bot, c: 'from-violet-500 to-fuchsia-500', to: '/settings/avatar' },
  { t: 'Add Product', d: 'Sell digital or physical', icon: Package, c: 'from-rose-500 to-pink-500', to: '/settings/products' },
  { t: 'Start Meeting', d: 'Zoom / Meet / Calendar', icon: Video, c: 'from-emerald-500 to-green-500', to: '/settings/virtual-collaboration' },
  { t: 'Train AI', d: 'Add Q&A, docs, web data', icon: BrainCircuit, c: 'from-orange-500 to-amber-500', to: '/settings/ai-training' },
  { t: 'Manage Links', d: 'Update social links', icon: Link2, c: 'from-sky-500 to-blue-500', to: '/settings/social-links' },
  { t: 'View Analytics', d: 'Track growth', icon: BarChart3, c: 'from-indigo-500 to-violet-600', to: '/settings/analytics' },
  { t: 'Check Earnings', d: 'Sales & subscriptions', icon: Wallet, c: 'from-emerald-500 to-teal-500', to: '/settings/earnings' },
  { t: 'Manage Followers', d: 'Your community', icon: UserRound, c: 'from-pink-500 to-rose-500', to: '/settings/followers' },
  { t: 'Account Settings', d: 'Profile, privacy & more', icon: Settings, c: 'from-slate-500 to-slate-700', to: '/settings/account' },
];

const TABS = ['All', 'Posts', 'Products', 'Collabs', 'Earnings', 'Followers'] as const;
const tabMatch = (tab: string, type: string) => {
  const t = (type || '').toLowerCase();
  if (tab === 'All') return true;
  if (tab === 'Posts') return /post|comment|like/.test(t);
  if (tab === 'Products') return /product|order/.test(t);
  if (tab === 'Collabs') return /collab|meeting|booking|event/.test(t);
  if (tab === 'Earnings') return /payment|earning|order|sale|subscription|tip/.test(t);
  if (tab === 'Followers') return /follow/.test(t);
  return true;
};
const notifIcon = (type: string) => {
  const t = (type || '').toLowerCase();
  if (/follow/.test(t)) return { i: Users, c: 'text-indigo-600 bg-indigo-50' };
  if (/order|product|sale/.test(t)) return { i: ShoppingBag, c: 'text-amber-600 bg-amber-50' };
  if (/message|chat/.test(t)) return { i: MessageSquare, c: 'text-violet-600 bg-violet-50' };
  if (/meeting|booking|collab|event/.test(t)) return { i: CalendarCheck, c: 'text-sky-600 bg-sky-50' };
  if (/view/.test(t)) return { i: Eye, c: 'text-blue-600 bg-blue-50' };
  return { i: Bell, c: 'text-slate-600 bg-slate-100' };
};

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useProfileAvatar();
  const { earnings } = useEarnings();
  const { formatPrice } = useCurrency();
  const { currentPlan, effectivePlanKey, subscription, isExpired } = useUserPlatformSubscription() as any;
  const [stats, setStats] = useState<Stats>({ profile_views: 0, followers_count: 0, following_count: 0, total_chats_received: 0 });
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [steps, setSteps] = useState({ avatar: false, links: false, post: false, product: false, meeting: false, ai: false });
  const [integr, setIntegr] = useState({ google: false, zoom: false, calendar: false });
  const [share, setShare] = useState(false);

  useMonthlyTokenDrip(!!user?.id);

  const loadStats = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('user_stats').select('profile_views, followers_count, following_count, total_chats_received').eq('user_id', user.id).maybeSingle();
    if (data) setStats(data as any);
  }, [user]);

  const loadNotifs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('id, type, title, message, created_at, data').eq('user_id', user.id).order('created_at', { ascending: false }).limit(25);
    setNotifs((data as any) || []);
  }, [user]);

  const loadSteps = useCallback(async () => {
    if (!user) return;
    const head = { count: 'exact' as const, head: true };
    const [links, posts, products, qa, hi] = await Promise.all([
      supabase.from('social_links').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('posts').select('id', head).eq('user_id', user.id),
      supabase.from('products').select('id', head).eq('user_id', user.id),
      supabase.from('qa_pairs').select('id', head).eq('user_id', user.id),
      supabase.from('host_integrations').select('google_connected, zoom_connected, calendar_sync_enabled').eq('user_id', user.id).maybeSingle(),
    ]);
    const l: any = links.data || {};
    const hasLink = Object.entries(l).some(([k, v]) => !['id', 'user_id', 'created_at', 'updated_at', 'custom_links'].includes(k) && typeof v === 'string' && v.trim());
    const h: any = hi.data || {};
    setIntegr({ google: !!h.google_connected, zoom: !!h.zoom_connected, calendar: !!h.calendar_sync_enabled });
    setSteps((s) => ({ ...s, links: hasLink, post: (posts.count || 0) > 0, product: (products.count || 0) > 0, ai: (qa.count || 0) > 0, meeting: !!(h.google_connected || h.zoom_connected) }));
  }, [user]);

  useEffect(() => { setSteps((s) => ({ ...s, avatar: !!profile?.avatar })); }, [profile?.avatar]);

  useEffect(() => {
    if (!user) return;
    loadStats(); loadNotifs(); loadSteps();
    const ch = supabase
      .channel(`dash-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${user.id}` }, () => loadStats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => loadNotifs())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadStats, loadNotifs, loadSteps]);

  const today = new Date().toDateString();
  const msgsToday = notifs.filter((n) => /message|chat/i.test(n.type || '') && new Date(n.created_at).toDateString() === today).length;
  const followers = Math.max(stats.followers_count || 0, profile?.followers_count || 0);
  const profileUrl = profile?.username ? `${window.location.origin}/${profile.username}` : window.location.origin;
  const name = profile?.display_name || profile?.full_name || profile?.username || 'Creator';

  const bars = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toDateString(); });
    const sums = days.map((d) => (earnings?.recentSales || []).filter((s) => new Date(s.createdAt).toDateString() === d).reduce((a, s) => a + s.amount, 0));
    const max = Math.max(...sums, 1);
    return sums.map((v) => Math.max(10, Math.round((v / max) * 100)));
  }, [earnings]);

  const stepList = [
    { k: 'avatar', t: 'Create your AI Avatar', a: 'Create', to: '/settings/avatar' },
    { k: 'links', t: 'Add social links', a: 'Add Now', to: '/settings/social-links' },
    { k: 'post', t: 'Create your first post', a: 'Create', to: 'post' },
    { k: 'product', t: 'Add a product', a: 'Add Now', to: '/settings/products' },
    { k: 'meeting', t: 'Connect a meeting tool', a: 'Connect', to: '/settings/virtual-collaboration' },
    { k: 'ai', t: 'Start AI training', a: 'Start Now', to: '/settings/ai-training' },
  ] as const;
  const doneCount = stepList.filter((s) => steps[s.k]).length;
  const go = (to: string) => (to === 'post' ? window.dispatchEvent(new Event('avatartalk:create-post')) : navigate(to));

  const planName = currentPlan?.plan_name || (effectivePlanKey ? effectivePlanKey[0].toUpperCase() + effectivePlanKey.slice(1) : 'Free');
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;

  const statCards = [
    { l: 'Followers', v: String(followers), sub: <span className="text-emerald-600 inline-flex items-center gap-0.5"><ArrowUp className="w-3 h-3" />{profile?.following_count ?? 0} following</span>, icon: Users, c: 'text-indigo-600 bg-indigo-50', to: '/settings/followers' },
    { l: 'Messages', v: String(stats.total_chats_received || 0), sub: <span className="text-slate-500">{msgsToday} new today</span>, icon: MessageSquare, c: 'text-violet-600 bg-violet-50', to: '/settings/analytics' },
    { l: 'Profile Views', v: String(stats.profile_views || 0), sub: <span className="text-emerald-600 inline-flex items-center gap-0.5"><Eye className="w-3 h-3" /> live</span>, icon: Eye, c: 'text-blue-600 bg-blue-50', to: '/settings/analytics' },
    { l: 'Total Earnings', v: formatPrice(earnings?.totalEarnings || 0), sub: <span className="text-emerald-600">{(earnings?.recentSales || []).length} sales</span>, icon: IndianRupee, c: 'text-emerald-600 bg-emerald-50', to: '/settings/earnings' },
  ];

  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto" data-testid="dashboard-home">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <div className="space-y-5 min-w-0">
          {/* Welcome banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 text-white p-5 sm:p-8 min-h-[200px]" data-testid="welcome-banner">
            <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 max-w-[60%] sm:max-w-[55%]">
              <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">Welcome Back, {name}! 👋</h1>
              <p className="text-white/85 mt-2 text-sm sm:text-base">Create, connect, and grow with your AI avatar</p>
            </div>
            <div className="relative z-10 flex flex-wrap gap-2 mt-5">
              <button type="button" onClick={() => navigate('/settings/account')} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-slate-900 text-sm font-semibold" data-testid="banner-edit-profile"><Pencil className="w-4 h-4" />Edit Profile</button>
              <button type="button" onClick={() => setShare(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/15 border border-white/40 text-sm font-semibold backdrop-blur" data-testid="banner-share-link"><Share2 className="w-4 h-4" />Share Link</button>
              <button type="button" onClick={() => window.open(profileUrl, '_blank')} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-slate-900 text-sm font-semibold" data-testid="banner-view-profile"><Eye className="w-4 h-4" />View Public Profile</button>
              <button type="button" onClick={() => setShare(true)} className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 border border-white/40" data-testid="banner-qr"><QrCode className="w-4 h-4" /></button>
            </div>
            {profile?.avatar && (
              <img src={profile.avatar} alt="avatar" className="absolute right-4 sm:right-24 bottom-0 h-[78%] sm:h-[92%] aspect-square object-cover object-top rounded-t-[40%] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" />
            )}
            <div className="hidden md:block absolute right-6 top-6 bg-white text-slate-800 text-xs rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-lg max-w-[180px]">Hello! I'm your AI Avatar. Ask me anything!</div>
            <span className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-400" />Online</span>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((s) => (
              <button key={s.l} type="button" onClick={() => navigate(s.to)} className={`${card} p-4 text-left hover:-translate-y-0.5 transition`} data-testid={`stat-${s.l.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-start gap-3">
                  <span className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.c}`}><s.icon className="w-5 h-5" /></span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500">{s.l}</p>
                    <p className="text-lg sm:text-2xl font-extrabold text-slate-900 truncate">{s.v}</p>
                    <p className="text-[11px] sm:text-xs mt-0.5">{s.sub}</p>
                  </div>
                </div>
              </button>
            ))}
          </section>

          {/* Quick actions */}
          <section className={`${card} p-4 sm:p-5`}>
            <div className="flex items-start justify-between mb-4">
              <div><h2 className="text-lg font-bold text-slate-900">Quick Actions</h2><p className="text-sm text-slate-500">Everything you need in one place</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {QUICK.map((q) => (
                <button key={q.t} type="button" onClick={() => go(q.to)} data-testid={`quick-${q.t.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/40 text-left transition">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${q.c} text-white flex items-center justify-center shrink-0 shadow`}><q.icon className="w-5 h-5" /></span>
                  <span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">{q.t}</span><span className="block text-xs text-slate-500 leading-snug">{q.d}</span></span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent activity */}
            <section className={`${card} p-4 sm:p-5`} data-testid="recent-activity">
              <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-slate-900">Recent Activity</h2><button type="button" onClick={() => navigate('/settings/analytics')} className="text-sm text-violet-600 font-medium">View All</button></div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
                {TABS.map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)} data-testid={`activity-tab-${t.toLowerCase()}`}
                    className={`px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap ${tab === t ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' : 'bg-slate-50 text-slate-600'}`}>{t}</button>
                ))}
              </div>
              <div className="divide-y divide-slate-100">
                {notifs.filter((n) => tabMatch(tab, n.type || '')).slice(0, 6).map((n) => {
                  const ic = notifIcon(n.type || '');
                  return (
                    <div key={n.id} className="flex items-center gap-3 py-2.5">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ic.c}`}><ic.i className="w-4 h-4" /></span>
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900 truncate">{n.title}</p><p className="text-xs text-slate-500 truncate">{n.message}</p></div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                    </div>
                  );
                })}
                {notifs.filter((n) => tabMatch(tab, n.type || '')).length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No activity yet — share your link to get started.</p>}
              </div>
            </section>

            {/* Next steps */}
            <section className={`${card} p-4 sm:p-5`} data-testid="next-steps">
              <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-slate-900">Next Steps</h2><p className="text-sm text-slate-500">Complete these steps to grow your profile</p></div><span className="text-sm font-semibold text-slate-700">{doneCount}/{stepList.length}</span></div>
              <div className="h-2 rounded-full bg-slate-100 mt-3 mb-3 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all" style={{ width: `${(doneCount / stepList.length) * 100}%` }} /></div>
              <div className="space-y-1">
                {stepList.map((s) => (
                  <div key={s.k} className="flex items-center gap-3 py-2">
                    {steps[s.k] ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                    <span className="flex-1 text-sm text-slate-800">{s.t}</span>
                    {steps[s.k] ? <span className="text-xs font-semibold text-emerald-600">Completed</span> : (
                      <button type="button" onClick={() => go(s.to)} className="text-xs font-semibold text-violet-700 border border-violet-200 bg-violet-50 rounded-lg px-3 py-1.5" data-testid={`step-${s.k}`}>{s.a}</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          <section className={`${card} p-4 sm:p-5`} data-testid="my-ai-avatar-card">
            <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-slate-900">My AI Avatar</h2><button type="button" onClick={() => navigate('/settings/avatar')} className="text-sm text-violet-600 font-medium inline-flex items-center gap-1" data-testid="avatar-card-edit"><Wand2 className="w-3.5 h-3.5" />Edit</button></div>
            <div className="flex gap-3">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow">{profile?.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover object-top" /> : <Bot className="w-10 h-10 m-7 text-slate-400" />}</div>
                <span className="absolute -bottom-1 left-1 inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Online</span>
              </div>
              <div className="min-w-0"><p className="font-bold text-slate-900 truncate">{name}</p><p className="text-xs text-slate-500">@{profile?.username || 'username'}</p><p className="text-xs text-slate-500 mt-1 line-clamp-3">{profile?.bio || profile?.profession || 'Add a bio so visitors know what you do.'}</p></div>
            </div>
            <div className="grid grid-cols-3 text-center mt-4 py-2 border-y border-slate-100">
              <div><p className="font-bold text-slate-900">{followers}</p><p className="text-[11px] text-slate-500">Followers</p></div>
              <div><p className="font-bold text-slate-900">{profile?.following_count ?? 0}</p><p className="text-[11px] text-slate-500">Following</p></div>
              <div><p className="font-bold text-slate-900">{stats.profile_views || 0}</p><p className="text-[11px] text-slate-500">Profile Views</p></div>
            </div>
            <button type="button" onClick={() => window.open(profileUrl, '_blank')} className="mt-3 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600" data-testid="chat-with-avatar"><MessageCircle className="w-4 h-4" />Chat with my Avatar</button>
            <button type="button" onClick={() => window.open(profileUrl, '_blank')} className="mt-2 w-full h-10 rounded-xl text-sm font-medium bg-violet-50 text-slate-800">View Public Profile</button>
          </section>

          <section className={`${card} p-4 sm:p-5`} data-testid="earnings-overview">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Earnings Overview</h2><button type="button" onClick={() => navigate('/settings/earnings')} className="text-sm text-violet-600 font-medium">View All</button></div>
            <div className="flex items-end justify-between mt-2">
              <div><p className="text-2xl font-extrabold text-slate-900">{formatPrice(earnings?.totalEarnings || 0)}</p><p className="text-xs text-slate-500">Total Earnings</p></div>
              <div className="flex items-end gap-1 h-14">{bars.map((h, i) => <span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-violet-300 to-indigo-600" style={{ height: `${h}%` }} />)}</div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {[
                { l: 'Product Sales', v: earnings?.productEarnings || 0, i: ShoppingCart, c: 'text-pink-600' },
                { l: 'Virtual Collabs', v: earnings?.virtualCollabEarnings || 0, i: Video, c: 'text-violet-600' },
                { l: 'Paid Posts', v: earnings?.postEarnings || 0, i: SquarePen, c: 'text-rose-600' },
                { l: 'Subscriptions', v: earnings?.subscriptionEarnings || 0, i: Crown, c: 'text-amber-600' },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><r.i className={`w-4 h-4 ${r.c}`} />{r.l}</span><span className="font-semibold text-slate-900">{formatPrice(r.v)}</span></div>
              ))}
            </div>
          </section>

          <section className={`${card} p-4 sm:p-5`} data-testid="integrations-card">
            <div className="flex items-center justify-between mb-2"><h2 className="text-lg font-bold text-slate-900">Integrations</h2><button type="button" onClick={() => navigate('/settings/virtual-collaboration')} className="text-sm text-violet-600 font-medium">Manage</button></div>
            {[
              { l: 'Google Meet', on: integr.google, i: Video, c: 'text-emerald-600' },
              { l: 'Zoom', on: integr.zoom, i: Video, c: 'text-blue-600' },
              { l: 'Calendar Sync', on: integr.calendar, i: Calendar, c: 'text-slate-700' },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-3 text-sm text-slate-800"><r.i className={`w-5 h-5 ${r.c}`} />{r.l}</span>
                {r.on ? <span className="text-xs font-semibold text-emerald-600">Connected</span> : <button type="button" onClick={() => navigate('/settings/virtual-collaboration')} className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-1.5" data-testid={`connect-${r.l.toLowerCase().replace(/\s+/g, '-')}`}>Connect</button>}
              </div>
            ))}
            <div className="flex items-center justify-between py-2"><span className="flex items-center gap-3 text-sm text-slate-800"><ShoppingBag className="w-5 h-5 text-green-600" />Shopify <span className="text-xs text-slate-400">(Coming Soon)</span></span><span className="text-xs font-medium text-violet-600 bg-violet-50 rounded-lg px-3 py-1">Soon</span></div>
          </section>

          <section className={`${card} p-4 flex items-center gap-3`} data-testid="token-balance-card">
            <span className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center"><Coins className="w-5 h-5 text-white" /></span>
            <div className="flex-1"><p className="text-sm font-semibold text-slate-700">Token Balance</p><p className="text-lg font-extrabold text-slate-900">{(profile?.token_balance || 0).toLocaleString()} Tokens</p></div>
            <button type="button" onClick={() => navigate('/settings/buy-tokens')} className="text-xs font-semibold text-violet-700 bg-violet-50 rounded-lg px-3 py-2" data-testid="buy-tokens-btn">Buy Tokens</button>
          </section>

          <section className={`${card} p-4`} data-testid="plan-card">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-700">Plan</p>{isExpired ? <span className="text-xs font-semibold text-rose-600 bg-rose-50 rounded-full px-2 py-0.5">Expired</span> : expiresAt ? <span className="text-xs text-slate-500">Renews {expiresAt.toLocaleDateString()}</span> : null}</div>
            <div className="flex items-end justify-between mt-1">
              <div><p className="text-xl font-extrabold text-slate-900">{planName} Plan</p><p className="text-xs text-slate-500">{effectivePlanKey === 'business' ? 'All features unlocked' : 'Upgrade to unlock more features'}</p></div>
              {effectivePlanKey !== 'business' && <button type="button" onClick={() => navigate('/pricing')} className="text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg px-3 py-2" data-testid="plan-upgrade-btn">Upgrade Now</button>}
            </div>
          </section>
        </aside>
      </div>
      <ShareModal isOpen={share} onClose={() => setShare(false)} profileUrl={profileUrl} username={profile?.username || 'user'} displayName={profile?.display_name || undefined} />
    </div>
  );
};

export default DashboardHome;

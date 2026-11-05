import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  Sun, Moon, User, MessageCircle, Users, Eye, Crown, UserPlus, Volume2, Send, Smile, Mic,
} from 'lucide-react';
import LoyaltyBadge from '@/components/LoyaltyBadge';
import { supabase } from '@/integrations/supabase/client';
import { fetchPublicProfile } from '@/lib/payment-api';
import { useProfileEngagement } from '@/hooks/useProfileEngagement';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import DemoPostCard from '../DemoPostCard';
import DemoProductCard from '../DemoProductCard';
import { demoPosts, demoProducts, demoVirtualCollabProducts } from '../demoData';

const ChangeableAvatarPreview = lazy(() => import('@/components/ChangeableAvatarPreview'));

export const KOUSIK = { username: 'kousik', name: 'Kousik Kar' };

/** Shown only when @kousik's real profile can't be loaded. */
const SAMPLE_STATS = { totalConversations: 847, followersCount: 1240, profileViews: 5320, loyaltyScore: 940, isNewUser: false };
const DEFAULT_BIO = 'Founder @AvatarTalk · Chat with my AI avatar 24/7 — ask anything, book a call or grab my products.';

const SCRIPT = [
  { sender: 'user' as const, text: 'Hey! What is AvatarTalk?' },
  { sender: 'ai' as const, text: "I'm Kousik's AI avatar — I talk, answer questions, share links and sell products 24/7 🚀" },
  { sender: 'user' as const, text: 'Can I book a meeting?' },
  { sender: 'ai' as const, text: 'Sure! Pick a Zoom or Google Meet slot in the Product tab — I confirm instantly 📅' },
];

type Tab = 'posts' | 'chat' | 'product';

/** Small pulsing dot on the card's right edge — the landing connectors end here. */
const EdgeMarker: React.FC<{ n: number; active: number | null; className?: string }> = ({ n, active, className = '' }) => (
  <span
    aria-hidden
    data-marker={n}
    data-testid={`profile-marker-${n}`}
    className={`pointer-events-none absolute -right-[7px] z-20 hidden h-3.5 w-3.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 ring-2 ring-white transition-transform duration-300 lg:block ${active === n ? 'scale-150' : ''} ${className}`}
  />
);

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);

interface Props {
  activeMarker?: number | null;
  onCreate?: () => void;
}

/**
 * Replica of the real public profile at /:username (same block order, same
 * phone-like aspect ratio) for @kousik — Kousik Kar. Name, bio, photo, stats
 * and subscription price load live when the profile exists.
 */
const KousikProfileCard: React.FC<Props> = ({ activeMarker = null, onCreate }) => {
  const [profile, setProfile] = useState<any>(null);
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState<Tab>('chat');
  const [msgs, setMsgs] = useState<Array<{ sender: 'ai' | 'user'; text: string; id: number }>>([]);
  const [typing, setTyping] = useState(false);
  const [run, setRun] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  // live profile lookup (API route → direct table fallback)
  useEffect(() => {
    let alive = true;
    (async () => {
      let p: any = null;
      try {
        const r = await fetchPublicProfile(KOUSIK.username);
        p = r?.profile || null;
      } catch { /* fall through */ }
      if (!p) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('id, username, display_name, full_name, bio, avatar_url, profile_pic_url')
            .ilike('username', KOUSIK.username)
            .maybeSingle();
          p = data;
        } catch { /* ignore */ }
      }
      if (alive) setProfile(p);
    })();
    return () => { alive = false; };
  }, []);

  const live = !!profile?.id;
  const { engagement } = useProfileEngagement(live ? profile.id : null);
  const { plans } = useSubscriptionPlans(live ? profile.id : undefined);
  const stats = live ? engagement : SAMPLE_STATS;
  const monthly: any = plans.find((p: any) => p.billing_cycle === 'monthly') || plans[0];
  const price = Number(monthly?.price_amount ?? 99);
  const priceSymbol = monthly?.currency && String(monthly.currency).toUpperCase() !== 'INR' ? '$' : '₹';
  const photo: string | null = profile?.profile_pic_url || profile?.avatar_url || null;
  const bio: string = profile?.bio || DEFAULT_BIO;

  // auto-playing demo chat
  useEffect(() => {
    setMsgs([]);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      if (i >= SCRIPT.length) return;
      const m = SCRIPT[i];
      setTyping(true);
      t = setTimeout(() => {
        setTyping(false);
        setMsgs((prev) => [...prev, { ...m, id: i }]);
        i += 1;
        t = setTimeout(next, m.sender === 'ai' ? 2200 : 500);
      }, m.sender === 'ai' ? 1300 : 700);
    };
    t = setTimeout(next, 1200);
    return () => clearTimeout(t);
  }, [run]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, typing]);

  const talk = () => { setTab('chat'); setRun((r) => r + 1); };
  const goProfile = () => { if (live) window.open(`/${profile.username || KOUSIK.username}`, '_blank'); else onCreate?.(); };

  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-slate-400' : 'text-gray-600';

  return (
    <div
      data-testid="kousik-profile-card"
      className={`relative w-full rounded-[28px] border shadow-2xl ${dark ? 'border-slate-700/40 bg-slate-900 shadow-blue-950/40' : 'border-gray-200 bg-white shadow-violet-500/20'}`}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pb-2.5 pt-4">
        <EdgeMarker n={1} active={activeMarker} className="top-1/2 -translate-y-1/2" />
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg">
              <div className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full ${dark ? 'bg-slate-800' : 'bg-white'}`}>
                {photo ? <img src={photo} alt={KOUSIK.name} className="h-full w-full object-cover" /> : <span className={`text-lg font-bold ${txt}`}>K</span>}
              </div>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 bg-green-500 ${dark ? 'border-slate-900' : 'border-white'}`} />
          </div>
          <div className="min-w-0">
            <h3 data-testid="kousik-name" className={`truncate text-lg font-bold leading-tight ${txt}`}>{KOUSIK.name}</h3>
            <p data-testid="kousik-username" className={`text-sm ${sub}`}>@{KOUSIK.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            data-testid="kousik-theme-toggle"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle profile theme"
            className={`rounded-full p-2 transition-colors ${dark ? 'bg-slate-800/40 text-slate-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
            <span className={`flex h-full w-full items-center justify-center rounded-full ${dark ? 'bg-slate-800' : 'bg-white'}`}><User className="h-4 w-4 text-blue-500" /></span>
          </span>
        </div>
      </div>

      <div className="px-4 pb-3"><p className={`line-clamp-2 text-[13px] leading-relaxed ${sub}`}>{bio}</p></div>

      {/* Avatar preview — same component the real profile uses */}
      <div className="relative px-4 pb-2.5">
        <EdgeMarker n={2} active={activeMarker} className="top-1/2 -translate-y-1/2" />
        <Suspense fallback={<div className="flex h-64 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-900/40 to-blue-900/40"><div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" /></div>}>
          <ChangeableAvatarPreview
            userId={live ? profile.id : undefined}
            isLarge={false}
            isInteractive
            isTalking={typing && tab === 'chat'}
            onTalkClick={talk}
            showGiftButton
            onGiftClick={goProfile}
            profilePicUrl={photo}
            profileDisplayName={KOUSIK.name}
          />
        </Suspense>
      </div>

      {/* Compact stats */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 px-3 pb-2.5" data-testid="kousik-stats">
        <span className="flex items-center gap-1"><MessageCircle className={`h-3.5 w-3.5 ${sub}`} /><span className={`text-[13px] font-semibold ${txt}`}>{fmt(stats.totalConversations)}</span><span className={`text-[9px] ${sub}`}>chats</span></span>
        <span className={`h-3.5 w-px ${dark ? 'bg-slate-700' : 'bg-gray-300'}`} />
        <span className="flex items-center gap-1"><Users className={`h-3.5 w-3.5 ${sub}`} /><span className={`text-[13px] font-semibold ${txt}`}>{fmt(stats.followersCount)}</span><span className={`text-[9px] ${sub}`}>followers</span>{stats.isNewUser && <span className="ml-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-1 text-[8px] font-semibold text-white">NEW</span>}</span>
        <span className={`h-3.5 w-px ${dark ? 'bg-slate-700' : 'bg-gray-300'}`} />
        <span className="flex items-center gap-1"><Eye className={`h-3.5 w-3.5 ${sub}`} /><span className={`text-[13px] font-semibold ${txt}`}>{fmt(stats.profileViews)}</span><span className={`text-[9px] ${sub}`}>views</span></span>
        <span className={`h-3.5 w-px ${dark ? 'bg-slate-700' : 'bg-gray-300'}`} />
        <LoyaltyBadge score={stats.loyaltyScore} size="sm" showScore showTierName={false} />
      </div>

      {/* Subscribe + Follow */}
      <div className="relative grid grid-cols-5 gap-2 px-4 pb-1">
        <EdgeMarker n={3} active={activeMarker} className="top-1/2 -translate-y-1/2" />
        <button
          data-testid="kousik-subscribe"
          onClick={goProfile}
          className="col-span-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 py-2.5 text-[13px] font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          <Crown className="h-4 w-4" /> Subscribe - {priceSymbol}{price.toLocaleString('en-IN')}/mo
        </button>
        <button
          data-testid="kousik-follow"
          onClick={goProfile}
          className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 py-2.5 text-[13px] font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          <UserPlus className="h-4 w-4" /> Follow
        </button>
      </div>

      {/* Tabs */}
      <div className="relative px-4 pb-4">
        <EdgeMarker n={4} active={activeMarker} className="top-6" />
        <div className={`grid grid-cols-3 border-b ${dark ? 'border-slate-700/40' : 'border-gray-200'}`}>
          {(['posts', 'chat', 'product'] as Tab[]).map((t) => (
            <button
              key={t}
              data-testid={`kousik-tab-${t}`}
              onClick={() => setTab(t)}
              className={`border-b-2 py-2.5 text-sm font-medium capitalize transition-colors ${tab === t ? `border-blue-500 ${txt}` : `border-transparent ${sub} ${dark ? 'hover:text-white' : 'hover:text-gray-900'}`}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-2.5 h-[150px]">
          {tab === 'chat' && (
            <div className="flex h-full flex-col">
              <div ref={chatRef} className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin-auto" data-testid="kousik-chat">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'ai' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl border px-3 py-1.5 text-[12px] leading-snug ${m.sender === 'ai'
                      ? `rounded-tr-md ${dark ? 'border-slate-600/30 bg-slate-700/60 text-slate-100' : 'border-gray-200 bg-gray-100 text-gray-800'}`
                      : `rounded-tl-md ${dark ? 'border-blue-500/30 bg-blue-600/20 text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-800'}`}`}>
                      {m.text}
                      {m.sender === 'ai' && <span className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-blue-400"><Volume2 className="h-2.5 w-2.5" /> Voice + Text</span>}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-end">
                    <div className={`flex gap-1 rounded-2xl rounded-tr-md px-3 py-2 ${dark ? 'bg-slate-700/60' : 'bg-gray-100'}`}>
                      {[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                )}
              </div>
              <div className={`mt-2 flex items-center gap-2 rounded-2xl border px-3 py-1.5 ${dark ? 'border-slate-600/50 bg-slate-800/60' : 'border-gray-200 bg-gray-50'}`}>
                <span className={`flex-1 truncate text-xs ${sub}`}>Type your message…</span>
                <Smile className={`h-3.5 w-3.5 ${sub}`} /><Mic className={`h-3.5 w-3.5 ${sub}`} />
                <button onClick={talk} aria-label="Replay demo chat" className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"><Send className="h-3 w-3 text-white" /></button>
              </div>
            </div>
          )}
          {tab === 'posts' && (
            <div className="h-full space-y-2 overflow-y-auto pr-1 scrollbar-thin-auto">
              {demoPosts.slice(0, 2).map((p) => <DemoPostCard key={p.id} post={p} />)}
            </div>
          )}
          {tab === 'product' && (
            <div className="h-full space-y-2 overflow-y-auto pr-1 scrollbar-thin-auto">
              {[...demoProducts.slice(0, 1), ...demoVirtualCollabProducts.slice(0, 1)].map((p) => <DemoProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KousikProfileCard;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { usePlatformPricingPlans, PlatformPricingPlan } from '@/hooks/usePlatformPricingPlans';
import { useCurrency } from '@/hooks/useCurrency';
import { SectionPill, CARD } from './assets';

const FALLBACK_FEATURES: Record<string, string[]> = {
  free: ['AI Avatar', 'Basic features', 'Public profile'],
  creator: ['Advanced avatar', 'Custom knowledge', 'Remove branding'],
  pro: ['Everything in Creator', 'AI training (docs, links)', 'Memberships & tokens'],
  business: ['Multiple avatars', 'Team members', 'API & integrations'],
};

/**
 * Plans + prices come straight from `platform_pricing_plans` (managed in
 * Super Admin → Plans) and update in real time via the hook's realtime channel.
 */
const PricingSection: React.FC<{ onSelectPlan: (planKey: string) => void }> = ({ onSelectPlan }) => {
  const { plans: all, loading } = usePlatformPricingPlans();
  const plans = useMemo(() => all.filter((p) => p.is_active !== false), [all]);
  const { currency, setCurrency } = useCurrency();
  const cur: 'INR' | 'USD' = currency === 'INR' ? 'INR' : 'USD';
  const symbol = cur === 'INR' ? '₹' : '$';

  // flash the cards when a super admin edits a plan
  const signature = useMemo(() => plans.map((p) => `${p.id}:${p.updated_at}:${p.price_inr}:${p.price_usd}:${p.plan_name}`).join('|'), [plans]);
  const first = useRef(true);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!plans.length) return;
    if (first.current) { first.current = false; return; }
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), 1600);
    return () => window.clearTimeout(t);
  }, [signature, plans.length]);

  const fmt = (v: number) => (cur === 'INR' ? Math.round(v).toLocaleString('en-IN') : (Math.round(v * 100) / 100).toLocaleString('en-US'));
  const priceOf = (p: PlatformPricingPlan) => (cur === 'INR' ? p.price_inr : p.price_usd) || 0;
  const featsOf = (p: PlatformPricingPlan) => {
    const list = (p.features_list || []).map((f) => f.text).filter(Boolean);
    return (list.length ? list : FALLBACK_FEATURES[p.plan_key] || []).slice(0, 3);
  };

  return (
    <section id="pricing" data-testid="pricing-section" className={`${CARD} h-full p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <SectionPill>Pricing</SectionPill>
          <h2 className="text-xl font-extrabold tracking-tight text-[#140F3A] sm:text-[1.4rem]">Start Free. Upgrade as You Grow.</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600" data-testid="pricing-live-indicator">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            Live
          </span>
          <div className="flex rounded-lg bg-violet-50 p-0.5 ring-1 ring-violet-100" role="group" aria-label="Currency">
            {(['INR', 'USD'] as const).map((c) => (
              <button key={c} data-testid={`currency-${c}`} onClick={() => setCurrency(c)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${cur === c ? 'bg-[#140F3A] text-white shadow' : 'text-slate-600 hover:text-violet-700'}`}>{c === 'INR' ? '₹ INR' : '$ USD'}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Loader2 className="h-7 w-7 animate-spin text-violet-500" /></div>
      ) : plans.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500" data-testid="pricing-empty">Plans are being updated — check back in a moment.</p>
      ) : (
        <div className={`mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4 ${flash ? 'animate-pulse' : ''}`}>
          {plans.map((p) => {
            const pop = p.is_popular;
            const isFree = p.plan_key === 'free' || ((p.price_inr || 0) === 0 && (p.price_usd || 0) === 0);
            const price = priceOf(p);
            return (
              <article
                key={p.id}
                data-testid={`plan-card-${p.plan_key}`}
                className={`relative flex flex-col rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-1 ${
                  pop ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-violet-600/35' : 'bg-white ring-1 ring-violet-100 hover:shadow-lg hover:shadow-violet-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <h3 className={`text-[15px] font-extrabold leading-tight ${pop ? 'text-white' : 'text-[#140F3A]'}`}>{p.plan_name}</h3>
                  {(pop || p.offer_badge) && (
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${pop ? 'bg-white text-violet-700' : 'bg-amber-100 text-amber-700'}`}>{p.offer_badge || 'Popular'}</span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug ${pop ? 'text-violet-100' : 'text-slate-500'}`}>{p.tagline || (isFree ? 'Get started' : '')}</p>

                <div className="mt-2.5 flex items-end gap-1" data-testid={`plan-price-${p.plan_key}`}>
                  <span key={`${cur}-${price}`} className="text-[1.6rem] font-extrabold leading-none tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-500">{symbol}{fmt(price)}</span>
                  <span className={`text-xs ${pop ? 'text-violet-100' : 'text-slate-500'}`}>/mo</span>
                </div>

                <ul className="mt-3 flex-1 space-y-1.5">
                  {featsOf(p).map((f, i) => (
                    <li key={i} className={`flex items-start gap-1.5 text-[11.5px] leading-snug ${pop ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${pop ? 'text-emerald-300' : 'text-emerald-500'}`} strokeWidth={3} />
                      <span className="line-clamp-2">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  data-testid={`plan-cta-${p.plan_key}`}
                  onClick={() => (p.plan_key === 'business' ? window.location.assign('mailto:support@avatartalk.co?subject=AvatarTalk%20Business%20plan') : onSelectPlan(p.plan_key))}
                  className={`mt-3.5 w-full rounded-xl py-2 text-xs font-bold transition-all ${
                    pop ? 'bg-white text-violet-700 hover:bg-violet-50' : 'bg-violet-50 text-[#140F3A] ring-1 ring-violet-100 hover:bg-[#140F3A] hover:text-white'
                  }`}
                >
                  {isFree ? 'Get Started' : p.plan_key === 'business' ? 'Contact Sales' : `Start ${p.plan_name}`}
                </button>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-3.5 text-center">
        <Link to="/pricing" data-testid="pricing-compare-link" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900">
          Compare all features &amp; billing periods <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
};

export default PricingSection;

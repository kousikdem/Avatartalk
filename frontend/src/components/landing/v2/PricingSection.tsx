import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Coins, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { usePlatformPricingPlans, PlatformPricingPlan } from '@/hooks/usePlatformPricingPlans';
import { useCurrency } from '@/hooks/useCurrency';
import { SectionPill } from './assets';

const YEARLY_DISCOUNT = 20; // same default as /pricing (durationDiscounts[12])

const formatTokens = (t: number) => (t >= 1_000_000 ? `${+(t / 1_000_000).toFixed(1)}M` : t >= 1000 ? `${Math.round(t / 1000)}K` : `${t}`);

const PricingSection: React.FC<{ onSelectPlan: (planKey: string) => void }> = ({ onSelectPlan }) => {
  const { plans, loading } = usePlatformPricingPlans();
  const { currency, setCurrency } = useCurrency();
  const [yearly, setYearly] = useState(false);
  const cur: 'INR' | 'USD' = currency === 'INR' ? 'INR' : 'USD';
  const symbol = cur === 'INR' ? '₹' : '$';

  // flash cards when a super admin changes a plan (real-time)
  const signature = useMemo(() => plans.map((p) => `${p.id}:${p.updated_at}:${p.price_inr}:${p.price_usd}`).join('|'), [plans]);
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

  const monthly = (p: PlatformPricingPlan) => {
    const base = (cur === 'INR' ? p.price_inr : p.price_usd) || 0;
    if (!yearly) return { now: base, was: 0 };
    const preset = cur === 'INR' ? p.price_12_month_inr : p.price_12_month_usd;
    const total = preset || base * 12 * (1 - YEARLY_DISCOUNT / 100);
    return { now: total / 12, was: base };
  };

  return (
    <section id="pricing" data-testid="pricing-section" className="px-3 pt-16 sm:px-6 md:pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionPill>Pricing</SectionPill>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#140F3A] md:text-[2.6rem]">Start Free. Upgrade as You Grow.</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
              Live prices — always in sync with our latest plans
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-white p-1 ring-1 ring-violet-100" role="group" aria-label="Billing period">
              {[{ k: false, l: 'Monthly' }, { k: true, l: `Yearly −${YEARLY_DISCOUNT}%` }].map((o) => (
                <button key={o.l} data-testid={`billing-${o.k ? 'yearly' : 'monthly'}`} onClick={() => setYearly(o.k)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all ${yearly === o.k ? 'bg-violet-600 text-white shadow' : 'text-slate-600 hover:text-violet-700'}`}>{o.l}</button>
              ))}
            </div>
            <div className="flex rounded-xl bg-white p-1 ring-1 ring-violet-100" role="group" aria-label="Currency">
              {(['INR', 'USD'] as const).map((c) => (
                <button key={c} data-testid={`currency-${c}`} onClick={() => setCurrency(c)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${cur === c ? 'bg-[#140F3A] text-white shadow' : 'text-slate-600 hover:text-violet-700'}`}>{c === 'INR' ? '₹ INR' : '$ USD'}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
        ) : (
          <div className={`mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${flash ? 'animate-pulse' : ''}`}>
            {plans.map((p) => {
              const pop = p.is_popular;
              const { now, was } = monthly(p);
              const isFree = p.plan_key === 'free' || ((p.price_inr || 0) === 0 && (p.price_usd || 0) === 0);
              const feats = (p.features_list || []).slice(0, 5);
              return (
                <article
                  key={p.id}
                  data-testid={`plan-card-${p.plan_key}`}
                  className={`relative flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                    pop ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-2xl shadow-violet-600/35' : 'bg-white ring-1 ring-violet-100 hover:shadow-xl hover:shadow-violet-500/10'
                  }`}
                >
                  {(pop || p.offer_badge) && (
                    <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[11px] font-bold ${pop ? 'bg-white text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.offer_badge || 'Popular'}
                    </span>
                  )}
                  <h3 className={`text-lg font-extrabold ${pop ? 'text-white' : 'text-[#140F3A]'}`}>{p.plan_name}</h3>
                  <p className={`text-xs ${pop ? 'text-violet-100' : 'text-slate-500'}`}>{p.tagline || (isFree ? 'Get started' : '')}</p>

                  <div className="mt-4 flex items-end gap-1" data-testid={`plan-price-${p.plan_key}`}>
                    <span key={`${cur}-${yearly}-${now}`} className="text-4xl font-extrabold tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-500">{symbol}{fmt(now)}</span>
                    <span className={`mb-1 text-sm ${pop ? 'text-violet-100' : 'text-slate-500'}`}>/mo</span>
                  </div>
                  <div className={`h-5 text-xs ${pop ? 'text-violet-100' : 'text-slate-400'}`}>
                    {!isFree && was > 0 && <><span className="line-through">{symbol}{fmt(was)}</span> · billed {symbol}{fmt(now * 12)}/yr</>}
                  </div>

                  {p.ai_tokens_monthly > 0 && (
                    <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${pop ? 'bg-white/15' : 'bg-violet-50 text-violet-700'}`}>
                      <Coins className="h-4 w-4 text-amber-400" /> {formatTokens(p.ai_tokens_monthly)} AI tokens added
                    </div>
                  )}

                  <ul className="mt-4 flex-1 space-y-2">
                    {feats.map((f, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm ${pop ? 'text-white' : 'text-slate-700'}`}>
                        <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${pop ? 'text-emerald-300' : 'text-emerald-500'}`} strokeWidth={3} />
                        <span>{f.text}{f.coming_soon && <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-700">Soon</span>}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    data-testid={`plan-cta-${p.plan_key}`}
                    onClick={() => onSelectPlan(p.plan_key)}
                    className={`mt-6 w-full rounded-xl py-3 text-sm font-bold transition-all ${
                      pop ? 'bg-white text-violet-700 hover:bg-violet-50' : 'bg-[#140F3A] text-white hover:bg-violet-700'
                    }`}
                  >
                    {isFree ? 'Get Started' : `Start ${p.plan_name}`}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/pricing" data-testid="pricing-compare-link" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-900">
            <Sparkles className="h-4 w-4" /> Compare all features & billing periods <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

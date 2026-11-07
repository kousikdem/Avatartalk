import React, { useMemo, useState } from 'react';
import { CheckCircle2, Crown, Loader2, ArrowRight, Sparkles, Rocket, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformPricingPlans, useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';
import { usePlanCheckout, yearlyPrice } from '@/hooks/usePlanCheckout';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = { creator: Crown, pro: Rocket, business: Building2 };

interface Props {
  onPaid: (planKey: string) => void;
  onFree: () => void;
}

/** Soft paywall: every paid plan, monthly / yearly switch, Razorpay checkout. */
const PlanPaywall: React.FC<Props> = ({ onPaid, onFree }) => {
  const { plans, loading } = usePlatformPricingPlans();
  const { effectivePlanKey } = useUserPlatformSubscription();
  const { checkout, busy } = usePlanCheckout();
  const [yearly, setYearly] = useState(true);
  const paid = useMemo(() => plans.filter((p) => p.price_inr > 0).sort((a, b) => a.price_inr - b.price_inr), [plans]);
  const [selected, setSelected] = useState<string>('creator');
  const sel = paid.find((p) => p.plan_key === selected) || paid[0];

  const features = (sel?.features_list || []).map((f: any) => f.text || f.name || f.title || String(f)).filter((t: string) => !/^everything in/i.test(t)).slice(0, 5);

  const pay = async () => {
    if (!sel) return;
    if (effectivePlanKey === sel.plan_key) { toast.info(`You're already on ${sel.plan_name}`); onPaid(sel.plan_key); return; }
    const r = await checkout(sel, yearly ? 12 : 1);
    if (r.ok) { toast.success(`${sel.plan_name} plan activated!`); onPaid(sel.plan_key); }
    else if (r.message) toast.error(r.message);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-4" data-testid="plan-paywall">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shadow-md"><Crown className="w-7 h-7 text-white" /></div>
        <h2 className="mt-3 text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Unlock More with {sel?.plan_name || 'Creator'} Plan</h2>
        <p className="text-sm text-slate-500 mt-1">Get advanced avatar, AI training, products, and collaboration tools.</p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-full bg-slate-100" data-testid="billing-toggle">
          <button type="button" onClick={() => setYearly(false)} data-testid="billing-monthly" className={`px-4 py-1.5 rounded-full text-sm font-semibold ${!yearly ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Monthly</button>
          <button type="button" onClick={() => setYearly(true)} data-testid="billing-yearly" className={`px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${yearly ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Yearly <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-full">Save 20%</span></button>
        </div>
      </div>

      {features.length > 0 && (
        <ul className="space-y-1.5 bg-slate-50/70 rounded-2xl p-4">
          {features.map((f: string) => <li key={f} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{f}</li>)}
        </ul>
      )}

      <div className="space-y-2">
        {paid.map((p) => {
          const Icon = ICONS[p.plan_key] || Sparkles;
          const active = sel?.plan_key === p.plan_key;
          const y = yearlyPrice(p);
          return (
            <button key={p.id} type="button" onClick={() => setSelected(p.plan_key)} data-testid={`plan-option-${p.plan_key}`}
              className={`relative w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${active ? 'border-violet-600 bg-violet-50/60' : 'border-slate-200 bg-white hover:border-violet-200'}`}>
              {p.is_popular && <span className="absolute -top-2.5 right-3 text-[10px] font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 rounded-full">Most Popular</span>}
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-violet-600' : 'border-slate-300'}`}>{active && <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />}</span>
              <Icon className="w-4 h-4 text-violet-600" />
              <span className="flex-1 font-semibold text-slate-900">{p.plan_name}{effectivePlanKey === p.plan_key && <span className="ml-2 text-[10px] text-emerald-600">Current</span>}</span>
              <span className="text-right">
                <span className="block font-bold text-slate-900">₹{(yearly ? Math.round(y / 12) : p.price_inr).toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-500">/mo</span></span>
                {yearly && <span className="block text-[11px] text-slate-500">₹{y.toLocaleString('en-IN')} billed yearly</span>}
              </span>
            </button>
          );
        })}
        <button type="button" onClick={onFree} data-testid="plan-option-free" className="w-full flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-left">
          <span className="w-5 h-5 rounded-full border-2 border-slate-300" />
          <span className="flex-1 font-semibold text-slate-900">Continue Free</span>
          <span className="text-xs text-slate-500">(Limited features)</span>
        </button>
      </div>

      <button type="button" onClick={pay} disabled={!!busy || !sel} data-testid="paywall-pay-btn"
        className="w-full h-12 rounded-xl text-white font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 inline-flex items-center justify-center gap-2 disabled:opacity-70">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Continue with {sel?.plan_name || 'Creator'} · ₹{sel ? (yearly ? yearlyPrice(sel) : sel.price_inr).toLocaleString('en-IN') : ''}{yearly ? '/yr' : '/mo'} <ArrowRight className="w-4 h-4" />
      </button>
      <button type="button" onClick={onFree} className="w-full text-sm font-semibold text-violet-600" data-testid="paywall-free-link">Continue Free for Now</button>
    </div>
  );
};

export default PlanPaywall;

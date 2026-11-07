import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Timer, Bot, Link2, ShoppingBag, Video } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { useAvatarEditor } from '@/hooks/useAvatarEditor';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanPaywall from './PlanPaywall';
import {
  StyleStep, CreateStep, CustomizeStep, AboutStep, TrainStep, LinksStep, ProductsStep2, PrefsStep, DoneStep, StepProps,
} from './v2/OnbSteps';

interface OnboardingFlowProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

// UI numbering continues from Login (1) and Create Account (2)
const STEPS = [
  { k: 'style', label: 'Choose Avatar Style', optional: false },
  { k: 'create', label: 'Create Avatar', optional: false },
  { k: 'customize', label: 'Customize Your Avatar', optional: false },
  { k: 'about', label: 'Tell Us About You', optional: false },
  { k: 'paywall', label: 'Unlock More', optional: true },
  { k: 'train', label: 'AI Training (Optional)', optional: true },
  { k: 'links', label: 'Add Your Links', optional: true },
  { k: 'products', label: 'Add Products & Services', optional: true },
  { k: 'prefs', label: 'Preferences & Setup', optional: true },
  { k: 'done', label: "You're All Set!", optional: false },
] as const;

const LEGACY_KEYS = ['personal_info', 'avatar', 'ai_training', 'ai_settings', 'social_links', 'products', 'virtual_collaboration', 'pricing'];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const editor = useAvatarEditor();
  const { hasFeature, loading: planLoading } = usePlanFeatures();
  const canPro = !planLoading && hasFeature('avatar_upload_enabled');
  const lsKey = `avatartalk.onb.step.${user?.id || 'anon'}`;
  const [i, setI] = useState<number>(() => Math.min(STEPS.length - 1, Number(localStorage.getItem(lsKey) || 0) || 0));

  useEffect(() => { localStorage.setItem(lsKey, String(i)); window.scrollTo?.(0, 0); }, [i, lsKey]);

  const finish = useCallback(async () => {
    if (!user) return;
    await supabase.from('user_onboarding').upsert({ user_id: user.id, is_completed: true, completed_steps: LEGACY_KEYS, current_step: 'pricing' } as any, { onConflict: 'user_id' });
  }, [user]);

  const go = (n: number) => setI(Math.max(0, Math.min(STEPS.length - 1, n)));
  const next = () => {
    const n = i + 1;
    if (STEPS[n]?.k === 'done') finish();
    go(n);
  };
  const goPaywall = () => go(STEPS.findIndex((s) => s.k === 'paywall'));
  const close = () => {
    localStorage.removeItem(lsKey);
    if (onClose) onClose(); else navigate('/settings/dashboard');
  };
  const toDashboard = async () => { await finish(); close(); navigate('/settings/dashboard'); };

  if (!isOpen || !user) return null;
  const step = STEPS[i];
  const props: StepProps = { editor, userId: user.id, next, canPro, goPaywall };

  const body = (() => {
    switch (step.k) {
      case 'style': return <StyleStep {...props} />;
      case 'create': return <CreateStep {...props} />;
      case 'customize': return <CustomizeStep {...props} />;
      case 'about': return <AboutStep {...props} />;
      case 'paywall': return <PlanPaywall onPaid={() => next()} onFree={() => next()} />;
      case 'train': return <TrainStep {...props} />;
      case 'links': return <LinksStep {...props} />;
      case 'products': return <ProductsStep2 {...props} />;
      case 'prefs': return <PrefsStep {...props} />;
      case 'done': return <DoneStep {...props} onDashboard={toDashboard} />;
      default: return null;
    }
  })();

  return (
    <div className="fixed inset-0 z-[60] bg-[#f6f5ff] overflow-y-auto" data-testid="onboarding-flow">
      <header className="sticky top-0 z-10 bg-[#f6f5ff]/90 backdrop-blur border-b border-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></span>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 leading-tight">Complete Onboarding</p>
            <p className="text-xs text-slate-500 hidden sm:block">Create your AI Avatar, set up your profile, and go live in minutes.</p>
          </div>
          <div className="hidden lg:flex items-center gap-4 ml-6 px-4 py-2 rounded-xl bg-white border border-slate-100 text-sm text-slate-700">
            <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-violet-600" />AI Avatar</span>
            <span className="flex items-center gap-1.5"><Link2 className="w-4 h-4 text-violet-600" />Link-in-Bio</span>
            <span className="flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-violet-600" />Sell Products</span>
            <span className="flex items-center gap-1.5"><Video className="w-4 h-4 text-violet-600" />Meet & Collaborate</span>
          </div>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold"><Timer className="w-4 h-4" />~5 Minutes</span>
          {step.k !== 'done' && <button type="button" onClick={close} className="ml-auto sm:ml-0 p-2 rounded-xl hover:bg-white text-slate-500" data-testid="onb-close" title="Finish later"><X className="w-5 h-5" /></button>}
        </div>
        <div className="h-1 bg-violet-100"><div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} /></div>
      </header>

      <main className="px-3 sm:px-4 py-6 sm:py-10">
        <div className="relative mx-auto w-full max-w-[520px] bg-white rounded-3xl shadow-[0_20px_60px_-30px_rgba(76,61,190,0.45)] border border-white p-5 sm:p-7" data-testid={`onb-step-${step.k}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center">{i + 3}</span>
            <p className="font-bold text-slate-900 flex-1">{step.label}</p>
            {step.optional && step.k !== 'paywall' && <button type="button" onClick={next} className="text-sm text-slate-500 hover:text-violet-700 font-medium" data-testid="onb-skip">Skip</button>}
          </div>
          <div className="flex justify-center gap-1.5 mb-5">
            {STEPS.map((s, idx) => <span key={s.k} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-violet-600' : idx < i ? 'w-3 bg-violet-400' : 'w-1.5 bg-slate-200'}`} />)}
          </div>
          {body}
          {i > 0 && step.k !== 'done' && (
            <button type="button" onClick={() => go(i - 1)} className="mt-3 w-full text-sm text-slate-500 inline-flex items-center justify-center gap-1 hover:text-slate-800" data-testid="onb-back"><ArrowLeft className="w-4 h-4" />Back</button>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">Step {i + 3} of 12</p>
      </main>
    </div>
  );
};

export default OnboardingFlow;

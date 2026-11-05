import React, { useEffect, useState } from 'react';
import { Star, Users, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { IMG } from './assets';

const TESTIMONIALS = [
  { quote: 'AvatarTalk turned my profile into a smart assistant. It answers, shares my links and even books meetings!', name: 'Priya S.', role: 'Content Creator', img: IMG.priya },
  { quote: "My avatar sells my training plans while I'm coaching on the floor. Leads doubled in the first month.", name: 'Rahul M.', role: 'Fitness Coach', img: IMG.fitnessCoach },
  { quote: 'Students ask my AI avatar doubts at midnight and it answers from my own notes. Total game-changer.', name: 'Ananya K.', role: 'Educator', img: IMG.educator },
];

const STATS = [
  { icon: Star, value: '4.8/5', label: 'Average rating', tone: 'text-amber-400', fill: true },
  { icon: Users, value: '1K+', label: 'Creators onboarded', tone: 'text-violet-600', fill: false },
  { icon: ShieldCheck, value: '99.9%', label: 'Uptime', tone: 'text-emerald-500', fill: false },
];

/** Compact trust block (ratings, creators, uptime + rotating testimonial). */
const SocialProof: React.FC = () => {
  const [i, setI] = useState(0);
  const n = TESTIMONIALS.length;
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => window.clearInterval(t);
  }, [n]);
  const t = TESTIMONIALS[i];

  return (
    <section data-testid="social-proof-section" className="relative z-20 flex h-full flex-col justify-center rounded-[24px] bg-white/95 p-5 ring-1 ring-violet-100 shadow-[0_18px_50px_-30px_rgba(91,33,182,0.45)] sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight text-[#140F3A] sm:text-[1.4rem]">Loved by Creators &amp; Businesses</h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {STATS.map(({ icon: Icon, value, label, tone, fill }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-violet-50/60 px-1 py-2 text-center" data-testid={`stat-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
            <Icon className={`h-5 w-5 flex-shrink-0 ${tone}`} fill={fill ? 'currentColor' : 'none'} />
            <div className="min-w-0">
              <div className="text-[15px] font-extrabold leading-none text-[#140F3A]">{value}</div>
              <div className="mt-0.5 text-[10px] leading-tight text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>
      <figure className="mt-3.5 flex gap-3 border-t border-violet-100 pt-3.5" data-testid="testimonial-card">
        <img src={t.img} alt={t.name} className="h-11 w-11 flex-shrink-0 rounded-full object-cover object-top ring-2 ring-violet-100" loading="lazy" />
        <div className="min-w-0 flex-1">
          <blockquote key={i} className="min-h-[54px] text-[12.5px] italic leading-snug text-slate-700 animate-in fade-in duration-500">“{t.quote}”</blockquote>
          <figcaption className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold leading-snug text-[#140F3A]">— {t.name}, <span className="font-normal text-slate-500">{t.role}</span></span>
            <span className="flex flex-shrink-0 gap-1.5">
              <button data-testid="testimonial-prev" onClick={() => setI((x) => (x - 1 + n) % n)} aria-label="Previous testimonial" className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-violet-200 transition-colors hover:bg-violet-600 hover:text-white"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button data-testid="testimonial-next" onClick={() => setI((x) => (x + 1) % n)} aria-label="Next testimonial" className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-violet-200 transition-colors hover:bg-violet-600 hover:text-white"><ChevronRight className="h-3.5 w-3.5" /></button>
            </span>
          </figcaption>
        </div>
      </figure>
    </section>
  );
};

export default SocialProof;

import React, { useEffect, useState } from 'react';
import { Star, Users, ShieldCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { IMG, SectionPill } from './assets';

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

const SocialProof: React.FC = () => {
  const [i, setI] = useState(0);
  const n = TESTIMONIALS.length;
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => window.clearInterval(t);
  }, [n]);
  const t = TESTIMONIALS[i];

  return (
    <section data-testid="social-proof-section" className="px-3 pt-16 sm:px-6 md:pt-24">
      <div className="mx-auto grid max-w-7xl gap-6 rounded-[32px] bg-white p-6 ring-1 ring-violet-100 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionPill>Social Proof</SectionPill>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#140F3A] md:text-[2.4rem]">Loved by Creators & Businesses</h2>
          <div className="mt-7 grid grid-cols-3 gap-3">
            {STATS.map(({ icon: Icon, value, label, tone, fill }) => (
              <div key={label} className="rounded-2xl bg-violet-50/60 p-4 text-center ring-1 ring-violet-100">
                <Icon className={`mx-auto h-6 w-6 ${tone}`} fill={fill ? 'currentColor' : 'none'} />
                <div className="mt-2 text-2xl font-extrabold text-[#140F3A]">{value}</div>
                <div className="text-[11px] font-medium text-slate-500 sm:text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <figure className="relative rounded-3xl bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 ring-1 ring-violet-100 sm:p-8" data-testid="testimonial-card">
          <Quote className="absolute right-6 top-6 h-10 w-10 text-violet-200" />
          <div className="flex gap-0.5">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
          <blockquote key={i} className="mt-4 min-h-[84px] text-lg font-semibold leading-relaxed text-[#140F3A] animate-in fade-in duration-500">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={t.img} alt={t.name} className="h-12 w-12 rounded-full object-cover object-top ring-2 ring-white" loading="lazy" />
              <div>
                <div className="font-bold text-[#140F3A]">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button data-testid="testimonial-prev" onClick={() => setI((x) => (x - 1 + n) % n)} aria-label="Previous testimonial" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-violet-200 transition-colors hover:bg-violet-600 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
              <button data-testid="testimonial-next" onClick={() => setI((x) => (x + 1) % n)} aria-label="Next testimonial" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-violet-200 transition-colors hover:bg-violet-600 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </figcaption>
          <div className="mt-4 flex justify-center gap-1.5">
            {TESTIMONIALS.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-violet-600' : 'w-1.5 bg-violet-200'}`} />)}
          </div>
        </figure>
      </div>
    </section>
  );
};

export default SocialProof;

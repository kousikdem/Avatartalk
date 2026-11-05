import React from 'react';
import { MessageCircleHeart, Link2, ShoppingBag, CalendarCheck, Target, BarChart3 } from 'lucide-react';
import { CARD } from './assets';

const ITEMS = [
  { icon: MessageCircleHeart, title: 'AI Avatar Chat', sub: 'Answers 24/7', tone: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/40', ring: 'bg-violet-100' },
  { icon: Link2, title: 'Smart Bio-Link', sub: 'All your links in one', tone: 'from-sky-400 to-blue-600', glow: 'shadow-sky-500/40', ring: 'bg-sky-100' },
  { icon: ShoppingBag, title: 'Sell Products', sub: 'Digital & physical', tone: 'from-pink-400 to-rose-500', glow: 'shadow-rose-500/40', ring: 'bg-pink-100' },
  { icon: CalendarCheck, title: 'Book Meetings', sub: 'Zoom, Google Meet', tone: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/40', ring: 'bg-emerald-100' },
  { icon: Target, title: 'Capture Leads', sub: 'Grow your audience', tone: 'from-fuchsia-500 to-purple-600', glow: 'shadow-fuchsia-500/40', ring: 'bg-fuchsia-100' },
  { icon: BarChart3, title: 'Analytics', sub: 'Track & grow', tone: 'from-indigo-500 to-violet-600', glow: 'shadow-indigo-500/40', ring: 'bg-indigo-100' },
];

/** Full-width bar of 6 core capabilities (3×2 on phones, 6 across from tablet up). */
const QuickFeatures: React.FC = () => (
  <section data-testid="quick-features" aria-label="Quick features" className={`${CARD} grid grid-cols-3 gap-1 p-2 sm:p-3 md:grid-cols-6`}>
    {ITEMS.map(({ icon: Icon, title, sub, tone, glow, ring }, i) => (
      <div
        key={title}
        data-testid={`quick-feature-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`}
        className={`group relative flex flex-col items-center justify-center rounded-2xl px-1.5 py-3.5 text-center transition-colors duration-300 hover:bg-violet-50/80 sm:py-4 ${
          i % 6 !== 0 ? 'md:before:absolute md:before:left-0 md:before:top-1/4 md:before:h-1/2 md:before:w-px md:before:bg-violet-100' : ''
        }`}
      >
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${ring} transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14`}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-white shadow-lg ${glow} sm:h-10 sm:w-10`}>
            <Icon className="h-5 w-5" />
          </span>
        </span>
        <h3 className="mt-2 text-[13px] font-bold leading-tight text-[#140F3A] sm:text-[15px]">{title}</h3>
        <p className="mt-0.5 text-[11px] leading-tight text-slate-500 sm:text-[13px]">{sub}</p>
      </div>
    ))}
  </section>
);

export default QuickFeatures;

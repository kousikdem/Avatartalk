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

/** 6 core capabilities — strip on mobile/tablet, 3×2 tile grid beside the hero on desktop. */
const QuickFeatures: React.FC = () => (
  <section data-testid="quick-features" aria-label="Quick features" className="grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-6 xl:grid-cols-3 xl:grid-rows-2">
    {ITEMS.map(({ icon: Icon, title, sub, tone, glow, ring }) => (
      <div
        key={title}
        data-testid={`quick-feature-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`}
        className={`${CARD} group flex flex-col items-center justify-center px-2 py-4 text-center transition-all duration-300 hover:-translate-y-1 hover:ring-violet-300 sm:py-5`}
      >
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${ring} transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 xl:h-16 xl:w-16`}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-white shadow-lg ${glow} sm:h-10 sm:w-10 xl:h-12 xl:w-12`}>
            <Icon className="h-5 w-5 xl:h-6 xl:w-6" />
          </span>
        </span>
        <h3 className="mt-2.5 text-[13px] font-bold leading-tight text-[#140F3A] sm:text-sm xl:text-base">{title}</h3>
        <p className="mt-0.5 text-[11px] leading-tight text-slate-500 sm:text-xs xl:text-[13px]">{sub}</p>
      </div>
    ))}
  </section>
);

export default QuickFeatures;

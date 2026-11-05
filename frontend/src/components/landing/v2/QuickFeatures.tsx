import React from 'react';
import { MessageCircleHeart, Link2, ShoppingBag, CalendarCheck, Target, BarChart3 } from 'lucide-react';

const ITEMS = [
  { icon: MessageCircleHeart, title: 'AI Avatar Chat', sub: 'Answers 24/7', tone: 'from-violet-500 to-purple-600', bg: 'bg-violet-50' },
  { icon: Link2, title: 'Smart Bio-Link', sub: 'All your links in one', tone: 'from-sky-500 to-blue-600', bg: 'bg-sky-50' },
  { icon: ShoppingBag, title: 'Sell Products', sub: 'Digital & physical', tone: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
  { icon: CalendarCheck, title: 'Book Meetings', sub: 'Zoom, Google Meet', tone: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
  { icon: Target, title: 'Capture Leads', sub: 'Grow your audience', tone: 'from-fuchsia-500 to-purple-600', bg: 'bg-fuchsia-50' },
  { icon: BarChart3, title: 'Analytics', sub: 'Track & grow', tone: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50' },
];

const QuickFeatures: React.FC = () => (
  <section className="relative z-10 -mt-10 px-3 sm:px-6" data-testid="quick-features">
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-violet-100 shadow-[0_24px_60px_-24px_rgba(76,29,149,0.35)] ring-1 ring-violet-100 sm:grid-cols-3 lg:grid-cols-6">
      {ITEMS.map(({ icon: Icon, title, sub, tone, bg }) => (
        <div key={title} className="group flex flex-col items-center bg-white px-3 py-5 text-center transition-colors hover:bg-violet-50/60">
          <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${bg} transition-transform duration-300 group-hover:-translate-y-1`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}>
              <Icon className="h-5 w-5" />
            </span>
          </span>
          <h3 className="text-sm font-bold text-[#140F3A]">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
        </div>
      ))}
    </div>
  </section>
);

export default QuickFeatures;

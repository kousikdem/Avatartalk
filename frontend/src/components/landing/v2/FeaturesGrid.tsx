import React from 'react';
import { Bot, Link2, ShoppingBag, Share2, BrainCircuit, Video } from 'lucide-react';
import { SectionPill, CARD } from './assets';

const FEATURES = [
  { icon: Bot, title: 'Talking AI Avatar', sub: 'Chat, voice & personality', tone: 'text-violet-600 bg-violet-50' },
  { icon: Link2, title: 'Custom Bio-Link', sub: 'Share all your links', tone: 'text-sky-600 bg-sky-50' },
  { icon: ShoppingBag, title: 'Products & Payments', sub: 'Sell, subscribe & earn', tone: 'text-rose-500 bg-rose-50' },
  { icon: Share2, title: 'Social Integrations', sub: 'Add all your social profiles', tone: 'text-blue-600 bg-blue-50' },
  { icon: BrainCircuit, title: 'AI Training', sub: 'Train with your content', tone: 'text-purple-600 bg-purple-50' },
  { icon: Video, title: 'Meetings & Events', sub: 'Google Meet, Zoom, Calendly', tone: 'text-indigo-600 bg-indigo-50' },
];

const FeaturesGrid: React.FC = () => (
  <section id="features" data-testid="features-section" className={`${CARD} h-full p-5 sm:p-6`}>
    <SectionPill>Powerful Features in One Link</SectionPill>
    <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, sub, tone }) => (
        <div
          key={title}
          data-testid={`feature-tile-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`}
          className="group flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-violet-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10 hover:ring-violet-300"
        >
          <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tone} transition-transform group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold leading-tight text-[#140F3A]">{title}</h3>
            <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesGrid;

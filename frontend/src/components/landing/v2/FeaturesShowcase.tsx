import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { UserCircle2, Bot, Gift, Crown, LayoutGrid, Share2, ArrowRight } from 'lucide-react';
import KousikProfileCard from './KousikProfileCard';
import { SectionPill } from './assets';

interface Feature {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  side: 'left' | 'right';
}

const FEATURES: Feature[] = [
  { n: 1, icon: UserCircle2, title: 'Your AI Avatar & Identity', desc: 'Photo, name, @username and bio — your brand in one place.', side: 'left' },
  { n: 2, icon: Bot, title: 'Talking AI Avatar', desc: 'Voice + text replies 24/7, trained on your own content.', side: 'left' },
  { n: 3, icon: Gift, title: 'Gifts & Tips', desc: 'Fans send token gifts to support you in one tap.', side: 'left' },
  { n: 4, icon: Crown, title: 'Subscription & Follow', desc: 'Paid memberships and followers, right on your profile.', side: 'right' },
  { n: 5, icon: LayoutGrid, title: 'Posts, Chat & Products', desc: 'Share updates, chat live and sell products & meetings.', side: 'right' },
  { n: 6, icon: Share2, title: 'Social Links & Share', desc: 'All your socials plus one smart link to share anywhere.', side: 'right' },
];

const Callout: React.FC<{ f: Feature; active: boolean; onHover: (n: number | null) => void }> = ({ f, active, onHover }) => {
  const Icon = f.icon;
  return (
    <div
      data-callout={f.n}
      data-side={f.side}
      data-testid={`feature-callout-${f.n}`}
      onMouseEnter={() => onHover(f.n)}
      onMouseLeave={() => onHover(null)}
      className={`relative z-10 flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 transition-all duration-300 ${
        f.side === 'right' ? 'lg:flex-row' : 'lg:flex-row-reverse lg:text-right'
      } ${active ? 'ring-2 ring-violet-500 shadow-xl shadow-violet-500/20 -translate-y-0.5' : 'ring-violet-100 shadow-sm hover:ring-violet-300'}`}
    >
      <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600">
        <Icon className="h-5 w-5" />
        <span className={`absolute -top-2 ${f.side === 'right' ? '-left-2' : '-left-2 lg:left-auto lg:-right-2'} flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 text-[10px] font-extrabold text-white ring-2 ring-white`}>
          {f.n}
        </span>
      </span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold leading-tight text-[#140F3A]">{f.title}</h3>
        <p className="mt-1 text-xs leading-snug text-slate-500">{f.desc}</p>
      </div>
    </div>
  );
};

interface Path { n: number; d: string; ex: number; ey: number; sx: number; sy: number }

const FeaturesShowcase: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);

  const compute = useCallback(() => {
    const root = rootRef.current;
    if (!root || window.innerWidth < 1024) { setPaths([]); return; }
    const r = root.getBoundingClientRect();
    const out: Path[] = [];
    root.querySelectorAll<HTMLElement>('[data-callout]').forEach((el) => {
      const n = Number(el.dataset.callout);
      const marker = root.querySelector<HTMLElement>(`[data-marker="${n}"]`);
      if (!marker) return;
      const a = el.getBoundingClientRect();
      const b = marker.getBoundingClientRect();
      const sx = (el.dataset.side === 'left' ? a.right : a.left) - r.left;
      const sy = a.top + a.height / 2 - r.top;
      const ex = b.left + b.width / 2 - r.left;
      const ey = b.top + b.height / 2 - r.top;
      const dx = (ex - sx) * 0.55;
      out.push({ n, sx, sy, ex, ey, d: `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}` });
    });
    setPaths(out);
  }, []);

  useLayoutEffect(() => { compute(); }, [compute]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => compute());
    ro.observe(root);
    window.addEventListener('resize', compute);
    // the 3D avatar + chat demo settle over the first seconds
    const t = window.setInterval(compute, 600);
    const stop = window.setTimeout(() => window.clearInterval(t), 9000);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); window.clearInterval(t); window.clearTimeout(stop); };
  }, [compute]);

  const left = FEATURES.filter((f) => f.side === 'left');
  const right = FEATURES.filter((f) => f.side === 'right');

  return (
    <section id="features" data-testid="features-section" className="px-3 pt-16 sm:px-6 md:pt-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[radial-gradient(90%_80%_at_50%_0%,#F3EEFF_0%,#FFFFFF_70%)] px-4 py-12 ring-1 ring-violet-100 sm:px-8 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <SectionPill>Powerful Features in One Link</SectionPill>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#140F3A] md:text-[2.6rem] md:leading-tight">
            A Real AvatarTalk Profile
          </h2>
          <p className="mt-3 text-base text-slate-600">
            This is exactly how <span className="font-semibold text-violet-700">@kousik</span>&apos;s profile looks to visitors —
            every numbered dot is a feature you get in your own smart link. Hover to explore.
          </p>
        </div>

        <div ref={rootRef} className="relative mt-12">
          {/* connectors (desktop) */}
          <svg className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible lg:block" aria-hidden>
            <defs>
              <linearGradient id="lp-conn" x1="0" x2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            {paths.map((p) => {
              const on = active === p.n;
              return (
                <g key={p.n}>
                  <path d={p.d} fill="none" stroke="url(#lp-conn)" strokeWidth={on ? 2.5 : 1.5} strokeDasharray={on ? '0' : '5 6'} opacity={active && !on ? 0.35 : 1} style={{ transition: 'all .3s' }} />
                  <circle cx={p.sx} cy={p.sy} r={on ? 4.5 : 3.5} fill="#8b5cf6" />
                </g>
              );
            })}
          </svg>

          <div className="relative grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_380px_minmax(0,1fr)] lg:gap-16">
            <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1 lg:flex lg:flex-col lg:justify-around lg:py-10">
              {left.map((f) => <Callout key={f.n} f={f} active={active === f.n} onHover={setActive} />)}
            </div>

            <div id="live-preview" className="relative z-10 order-1 mx-auto w-full max-w-[380px] self-center lg:order-2">
              <span className="absolute -top-3 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                ● Live Profile Preview
              </span>
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-violet-400/30 via-fuchsia-300/20 to-indigo-400/30 blur-2xl" />
              <KousikProfileCard activeMarker={active} onMarkerHover={setActive} />
            </div>

            <div className="order-3 grid gap-4 sm:grid-cols-2 lg:flex lg:flex-col lg:justify-around lg:py-10">
              {right.map((f) => <Callout key={f.n} f={f} active={active === f.n} onHover={setActive} />)}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            data-testid="features-create-cta"
            onClick={onCreate}
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#140F3A] px-7 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-violet-700"
          >
            Get a profile like @kousik — free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;

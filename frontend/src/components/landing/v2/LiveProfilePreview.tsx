import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { UserCircle2, MessageSquare, Crown, LayoutGrid, ArrowRight, CheckCircle2 } from 'lucide-react';
import KousikProfileCard from './KousikProfileCard';
import { SectionPill } from './assets';

const INDICATORS = [
  { n: 1, icon: UserCircle2, title: 'Your AI Avatar & Identity', desc: 'Photo, name, @username & bio' },
  { n: 2, icon: MessageSquare, title: 'Real-time Chat', desc: 'Voice + text replies 24/7' },
  { n: 3, icon: Crown, title: 'Subscription & Follow', desc: 'Paid memberships & followers' },
  { n: 4, icon: LayoutGrid, title: 'Posts, Chat & Products', desc: 'Share, chat and sell in one place' },
];

interface Path { n: number; d: string; ex: number; ey: number }

const LiveProfilePreview: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);

  // curved connectors: card edge marker → indicator (desktop only)
  const compute = useCallback(() => {
    const root = rootRef.current;
    if (!root || window.innerWidth < 1024) { setPaths([]); return; }
    const r = root.getBoundingClientRect();
    const out: Path[] = [];
    INDICATORS.forEach(({ n }) => {
      const m = root.querySelector<HTMLElement>(`[data-marker="${n}"]`);
      const t = root.querySelector<HTMLElement>(`[data-indicator="${n}"]`);
      if (!m || !t) return;
      const a = m.getBoundingClientRect();
      const b = t.getBoundingClientRect();
      const sx = a.left + a.width / 2 - r.left;
      const sy = a.top + a.height / 2 - r.top;
      const ex = b.left - r.left - 4;
      const ey = b.top + b.height / 2 - r.top;
      const dx = (ex - sx) * 0.5;
      out.push({ n, ex, ey, d: `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}` });
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
    const iv = window.setInterval(compute, 700);
    const stop = window.setTimeout(() => window.clearInterval(iv), 10000);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); window.clearInterval(iv); window.clearTimeout(stop); };
  }, [compute]);

  return (
    <section
      id="live-preview"
      data-testid="live-preview-section"
      className="relative h-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2B1A6E] via-[#3E1F96] to-[#6D28D9] p-5 ring-1 ring-violet-400/40 shadow-[0_30px_70px_-30px_rgba(76,29,149,0.7)] sm:p-7 lg:py-9"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />

      <div
        ref={rootRef}
        className="relative grid h-full gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,350px)_minmax(0,250px)] lg:items-center lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)_minmax(0,290px)] xl:gap-x-14 xl:px-4"
      >
        <svg className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full overflow-visible lg:block" aria-hidden>
          <defs>
            <linearGradient id="lp-conn" x1="0" x2="1">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#ddd6fe" />
            </linearGradient>
            <marker id="lp-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ddd6fe" />
            </marker>
          </defs>
          {paths.map((p) => {
            const on = active === p.n;
            return (
              <path key={p.n} d={p.d} fill="none" stroke="url(#lp-conn)" markerEnd="url(#lp-arrow)"
                strokeWidth={on ? 2.5 : 1.6} strokeDasharray={on ? '0' : '5 5'} opacity={active && !on ? 0.35 : 1}
                style={{ transition: 'all .3s' }} />
            );
          })}
        </svg>

        {/* Copy */}
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <SectionPill className="bg-white/15 text-white ring-1 ring-white/25">Live Profile Preview</SectionPill>
          <h2 className="mt-3 text-[1.8rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[2.4rem]">
            A Real AvatarTalk Profile
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-violet-100 sm:text-[15px]">
            See how your AI avatar profile looks and works with chat, subscription, links and products — this is
            <span className="font-semibold text-white"> @kousik</span>&apos;s page, exactly as visitors see it.
          </p>
          <ul className="mt-5 space-y-2.5" data-testid="live-preview-highlights">
            {[
              'Talks to every visitor in your voice, 24/7',
              'Sells products & books meetings right inside the chat',
              'Paid subscriptions, followers and posts on one page',
              'Shareable as a single link — avatartalk.co/yourname',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-violet-50">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
          <button
            data-testid="live-preview-cta"
            onClick={onCreate}
            className="group mt-5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-lg transition-colors hover:bg-violet-50"
          >
            Get a profile like this <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Profile card */}
        <div className="relative order-2 mx-auto w-full max-w-[340px] self-center lg:col-start-2 lg:row-start-1">
          <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[40px] bg-gradient-to-br from-violet-400/30 via-fuchsia-300/20 to-indigo-400/30 blur-2xl" />
          <KousikProfileCard activeMarker={active} onCreate={onCreate} />
        </div>

        {/* Indicators */}
        <ul className="order-3 grid gap-2.5 sm:grid-cols-2 lg:col-start-3 lg:row-start-1 lg:flex lg:flex-col lg:justify-center lg:gap-4">
          {INDICATORS.map(({ n, icon: Icon, title, desc }) => (
            <li
              key={n}
              data-indicator={n}
              data-testid={`profile-indicator-${n}`}
              onMouseEnter={() => setActive(n)}
              onMouseLeave={() => setActive(null)}
              className={`relative z-20 flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 transition-all duration-300 ${active === n ? 'ring-2 ring-violet-500 shadow-xl shadow-violet-500/20' : 'ring-violet-100 shadow-sm'}`}
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold leading-tight text-[#140F3A]">{title}</h3>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
};

export default LiveProfilePreview;

import React, { useState } from 'react';
import { ArrowRight, PlayCircle, CheckCircle2, Zap, CreditCard, Mic, Hash, Bot } from 'lucide-react';
import { IMG } from './assets';

const QA: Array<{ q: string; a: string }> = [
  { q: 'Who are you?', a: "I'm an AI avatar trained on my creator's knowledge — I reply 24/7 in their voice. 👋" },
  { q: 'What do you do?', a: 'I answer questions, share links, sell products and capture leads — even while you sleep. 🚀' },
  { q: 'Show your products', a: 'My bestselling course and 1:1 coaching are right here — tap to buy inside the chat. 🛒' },
  { q: "Let's book a meeting", a: "Pick a Zoom or Google Meet slot and I'll confirm it instantly. 📅" },
];

interface Props {
  onCreate: () => void;
  onDemo: () => void;
}

const HeroSection: React.FC<Props> = ({ onCreate, onDemo }) => {
  const [active, setActive] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);

  const ask = (i: number) => {
    setActive(i);
    setTyping(true);
    window.setTimeout(() => setTyping(false), 700);
  };

  return (
    <section className="relative px-3 pt-20 sm:px-6 md:pt-24" data-testid="hero-section">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[radial-gradient(120%_120%_at_0%_0%,#F5F1FF_0%,#EDE6FF_45%,#DCCBFF_100%)] ring-1 ring-violet-200/70 md:rounded-[36px]">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-fuchsia-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl" />

        <div className="relative grid items-center gap-6 px-5 pb-16 pt-8 sm:px-10 md:pb-20 lg:grid-cols-12 lg:gap-4 lg:pt-12">
          {/* Copy */}
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm ring-1 ring-violet-200">
              <Hash className="h-3.5 w-3.5" /> #1 AI Avatar for Your Digital Identity
            </span>
            <h1 className="mt-5 text-[2.35rem] font-extrabold leading-[1.05] tracking-tight text-[#140F3A] sm:text-5xl lg:text-[3.6rem]">
              Your AI Avatar.<br />One Link.{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                Endless Opportunities.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Create a talking AI avatar that represents you, answers questions, shares your links, sells your products,
              books meetings, and grows your audience — all in one smart link.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                data-testid="hero-create-avatar"
                onClick={onCreate}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/35 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/50"
              >
                Create My AI Avatar — Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                data-testid="hero-live-demo"
                onClick={onDemo}
                className="flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white/90 px-7 py-4 text-base font-bold text-slate-800 shadow-sm transition-all hover:border-violet-400 hover:text-violet-700"
              >
                <PlayCircle className="h-5 w-5 text-violet-600" /> See Live Demo
              </button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free to start</li>
              <li className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" fill="currentColor" /> Setup in 60 seconds</li>
              <li className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-violet-500" /> No credit card required</li>
            </ul>
          </div>

          {/* Visual */}
          <div className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[480px] lg:col-span-6 lg:h-[520px]">
            {/* avatar image with soft fade */}
            <div className="absolute bottom-0 right-0 h-full w-[68%] sm:w-[62%]">
              <div className="absolute inset-x-6 bottom-6 top-10 rounded-full bg-white/60 blur-2xl" />
              <img
                src={IMG.heroAvatar}
                alt="AvatarTalk AI avatar"
                className="relative h-full w-full object-cover object-top"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse 50% 56% at 50% 44%, #000 72%, transparent 100%)',
                  maskImage: 'radial-gradient(ellipse 50% 56% at 50% 44%, #000 72%, transparent 100%)',
                }}
                loading="eager"
              />
            </div>

            {/* chat bubble + quick questions */}
            <div className="absolute left-0 top-6 w-[58%] max-w-[260px] sm:top-10" data-testid="hero-chat">
              <div className="relative rounded-2xl rounded-bl-md bg-white p-3.5 shadow-xl shadow-violet-500/15 ring-1 ring-violet-100">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-500">
                  <Bot className="h-3.5 w-3.5" /> AI Avatar
                </div>
                {active === null ? (
                  <p className="text-sm font-bold leading-snug text-[#140F3A]">Hi! I&apos;m your AI Avatar<br /><span className="font-semibold text-violet-600">Ask me anything…</span></p>
                ) : typing ? (
                  <div className="flex gap-1 py-2">
                    {[0, 150, 300].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                ) : (
                  <p data-testid="hero-chat-answer" className="text-sm font-medium leading-snug text-slate-700">{QA[active].a}</p>
                )}
              </div>
              <div className="mt-3 flex flex-col items-start gap-2">
                {QA.map((item, i) => (
                  <button
                    key={item.q}
                    data-testid={`hero-question-${i}`}
                    onClick={() => ask(i)}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-md transition-all hover:-translate-y-0.5 sm:text-[13px] ${
                      active === i ? 'bg-violet-600 text-white shadow-violet-500/40' : 'bg-white text-slate-700 ring-1 ring-violet-100 hover:ring-violet-300'
                    }`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${active === i ? 'bg-white text-violet-600' : 'bg-violet-600 text-white'}`}>?</span>
                    {item.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Talk to me */}
            <button
              data-testid="hero-talk-to-me"
              onClick={onDemo}
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-2xl shadow-violet-600/40 ring-4 ring-white/70 transition-transform hover:scale-105 sm:left-[62%]"
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
                <Mic className="relative h-4 w-4" />
              </span>
              Talk to Me
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

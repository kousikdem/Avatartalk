import React from 'react';
import { BadgeCheck, UserPlus, PenTool, Link2, ArrowRight } from 'lucide-react';
import { IMG, SectionPill, CARD } from './assets';

const CASES = [
  { img: IMG.techFounder, handle: '@techfounder', role: 'Tech Founder', desc: 'Answering questions, sharing products & booking calls.' },
  { img: IMG.fitnessCoach, handle: '@fitnesscoach', role: 'Fitness Coach', desc: 'Guiding clients and selling training plans.' },
  { img: IMG.businessMentor, handle: '@businessmentor', role: 'Business Mentor', desc: 'Generating leads and hosting paid sessions.' },
  { img: IMG.educator, handle: '@educator', role: 'Educator', desc: 'Sharing knowledge, courses and resources with AI.' },
];

const STEPS = [
  { icon: UserPlus, title: 'Create Profile', desc: 'Sign up in seconds' },
  { icon: PenTool, title: 'Design Avatar', desc: 'Choose a style & voice' },
  { icon: Link2, title: 'Add Links & AI', desc: 'Add your links, products and train your AI' },
];

const UseCasesHowItWorks: React.FC = () => (
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-5">
    {/* Use cases */}
    <section id="use-cases" data-testid="use-cases-section" className={`${CARD} p-5 sm:p-6`}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,250px)_minmax(0,1fr)] xl:items-center">
        <div>
          <SectionPill>Use Cases</SectionPill>
          <h2 className="mt-3 text-[1.7rem] font-extrabold leading-[1.1] tracking-tight text-[#140F3A] sm:text-3xl xl:text-[1.65rem]">
            Built for Creators, Founders, Businesses &amp; More
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">One AI avatar platform for personal brand, business, education, coaching and beyond.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CASES.map((c) => (
            <article key={c.handle} data-testid={`use-case-${c.handle.slice(1)}`} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-violet-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/15">
              <div className="aspect-[4/3] overflow-hidden bg-violet-100">
                <img src={c.img} alt={c.role} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-2.5">
                <p className="flex min-w-0 items-center gap-1 text-[11px] font-bold text-slate-800"><span className="truncate">{c.handle}</span> <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 fill-sky-500 text-white" /></p>
                <h3 className="mt-0.5 text-sm font-bold text-[#140F3A]">{c.role}</h3>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section id="how-it-works" data-testid="how-it-works-section" className={`${CARD} flex flex-col justify-center bg-gradient-to-br from-white to-violet-50/80 p-5 sm:p-6`}>
      <SectionPill className="self-start">How It Works</SectionPill>
      <h2 className="mt-3 text-[1.5rem] font-extrabold leading-tight tracking-tight text-[#140F3A] sm:text-[1.65rem]">Create Your AI Avatar in 3 Simple Steps</h2>
      <ol className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch lg:flex-col xl:flex-row">
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <React.Fragment key={title}>
            <li data-testid={`how-step-${i + 1}`} className="flex flex-1 items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-violet-100 transition-all hover:shadow-lg hover:shadow-violet-500/10 sm:flex-col sm:justify-center sm:text-center lg:flex-row lg:justify-start lg:text-left xl:flex-col xl:justify-center xl:text-center">
              <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Icon className="h-5 w-5" />
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] font-extrabold text-white ring-2 ring-white">{i + 1}</span>
              </span>
              <div>
                <h3 className="text-[13px] font-bold leading-tight text-[#140F3A]">{title}</h3>
                <p className="mt-1 text-xs leading-snug text-slate-500">{desc}</p>
              </div>
            </li>
            {i < STEPS.length - 1 && (
              <ArrowRight aria-hidden className="mx-auto h-4 w-4 flex-shrink-0 rotate-90 self-center text-violet-500 sm:rotate-0 lg:rotate-90 xl:rotate-0" />
            )}
          </React.Fragment>
        ))}
      </ol>
    </section>
  </div>
);

export default UseCasesHowItWorks;

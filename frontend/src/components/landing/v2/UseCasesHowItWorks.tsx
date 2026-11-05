import React from 'react';
import { BadgeCheck, UserPlus, PenTool, Link2, ArrowRight } from 'lucide-react';
import { IMG, SectionPill } from './assets';

const CASES = [
  { img: IMG.techFounder, handle: '@techfounder', role: 'Tech Founder', desc: 'Answering questions, sharing products & booking calls.' },
  { img: IMG.fitnessCoach, handle: '@fitnesscoach', role: 'Fitness Coach', desc: 'Guiding clients and selling training plans.' },
  { img: IMG.businessMentor, handle: '@businessmentor', role: 'Business Mentor', desc: 'Generating leads and hosting paid sessions.' },
  { img: IMG.educator, handle: '@educator', role: 'Educator', desc: 'Sharing knowledge, courses and resources with AI.' },
];

const STEPS = [
  { icon: UserPlus, title: 'Create Profile', desc: 'Sign up in seconds' },
  { icon: PenTool, title: 'Design Avatar', desc: 'Choose a style & voice' },
  { icon: Link2, title: 'Add Links & AI', desc: 'Add links, products and train your AI' },
];

const UseCasesHowItWorks: React.FC = () => (
  <section className="px-3 pt-16 sm:px-6 md:pt-20">
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-12">
      {/* Use cases */}
      <div id="use-cases" data-testid="use-cases-section" className="rounded-3xl bg-white p-5 ring-1 ring-violet-100 sm:p-7 xl:col-span-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:items-center">
          <div>
            <SectionPill>Use Cases</SectionPill>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#140F3A]">
              Built for Creators, Founders, Businesses & More
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">One AI avatar platform for personal brand, business, education, coaching and beyond.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CASES.map((c) => (
              <article key={c.handle} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-violet-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/15">
                <div className="aspect-[4/3.4] overflow-hidden bg-violet-100">
                  <img src={c.img} alt={c.role} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-2.5">
                  <p className="flex items-center gap-1 truncate text-[11px] font-bold text-slate-800">{c.handle} <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 fill-sky-500 text-white" /></p>
                  <h3 className="mt-0.5 text-sm font-bold text-[#140F3A]">{c.role}</h3>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{c.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" data-testid="how-it-works-section" className="rounded-3xl bg-gradient-to-br from-white to-violet-50 p-5 ring-1 ring-violet-100 sm:p-7 xl:col-span-5">
        <SectionPill>How It Works</SectionPill>
        <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#140F3A]">Create Your AI Avatar in 3 Simple Steps</h2>
        <ol className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <React.Fragment key={title}>
              <li className="flex-1 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-violet-100 transition-all hover:shadow-lg hover:shadow-violet-500/10">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Icon className="h-5 w-5" /></span>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-extrabold text-white">{i + 1}</span>
                  <h3 className="text-sm font-bold text-[#140F3A]">{title}</h3>
                </div>
                <p className="mt-1.5 text-xs leading-snug text-slate-500">{desc}</p>
              </li>
              {i < STEPS.length - 1 && (
                <ArrowRight aria-hidden className="mx-auto h-5 w-5 flex-shrink-0 rotate-90 text-violet-500 sm:rotate-0" />
              )}
            </React.Fragment>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default UseCasesHowItWorks;

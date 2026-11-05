import React from 'react';
import { ArrowRight } from 'lucide-react';
import { IMG } from './assets';

const FinalCTA: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <section data-testid="final-cta-section" className="px-3 pt-16 sm:px-6 md:pt-24">
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-600 px-6 py-10 shadow-2xl shadow-violet-600/30 sm:px-12">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-fuchsia-400/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-[2.6rem]">Create Your AI Avatar Today</h2>
          <p className="mt-2 text-lg text-violet-100">Join 1,000+ creators building with AvatarTalk.</p>
        </div>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <button
            data-testid="final-cta-create-account"
            onClick={onCreate}
            className="group flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-violet-700 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Create Free Account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <div className="flex -space-x-4">
            {[IMG.techFounder, IMG.fitnessCoach, IMG.educator].map((src, k) => (
              <img key={k} src={src} alt="AvatarTalk creator" loading="lazy" className="h-16 w-16 rounded-full object-cover object-top ring-4 ring-white/80 sm:h-20 sm:w-20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;

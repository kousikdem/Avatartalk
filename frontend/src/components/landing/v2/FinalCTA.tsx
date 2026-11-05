import React from 'react';
import { ArrowRight } from 'lucide-react';
import { IMG } from './assets';

const FinalCTA: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <section data-testid="final-cta-section" className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-500 px-6 py-7 shadow-2xl shadow-violet-600/30 sm:px-10">
    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-300/40 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-indigo-400/30 blur-3xl" />
    <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
      <div>
        <h2 className="text-[1.8rem] font-extrabold leading-tight tracking-tight text-white sm:text-4xl">Create Your AI Avatar Today</h2>
        <p className="mt-1 text-base text-violet-100 sm:text-lg">Join 1,000+ creators building with AvatarTalk.</p>
      </div>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <button
          data-testid="final-cta-create-account"
          onClick={onCreate}
          className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-violet-700 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
        >
          Create Free Account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
        <div className="flex -space-x-4">
          {[IMG.techFounder, IMG.fitnessCoach, IMG.educator].map((src, k) => (
            <img key={k} src={src} alt="AvatarTalk creator" loading="lazy" className="h-14 w-14 rounded-full object-cover object-top ring-4 ring-white/80 sm:h-[72px] sm:w-[72px]" />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;

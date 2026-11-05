import React from 'react';
import { Play } from 'lucide-react';
import { IMG, CARD } from './assets';

/** "See AvatarTalk in Action" — sits beside the features grid; jumps to the live @kousik demo. */
const SeeInAction: React.FC<{ onWatch: () => void }> = ({ onWatch }) => (
  <section data-testid="see-in-action-section" className={`${CARD} grid h-full items-center gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:p-5`}>
    <button
      data-testid="see-in-action-thumb"
      onClick={onWatch}
      aria-label="Watch the live demo"
      className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-900 sm:aspect-auto sm:h-full sm:min-h-[170px]"
    >
      <img src={IMG.techFounder} alt="AvatarTalk demo" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-violet-950/70 via-violet-900/20 to-transparent" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-violet-700 shadow-2xl ring-8 ring-white/25 transition-transform group-hover:scale-110">
        <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
      </span>
    </button>
    <div>
      <h2 className="text-xl font-extrabold tracking-tight text-[#140F3A] sm:text-[1.35rem]">See AvatarTalk in Action</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">Watch how a real AvatarTalk profile chats, shares links and sells — then create, customize and go live with your own AI avatar.</p>
      <button
        data-testid="see-in-action-watch"
        onClick={onWatch}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-transform hover:-translate-y-0.5"
      >
        <Play className="h-4 w-4" fill="currentColor" /> Watch Live Demo
      </button>
    </div>
  </section>
);

export default SeeInAction;

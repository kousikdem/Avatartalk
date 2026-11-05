import React from 'react';

const BASE = 'https://static.prod-images.emergentagent.com/jobs/1ddc95bc-7c93-4c43-995c-fc250df5ada4/images';

export const IMG = {
  heroAvatar: `${BASE}/29ecef781d1d8d151fedb3c6e6a5f2da92b7c1be63d10fd7335edeb7c1fe560c.jpeg`,
  techFounder: `${BASE}/17378a3e8c4e24584d3bd576ad6d92affe681422e951d72455234d2d488ea1b7.jpeg`,
  fitnessCoach: `${BASE}/25d93aa14327594328e00ca3bb6a5df271b76513c05cb724cdcd17cc19e8e6a1.jpeg`,
  businessMentor: `${BASE}/b69db3d18ee3b9c77ee6e34cb392bee48ed9e5d86ed69db9d7c9d13565dfb279.jpeg`,
  educator: `${BASE}/b54459be327c7b0c9ec60339216e332634c1bab1edea67afb240b44f1131f515.jpeg`,
  priya: `${BASE}/3ff7cae86ef298be9edb7e7e179ac77123a52628f36eb4c45468bb1608c34db0.jpeg`,
};

/** Smooth-scroll to a landing section by id (accounts for sticky header). */
export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top, behavior: 'smooth' });
};

export const SectionPill: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-violet-700 ${className}`}>
    {children}
  </span>
);


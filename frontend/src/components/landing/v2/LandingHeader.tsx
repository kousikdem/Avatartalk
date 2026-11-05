import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ChevronDown, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { scrollToSection } from './assets';

export const Logo: React.FC<{ light?: boolean }> = ({ light }) => (
  <span className="flex items-center gap-2">
    <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 shadow-lg shadow-violet-500/30">
      <Bot className="h-5 w-5 text-white" strokeWidth={2.4} />
      <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-300" fill="currentColor" />
    </span>
    <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent'}`}>
      AvatarTalk
    </span>
  </span>
);

const NAV = [
  { label: 'Features', id: 'features' },
  { label: 'Use Cases', id: 'use-cases' },
  { label: 'Examples', id: 'live-preview' },
  { label: 'Pricing', id: 'pricing' },
];

const RESOURCES = [
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Full pricing details', to: '/pricing' },
  { label: 'Help Center', href: 'mailto:support@avatartalk.co' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Refund Policy', to: '/refund-policy' },
];

interface Props {
  onSignIn: () => void;
  onSignUp: () => void;
}

const LandingHeader: React.FC<Props> = ({ onSignIn, onSignUp }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => { setOpen(false); scrollToSection(id); };

  return (
    <header
      data-testid="landing-header"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/85 shadow-[0_8px_30px_-12px_rgba(76,29,149,0.25)] backdrop-blur-xl' : 'bg-white/60 backdrop-blur-md'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" data-testid="header-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <button
              key={n.id}
              data-testid={`nav-${n.id}`}
              onClick={() => go(n.id)}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              {n.label}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-testid="nav-resources"
              className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 outline-none transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              Resources <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 rounded-xl p-1.5">
              {RESOURCES.map((r) => (
                <DropdownMenuItem key={r.label} asChild={!r.id} onSelect={() => r.id && go(r.id)} className="cursor-pointer rounded-lg text-sm">
                  {r.to ? <Link to={r.to}>{r.label}</Link> : r.href ? <a href={r.href}>{r.label}</a> : <span>{r.label}</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            data-testid="header-sign-in"
            onClick={onSignIn}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:border-violet-300 hover:text-violet-700"
          >
            Sign In
          </button>
          <button
            data-testid="header-create-account"
            onClick={onSignUp}
            className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-500/50"
          >
            Create Free Account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div data-testid="mobile-menu" className="border-t border-slate-100 bg-white px-4 pb-5 pt-2 shadow-xl lg:hidden">
          {[...NAV, { label: 'How it works', id: 'how-it-works' }].map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className="block w-full rounded-lg px-3 py-3 text-left text-base font-semibold text-slate-800 hover:bg-violet-50">
              {n.label}
            </button>
          ))}
          <div className="my-2 grid grid-cols-3 gap-2 px-1 text-xs text-slate-500">
            <Link to="/terms">Terms</Link><Link to="/privacy-policy">Privacy</Link><Link to="/refund-policy">Refunds</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => { setOpen(false); onSignIn(); }} className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold">Sign In</button>
            <button onClick={() => { setOpen(false); onSignUp(); }} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white">Create Free Account</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;

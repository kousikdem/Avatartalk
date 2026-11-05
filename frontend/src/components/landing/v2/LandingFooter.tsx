import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Logo } from './LandingHeader';
import { scrollToSection } from './assets';

const SOCIALS = [
  { icon: Youtube, href: 'https://www.youtube.com/@avatartalk-co', label: 'YouTube', bg: 'bg-red-600' },
  { icon: Twitter, href: 'https://x.com/avatartalk_', label: 'X', bg: 'bg-black' },
  { icon: Instagram, href: 'https://www.instagram.com/avatartalk.co/', label: 'Instagram', bg: 'bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/avatartalk-co/', label: 'LinkedIn', bg: 'bg-sky-600' },
  { icon: Facebook, href: 'https://www.facebook.com/avatartalkco/', label: 'Facebook', bg: 'bg-blue-600' },
];

const Col: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-bold text-white">{title}</h3>
    <ul className="mt-3 space-y-2 text-sm text-slate-400">{children}</ul>
  </div>
);

const btn = 'hover:text-white transition-colors text-left';

const LandingFooter: React.FC = () => (
  <footer data-testid="landing-footer" className="mt-16 px-3 pb-3 sm:px-6 md:mt-24">
    <div className="mx-auto max-w-7xl rounded-[28px] bg-[#120E2E] px-6 py-10 sm:px-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm text-slate-400">Your AI Avatar. One Link. Endless Opportunities.</p>
        </div>
        <Col title="Product">
          <li><button className={btn} onClick={() => scrollToSection('features')}>Features</button></li>
          <li><button className={btn} onClick={() => scrollToSection('pricing')}>Pricing</button></li>
          <li><button className={btn} onClick={() => scrollToSection('live-preview')}>Examples</button></li>
        </Col>
        <Col title="Resources">
          <li><button className={btn} onClick={() => scrollToSection('how-it-works')}>How it works</button></li>
          <li><a className={btn} href="mailto:support@avatartalk.co">Help Center</a></li>
          <li><Link className={btn} to="/pricing">Plans & Tokens</Link></li>
        </Col>
        <Col title="Company">
          <li><button className={btn} onClick={() => scrollToSection('use-cases')}>About</button></li>
          <li><a className={btn} href="mailto:support@avatartalk.co">Contact</a></li>
          <li><Link className={btn} to="/refund-policy">Refund Policy</Link></li>
        </Col>
        <div>
          <h3 className="text-sm font-bold text-white">Follow Us</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {SOCIALS.map(({ icon: Icon, href, label, bg }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} data-testid={`footer-social-${label.toLowerCase()}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} text-white transition-transform hover:-translate-y-0.5`}>
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} AvatarTalk. All rights reserved.</p>
        <div className="flex gap-5">
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
          <Link to="/privacy-policy" className="hover:text-white">Cookies</Link>
          <Link to="/refund-policy" className="hover:text-white">Refunds</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;

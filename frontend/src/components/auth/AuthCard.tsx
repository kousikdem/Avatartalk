import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, ArrowRight, Bot } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SITE = () => (import.meta.env.VITE_SITE_URL as string) || window.location.origin;
const CODES = ['+91', '+1', '+44', '+61', '+971', '+65', '+49', '+33'];

const signInSchema = z.object({ email: z.string().trim().email('Enter a valid email'), password: z.string().min(6, 'Password must be at least 6 characters') });
const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().regex(/^[0-9 ]{0,15}$/, 'Mobile number should contain digits only').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Field: React.FC<{ icon: React.ComponentType<{ className?: string }>; label?: string; req?: boolean; children: React.ReactNode }> = ({ icon: I, label, req, children }) => (
  <div className="flex items-start gap-3">
    <I className="w-5 h-5 text-slate-500 mt-[30px] shrink-0 hidden sm:block" />
    <div className="flex-1">
      {label && <p className="text-sm font-semibold text-slate-800 mb-1.5">{label}{req && <span className="text-rose-500"> *</span>}</p>}
      {children}
    </div>
  </div>
);

const input = 'w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400';

interface Props { defaultTab?: 'signin' | 'signup'; onDone?: () => void }

const AuthCard: React.FC<Props> = ({ defaultTab = 'signin', onDone }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const [f, setF] = useState({ email: '', password: '', name: '', phone: '', code: '+91' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const fail = (e: unknown) => {
    const msg = e instanceof z.ZodError ? e.issues[0].message : (e as any)?.message || 'Something went wrong';
    toast({ title: 'Oops', description: msg, variant: 'destructive' });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const v = signInSchema.parse({ email: f.email, password: f.password });
      const { error } = await supabase.auth.signInWithPassword(v as { email: string; password: string });
      if (error) throw error;
      toast({ title: 'Welcome back!' });
      onDone?.();
      navigate('/settings/dashboard', { replace: true });
    } catch (err) { fail(err); } finally { setLoading(false); }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { toast({ title: 'Please accept the Terms & Privacy Policy', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const v = signUpSchema.parse({ name: f.name, email: f.email, phone: f.phone || undefined, password: f.password });
      const phone = v.phone ? `${f.code} ${v.phone}`.trim() : null;
      const { data, error } = await supabase.auth.signUp({
        email: v.email, password: v.password,
        options: { data: { full_name: v.name, display_name: v.name, phone_number: phone }, emailRedirectTo: `${window.location.origin}/settings/dashboard` },
      });
      if (error) throw error;
      if (data.session && data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: v.name, display_name: v.name, phone_number: phone, email: v.email } as any, { onConflict: 'id' });
        toast({ title: 'Account created!', description: "Let's create your AI avatar." });
        onDone?.();
        navigate('/settings/dashboard', { replace: true });
      } else {
        toast({ title: 'Check your inbox', description: 'We sent a confirmation link to finish creating your account.' });
        setTab('signin');
      }
    } catch (err) { fail(err); } finally { setLoading(false); }
  };

  const oauth = async (provider: 'google' | 'facebook' | 'twitter' | 'linkedin_oidc') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${SITE()}/settings/dashboard` } });
    if (error) fail(error);
  };

  const forgot = async () => {
    if (!f.email) { toast({ title: 'Enter your email first' }); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(f.email.trim(), { redirectTo: `${SITE()}/settings/account` });
    if (error) fail(error); else toast({ title: 'Reset link sent', description: 'Check your email.' });
  };

  const primaryBtn = 'w-full h-12 rounded-xl text-white font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 inline-flex items-center justify-center gap-2 disabled:opacity-70';

  return (
    <div className="w-full" data-testid="auth-card">
      {tab === 'signin' ? (
        <div className="text-center mb-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg"><Bot className="w-7 h-7 text-white" /></div>
          <h2 className="mt-3 text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">AvatarTalk.Co</h2>
          <p className="text-sm text-slate-500 mt-1">Create your AI avatar and start engaging</p>
        </div>
      ) : (
        <div className="text-center mb-5">
          <h2 className="text-2xl font-extrabold text-slate-900">Create Your Account</h2>
          <p className="text-sm text-slate-500 mt-1">Start building your AI avatar today.</p>
        </div>
      )}

      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 mb-5">
        {(['signin', 'signup'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} data-testid={`auth-tab-${t}`}
            className={`h-10 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'text-slate-700'}`}>
            {t === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {tab === 'signin' ? (
        <form onSubmit={signIn} className="space-y-3">
          <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="email" value={f.email} onChange={set('email')} placeholder="Enter your email" className={`${input} pl-10`} data-testid="signin-email" autoComplete="email" /></div>
          <div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} placeholder="Enter your password" className={`${input} pl-10 pr-10`} data-testid="signin-password" autoComplete="current-password" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
          <div className="text-right"><button type="button" onClick={forgot} className="text-xs text-violet-600 font-medium" data-testid="forgot-password">Forgot password?</button></div>
          <button type="submit" disabled={loading} className={primaryBtn} data-testid="signin-submit">{loading && <Loader2 className="w-4 h-4 animate-spin" />}Sign In</button>
        </form>
      ) : (
        <form onSubmit={signUp} className="space-y-3.5">
          <Field icon={User} label="Full Name" req><input value={f.name} onChange={set('name')} placeholder="Your full name" className={input} data-testid="signup-name" /></Field>
          <Field icon={Mail} label="Email" req><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" className={input} data-testid="signup-email" /></Field>
          <Field icon={Phone} label="Mobile Number (Optional)">
            <div className="flex gap-2">
              <select value={f.code} onChange={set('code')} className="h-11 rounded-xl border border-slate-200 bg-white px-2 text-sm" data-testid="signup-country-code">{CODES.map((c) => <option key={c}>{c}</option>)}</select>
              <input inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="Enter mobile number" className={input} data-testid="signup-phone" />
            </div>
          </Field>
          <Field icon={Lock} label="Password" req>
            <div className="relative"><input type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} placeholder="Min. 8 characters" className={`${input} pr-10`} data-testid="signup-password" autoComplete="new-password" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 accent-violet-600" data-testid="signup-terms" />
            I agree to the <Link to="/terms" className="text-violet-600 underline">Terms</Link> & <Link to="/privacy-policy" className="text-violet-600 underline">Privacy Policy</Link>
          </label>
          <button type="submit" disabled={loading} className={primaryBtn} data-testid="signup-submit">{loading && <Loader2 className="w-4 h-4 animate-spin" />}Create Account <ArrowRight className="w-4 h-4" /></button>
          <p className="text-center text-sm text-slate-600">Already have an account? <button type="button" onClick={() => setTab('signin')} className="text-violet-600 font-semibold">Sign In</button></p>
        </form>
      )}

      <div className="flex items-center gap-3 my-4"><span className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-500 uppercase">or continue with</span><span className="flex-1 h-px bg-slate-200" /></div>
      <button type="button" onClick={() => oauth('google')} className="w-full h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-slate-50" data-testid="oauth-google">
        <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
        Continue with Google
      </button>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <button type="button" onClick={() => oauth('facebook')} className="h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50" data-testid="oauth-facebook" aria-label="Facebook"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" /></svg></button>
        <button type="button" onClick={() => oauth('twitter')} className="h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50" data-testid="oauth-x" aria-label="X"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="#111"><path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9zm-1.3 19.5h2L6.5 3.2H4.3l13.3 17.5z" /></svg></button>
        <button type="button" onClick={() => oauth('linkedin_oidc')} className="h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50" data-testid="oauth-linkedin" aria-label="LinkedIn"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" /></svg></button>
      </div>
    </div>
  );
};

export default AuthCard;

import { Suspense, lazy, useState, useEffect, useRef, useMemo, startTransition, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyProvider } from "@/hooks/useCurrency";
import type { Session, User } from "@supabase/supabase-js";
import { AuthProvider, useAuth } from "@/context/auth";

// Lazy load all page components for code splitting
const DashboardSidebar = lazy(() => import("@/components/DashboardSidebar"));
const DashboardPageLayout = lazy(() => import("@/components/DashboardPageLayout"));
const OnboardingFlow = lazy(() => import("./components/onboarding/OnboardingFlow"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AvatarPage = lazy(() => import("./pages/AvatarPage"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const VirtualCollaborationPage = lazy(() => import("./components/VirtualCollaborationPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SocialLinksPage = lazy(() => import("./pages/SocialLinksPage"));
const EnhancedCreatePostModal = lazy(() => import("./components/EnhancedCreatePostModal"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const UsernameRedirect = lazy(() => import("./components/UsernameRedirect"));
const FollowersPage = lazy(() => import("./pages/FollowersPage"));
const AITrainingDashboard = lazy(() => import("./components/AITrainingDashboard"));
const PromoSettingsPage = lazy(() => import("./pages/PromoSettingsPage"));
const SuperAdminPage = lazy(() => import("./pages/SuperAdminPage"));
const BuyTokensPage = lazy(() => import("./pages/BuyTokensPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const EarningsPage = lazy(() => import("./pages/EarningsPage"));
const PricingPage = lazy(() => import("./components/PricingPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const RefundPolicyPage = lazy(() => import("./pages/RefundPolicyPage"));

// Stable QueryClient outside component — never recreated
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 0,
    },
  },
});

// ─── Loading overlay (fixed, always in DOM, fades out when content is ready) ─────
// This eliminates the white flash at the end of loading
const LoadingOverlay = memo(({ visible }: { visible: boolean }) => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background pointer-events-none"
    style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.35s ease-out',
      visibility: visible ? 'visible' : 'hidden',
    }}
  >
    {/* Brand logo + spinning ring */}
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
      <div
        className="absolute inset-[-6px] rounded-full border border-purple-400/20 animate-spin"
        style={{ animationDuration: '3s', animationDirection: 'reverse' }}
      />
      <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="7" y="8" width="10" height="9" rx="1.5" fill="white" opacity="0.95"/>
          <circle cx="10" cy="11" r="0.8" fill="#3b82f6"/>
          <circle cx="14" cy="11" r="0.8" fill="#3b82f6"/>
          <rect x="10.5" y="14" width="3" height="0.6" rx="0.3" fill="#3b82f6"/>
          <circle cx="12" cy="6.5" r="1" fill="white" opacity="0.95"/>
          <rect x="11.5" y="6.5" width="1" height="1.5" fill="white" opacity="0.95"/>
          <circle cx="18" cy="4" r="2" fill="#fde047"/>
        </svg>
      </div>
    </div>
    {/* Speed progress bar */}
    <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-400 to-indigo-500"
        style={{ animation: 'appSpeedBar 1.6s ease-in-out infinite' }}
      />
    </div>
    <style>{`
      @keyframes appSpeedBar {
        0%   { width: 0%;   margin-left: 0%;    opacity: 1; }
        65%  { width: 85%;  margin-left: 5%;    opacity: 1; }
        90%  { width: 12%;  margin-left: 88%;   opacity: 0.5; }
        100% { width: 0%;   margin-left: 100%;  opacity: 0; }
      }
    `}</style>
  </div>
));
LoadingOverlay.displayName = 'LoadingOverlay';

// ─── Thin top-bar fallback for Suspense boundaries (lazy route loading) ──────────
const PageFallback = memo(() => (
  <div
    className="fixed top-0 left-0 right-0 z-50 h-0.5 overflow-hidden"
    style={{ background: 'transparent' }}
  >
    <div
      className="h-full bg-gradient-to-r from-blue-500 via-purple-400 to-indigo-500"
      style={{ animation: 'topBarSweep 1.2s ease-in-out infinite', width: '40%' }}
    />
    <style>{`
      @keyframes topBarSweep {
        0%   { margin-left: -40%; }
        100% { margin-left: 140%; }
      }
    `}</style>
  </div>
));
PageFallback.displayName = 'PageFallback';

const ProfileFallback = memo(() => (
  <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
    <div
      className="h-full bg-gradient-to-r from-blue-500 via-purple-400 to-indigo-500"
      style={{ animation: 'topBarSweep 1.2s ease-in-out infinite', width: '40%' }}
    />
  </div>
));
ProfileFallback.displayName = 'ProfileFallback';

// ─── Authenticated Routes ─────────────────────────────────────────────────────────
// All volatile state (sidebar, mobile) lives here — NOT in App
// This prevents re-rendering App and the entire tree on sidebar toggle
const AuthenticatedRoutes = memo(() => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const isMobile = useIsMobile();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('is_completed, completed_steps, skipped_steps')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) { setNeedsOnboarding(false); return; }
        if (!data) { setNeedsOnboarding(true); return; }
        const completedSteps = (data.completed_steps as string[]) || [];
        const skippedSteps = (data.skipped_steps as string[]) || [];
        setNeedsOnboarding(!data.is_completed && completedSteps.length === 0 && skippedSteps.length === 0);
      } catch {
        setNeedsOnboarding(false);
      }
    };
    checkOnboarding();
  }, [user?.id]);  // Only re-run when user ID changes (not when user object reference changes)

  if (needsOnboarding === null) return <PageFallback />;

  return (
    <>
      {needsOnboarding && window.location.pathname.startsWith('/settings') && (
        <OnboardingFlow isOpen={true} onClose={() => setNeedsOnboarding(false)} />
      )}
      <SidebarProvider
        defaultOpen={!isMobile}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      >
        <div className="flex min-h-screen w-full bg-background">
          <Suspense fallback={null}>
            <DashboardSidebar onCreatePost={() => setIsCreatePostOpen(true)} />
          </Suspense>
          <main className="flex-1 min-w-0 transition-all duration-200 bg-background">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/settings/dashboard" replace />} />
                <Route path="/onboarding" element={<Navigate to="/settings/dashboard" replace />} />
                <Route path="/settings/dashboard" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><Index mode="authed" /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/avatar" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><AvatarPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/virtual-collaboration" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><VirtualCollaborationPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/products" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><ProductsPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/promo" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><PromoSettingsPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/account" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><SettingsPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/social-links" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><SocialLinksPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/feed" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><FeedPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/followers" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><FollowersPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/ai-training" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><AITrainingDashboard /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/analytics" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><AnalyticsPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/earnings" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><EarningsPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/super-admin" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><SuperAdminPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/buy-tokens" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><BuyTokensPage /></DashboardPageLayout></Suspense>} />
                <Route path="/pricing" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><PricingPage /></DashboardPageLayout></Suspense>} />
                <Route path="/settings/notifications" element={<Suspense fallback={<PageFallback />}><DashboardPageLayout><Index mode="authed" /></DashboardPageLayout></Suspense>} />
                <Route path="/:username" element={<Suspense fallback={<ProfileFallback />}><UsernameRedirect /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </SidebarProvider>
      <Suspense fallback={null}>
        <EnhancedCreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
        />
      </Suspense>
    </>
  );
});
AuthenticatedRoutes.displayName = 'AuthenticatedRoutes';

// ─── Public Routes ────────────────────────────────────────────────────────────────
const PublicRoutes = memo(() => (
  <SidebarProvider defaultOpen={false}>
    <div className="min-h-screen w-full bg-background">
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Index mode="public" />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/:username" element={<Suspense fallback={<ProfileFallback />}><UsernameRedirect /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  </SidebarProvider>
));
PublicRoutes.displayName = 'PublicRoutes';

// ─── Root App ─────────────────────────────────────────────────────────────────────
// App ONLY owns auth state — nothing else
// Moving sidebar/mobile state to AuthenticatedRoutes prevents full-tree re-renders
const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  // Show loading overlay until content is fully painted
  const [overlayVisible, setOverlayVisible] = useState(true);

  // Stable refs prevent stale closures in async callbacks
  const currentUserIdRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Only listen for genuine login/logout transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      // Skip all automatic/background events
      if (
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "MFA_CHALLENGE_VERIFIED"
      ) return;
      // Guard against race with getSession()
      if (!initialLoadDoneRef.current) return;

      const nextUserId = nextSession?.user?.id ?? null;
      // ONLY update when the user identity actually changes (login ↔ logout)
      // This prevents spurious full-tree re-renders from Supabase internals
      if (nextUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = nextUserId;
        // Use startTransition so React can batch this with other updates
        startTransition(() => {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
        });
      }
    });

    // Single source of truth for initial auth state
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        currentUserIdRef.current = initialSession?.user?.id ?? null;
        initialLoadDoneRef.current = true;
        // startTransition: marks as non-urgent — React renders current frame first
        startTransition(() => {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setIsReady(true);
        });
      })
      .catch(() => {
        if (!mounted) return;
        initialLoadDoneRef.current = true;
        startTransition(() => setIsReady(true));
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fade out the loading overlay AFTER content has had one frame to paint
  // This prevents the white flash between loader and content
  useEffect(() => {
    if (!isReady) return;
    // Give React one rAF to paint the content, then fade out overlay
    const raf = requestAnimationFrame(() => {
      const timer = setTimeout(() => setOverlayVisible(false), 50);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, [isReady]);

  // Memoize context value — prevents all useAuth() consumers from re-rendering
  // when App re-renders for unrelated reasons
  const authValue = useMemo(
    () => ({ user, session, isReady }),
    [user?.id, session?.access_token, isReady]  // Use primitives, not objects
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider value={authValue}>
                {/* Loading overlay — always in DOM, fades out instead of unmounting */}
                {/* This prevents white flash at end of loading */}
                <LoadingOverlay visible={overlayVisible} />

                {/* Content renders even while overlay is visible */}
                {/* React paints content underneath, then we fade the overlay away */}
                {isReady && (
                  user ? <AuthenticatedRoutes /> : <PublicRoutes />
                )}
              </AuthProvider>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
};

export default App;

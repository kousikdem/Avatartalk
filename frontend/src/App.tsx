import React, { Suspense, lazy, useState, useEffect, useLayoutEffect, useRef, useMemo, startTransition, memo, Component } from "react";

// ─── Profile-specific Error Boundary ───────────────────────────────────────────
// Catches any render error from ProfilePage/ChangeableAvatarPreview so it never
// reaches the top-level ErrorBoundary in main.tsx.
class ProfileErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e: Error) {
    console.warn('[ProfileErrorBoundary] Non-fatal:', e?.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-2xl">👤</div>
            <h2 className="text-white text-xl font-semibold mb-2">Profile temporarily unavailable</h2>
            <p className="text-slate-400 text-sm mb-5">This profile couldn't load. Please try again.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
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
import { LoadingTimeout } from "@/components/LoadingTimeout";
import { getCachedAuth, setCachedAuth, clearAuthCache } from "@/utils/authCache";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.08 });

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
const DatabaseTestPage = lazy(() => import("./components/DatabaseTestPage"));

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

// ─── Thin top-bar fallback for lazy route loading ───────────────────────────────
const PageFallback = memo(() => {
  useEffect(() => {
    NProgress.start();
    return () => NProgress.done();
  }, []);

  return null;
});
PageFallback.displayName = 'PageFallback';

const ProfileFallback = memo(() => {
  useEffect(() => {
    NProgress.start();
    return () => NProgress.done();
  }, []);

  return null;
});
ProfileFallback.displayName = 'ProfileFallback';

// ─── Authenticated Routes ────────────────────────────────────────────────────────
const AuthenticatedRoutes = memo(() => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const isMobile = useIsMobile();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!user) return;

    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('is_completed, completed_steps, skipped_steps')
          .eq('user_id', user.id)
          .abortSignal(controller.signal)
          .maybeSingle();

        if (controller.signal.aborted) return;

        if (error) { 
          setNeedsOnboarding(false); 
          return; 
        }
        if (!data) { 
          setNeedsOnboarding(true); 
          return; 
        }
        const completedSteps = (data.completed_steps as string[]) || [];
        const skippedSteps = (data.skipped_steps as string[]) || [];
        setNeedsOnboarding(!data.is_completed && completedSteps.length === 0 && skippedSteps.length === 0);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Onboarding check failed:', err);
        setNeedsOnboarding(false);
      }
    };

    checkOnboarding();

    return () => {
      controller.abort();
    };
  }, [user?.id]);

  if (needsOnboarding === null) {
    // Don't block rendering — onboarding popup will show on top once check completes
    // This prevents the blank-page flash while onboarding status is being fetched
  }

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
                <Route path="/:username" element={<ProfileErrorBoundary><Suspense fallback={<ProfileFallback />}><UsernameRedirect /></Suspense></ProfileErrorBoundary>} />
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

// ─── Public Routes ───────────────────────────────────────────────────────────────
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
          <Route path="/db-test" element={<DatabaseTestPage />} />
          <Route path="/:username" element={<ProfileErrorBoundary><Suspense fallback={<ProfileFallback />}><UsernameRedirect /></Suspense></ProfileErrorBoundary>} />
          {/* Protected routes — bounce unauthenticated visitors to the home page with auth modal */}
          <Route path="/settings/*" element={<Navigate to="/?auth=login" replace />} />
          <Route path="/onboarding" element={<Navigate to="/?auth=login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  </SidebarProvider>
));
PublicRoutes.displayName = 'PublicRoutes';

// ─── Root App ────────────────────────────────────────────────────────────────────
const App = () => {
  // ── Lazy-initialize from localStorage cache so the UI renders on the FIRST
  //    React paint — no loading spinner on return visits.
  const [session, setSession] = useState<Session | null>(() => {
    try { return getCachedAuth()?.session ?? null; } catch { return null; }
  });
  const [user, setUser] = useState<User | null>(() => {
    try { return getCachedAuth()?.user ?? null; } catch { return null; }
  });
  const [authChecked, setAuthChecked] = useState<boolean>(() => {
    try { return getCachedAuth()?.user != null; } catch { return false; }
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try { return getCachedAuth()?.user == null; } catch { return true; }
  });

  const currentUserIdRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    const abortController = new AbortController();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mountedRef.current) return;

      // Skip background events
      if (
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "MFA_CHALLENGE_VERIFIED"
      ) return;

      if (!initialLoadDoneRef.current) return;

      const nextUserId = nextSession?.user?.id ?? null;
      
      // Only update when user identity actually changes
      if (nextUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = nextUserId;
        
        startTransition(() => {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          
          // Update cache
          if (nextSession?.user) {
            setCachedAuth(nextSession.user, nextSession);
          } else {
            clearAuthCache();
          }
        });
      }
    });

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (abortController.signal.aborted || !mountedRef.current) return;

        if (error) throw error;

        currentUserIdRef.current = initialSession?.user?.id ?? null;
        initialLoadDoneRef.current = true;

        startTransition(() => {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setAuthChecked(true);  // Auth check complete
          setIsLoading(false);

          // Cache or clear the auth state
          if (initialSession?.user) {
            setCachedAuth(initialSession.user, initialSession);
          } else {
            clearAuthCache();  // Session expired — clear stale cache
          }
        });
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mountedRef.current) {
          initialLoadDoneRef.current = true;
          setAuthChecked(true);
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mountedRef.current = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  // Notify the inline #app-loader in index.html so it fades out when auth check completes
  // useLayoutEffect runs synchronously after DOM mutations — fires faster than useEffect
  // so the HTML loader hides in the same paint cycle as the app content appearing.
  useLayoutEffect(() => {
    if (!authChecked) return;

    const w = window as unknown as { __REACT_MOUNTED__?: () => void };
    if (typeof w.__REACT_MOUNTED__ === "function") {
      w.__REACT_MOUNTED__();
    } else {
      document.body.classList.add("app-loaded");
    }
  }, [authChecked]);

  // Memoize auth context value
  const authValue = useMemo(
    () => ({ user, session, isReady: authChecked }),
    [user?.id, session?.access_token, authChecked]
  );

  // Retry function for loading timeout
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider value={authValue}>
                {/* Loading timeout */}
                <LoadingTimeout
                  isLoading={isLoading}
                  timeout={20000}
                  onRetry={handleRetry}
                  message="Taking longer than expected. Please check your internet connection."
                />

                {/* Content - only render after auth is checked */}
                {authChecked && (
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

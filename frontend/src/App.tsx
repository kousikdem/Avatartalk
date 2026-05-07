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

// ─── Loading overlay with progress bar ──────────────────────────────────────────
const LoadingOverlay = memo(({ visible }: { visible: boolean }) => {
  useEffect(() => {
    if (visible) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [visible]);

  return (
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
      {/* Loading text */}
      <div className="text-sm text-muted-foreground animate-pulse">
        Loading AvatarTalk...
      </div>
    </div>
  );
});
LoadingOverlay.displayName = 'LoadingOverlay';

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
          <Route path="/:username" element={<Suspense fallback={<ProfileFallback />}><UsernameRedirect /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  </SidebarProvider>
));
PublicRoutes.displayName = 'PublicRoutes';

// ─── Root App ────────────────────────────────────────────────────────────────────
const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);  // NEW: Auth check flag
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserIdRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);
  const mountedRef = useRef(true);

  // Load cached auth state immediately on mount
  useEffect(() => {
    const cached = getCachedAuth();
    if (cached && cached.user) {
      console.log('✅ Loading from auth cache');
      setUser(cached.user);
      setSession(cached.session);
      currentUserIdRef.current = cached.user?.id || null;
    }
  }, []);

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

          // Cache the auth state
          if (initialSession?.user) {
            setCachedAuth(initialSession.user, initialSession);
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

  // Fade out loading overlay after auth is ready
  useEffect(() => {
    if (!authChecked) return;

    // Notify the inline #app-loader in index.html so it fades out (it has z-index:9999
    // and otherwise covers the whole site even after React mounts)
    const w = window as unknown as { __REACT_MOUNTED__?: () => void };
    if (typeof w.__REACT_MOUNTED__ === "function") {
      w.__REACT_MOUNTED__();
    } else {
      document.body.classList.add("app-loaded");
    }

    const raf = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setOverlayVisible(false);
      }, 100);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
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
                {/* Loading overlay */}
                <LoadingOverlay visible={overlayVisible} />

                {/* Loading timeout */}
                <LoadingTimeout
                  isLoading={isLoading}
                  timeout={8000}
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

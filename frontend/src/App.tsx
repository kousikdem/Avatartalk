import { Suspense, lazy, useState, useEffect, useRef, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyProvider } from "@/hooks/useCurrency";
// Skeleton imports removed - instant loading without skeletons
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

// Optimized QueryClient with aggressive caching for faster loads
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - longer cache
      gcTime: 1000 * 60 * 60, // 1 hour cache retention
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount for faster navigation
      retry: 0, // No retries for faster failure handling
    },
  },
});

// Minimal loading fallback with smooth progress speed animation
const PageFallback = memo(() => (
  <div className="fixed top-0 left-0 right-0 z-50">
    <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 animate-[progress_1.2s_ease-in-out_infinite]" 
         style={{
           backgroundSize: '200% 100%',
           animation: 'shimmerProgress 1.2s ease-in-out infinite'
         }} />
  </div>
));
PageFallback.displayName = 'PageFallback';

const ProfileFallback = memo(() => (
  <div className="fixed top-0 left-0 right-0 z-50">
    <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
         style={{ animation: 'shimmerProgress 1.2s ease-in-out infinite', backgroundSize: '200% 100%' }} />
  </div>
));
ProfileFallback.displayName = 'ProfileFallback';

// Minimal app loading - shows a centered progress animation
const AppLoadingScreen = memo(() => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
    <div className="relative w-16 h-16">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
      {/* Inner pulsing logo */}
      <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/30">
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
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-400 to-indigo-500 rounded-full"
           style={{ animation: 'speedProgress 1.5s ease-in-out infinite' }} />
    </div>
    <style>{`
      @keyframes speedProgress {
        0% { width: 0%; transform: translateX(0); opacity: 1; }
        70% { width: 100%; transform: translateX(0); opacity: 1; }
        100% { width: 100%; transform: translateX(100%); opacity: 0; }
      }
      @keyframes shimmerProgress {
        0% { background-position: 200% 0; opacity: 0.6; }
        50% { background-position: 0% 0; opacity: 1; }
        100% { background-position: -200% 0; opacity: 0.6; }
      }
    `}</style>
  </div>
));
AppLoadingScreen.displayName = 'AppLoadingScreen';

// Memoized authenticated routes
const AuthenticatedRoutes = memo(({ 
  sidebarOpen, 
  setSidebarOpen, 
  setIsCreatePostOpen, 
  isMobile 
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setIsCreatePostOpen: (open: boolean) => void;
  isMobile: boolean;
}) => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const { user } = useAuth();
  const location = window.location.pathname;

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('is_completed, completed_steps, skipped_steps')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setNeedsOnboarding(false);
        } else if (!data) {
          // No record = truly first-time user
          setNeedsOnboarding(true);
        } else {
          // Only auto-open for users who have NEVER interacted with onboarding
          const completedSteps = (data.completed_steps as string[]) || [];
          const skippedSteps = (data.skipped_steps as string[]) || [];
          const hasNeverInteracted = completedSteps.length === 0 && skippedSteps.length === 0;
          setNeedsOnboarding(!data.is_completed && hasNeverInteracted);
        }
      } catch {
        setNeedsOnboarding(false);
      }
    };

    checkOnboarding();
  }, [user]);

  // Still checking
  if (needsOnboarding === null) {
    return <PageFallback />;
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
              <Route path="/settings/dashboard" element={
                <Suspense fallback={<PageFallback />}>
                   <DashboardPageLayout><Index mode="authed" /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/avatar" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><AvatarPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/virtual-collaboration" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><VirtualCollaborationPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/products" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><ProductsPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/promo" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><PromoSettingsPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/account" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><SettingsPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/social-links" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><SocialLinksPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/feed" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><FeedPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/followers" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><FollowersPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/ai-training" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><AITrainingDashboard /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/analytics" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><AnalyticsPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/earnings" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><EarningsPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/super-admin" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><SuperAdminPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/buy-tokens" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><BuyTokensPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/pricing" element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPageLayout><PricingPage /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/settings/notifications" element={
                <Suspense fallback={<PageFallback />}>
                   <DashboardPageLayout><Index mode="authed" /></DashboardPageLayout>
                </Suspense>
              } />
              <Route path="/:username" element={
                <Suspense fallback={<ProfileFallback />}>
                  <UsernameRedirect />
                </Suspense>
              } />
              <Route path="*" element={
                <Suspense fallback={<PageFallback />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
    </>
  );
});

AuthenticatedRoutes.displayName = 'AuthenticatedRoutes';

// Memoized public routes
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
          <Route path="/:username" element={
            <Suspense fallback={<ProfileFallback />}>
              <UsernameRedirect />
            </Suspense>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  </SidebarProvider>
));

PublicRoutes.displayName = 'PublicRoutes';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isMobile = useIsMobile();

  // Refs to track current values inside callbacks without stale closure
  const currentUserIdRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Listen for post-init auth changes only (SIGNED_IN from OAuth, SIGNED_OUT from logout)
    // INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED are handled elsewhere or ignored
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      // Ignore events that don't represent real user login/logout transitions
      if (
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "MFA_CHALLENGE_VERIFIED"
      ) return;
      // Only process AFTER initial getSession() completes to prevent race condition
      if (!initialLoadDoneRef.current) return;

      const nextUserId = nextSession?.user?.id ?? null;

      // KEY FIX: Only update state if the user identity actually changed
      // This prevents spurious re-renders from token refresh side-effects
      if (nextUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = nextUserId;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      }
    });

    // Primary auth hydration — single source of truth for initial state
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        const userId = initialSession?.user?.id ?? null;
        currentUserIdRef.current = userId;
        initialLoadDoneRef.current = true;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        initialLoadDoneRef.current = true;
        setIsReady(true);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider value={{ user, session, isReady }}>
                {isReady ? (
                  user ? (
                    <>
                      <AuthenticatedRoutes
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        setIsCreatePostOpen={setIsCreatePostOpen}
                        isMobile={isMobile}
                      />
                      <Suspense fallback={null}>
                        <EnhancedCreatePostModal 
                          isOpen={isCreatePostOpen}
                          onClose={() => setIsCreatePostOpen(false)}
                        />
                      </Suspense>
                    </>
                  ) : (
                    <PublicRoutes />
                  )
                ) : (
                  <AppLoadingScreen />
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

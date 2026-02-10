import { Suspense, lazy, useState, useEffect, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { DashboardPageSkeleton, ProfileSkeleton, FastLoadingScreen } from "@/components/ui/fast-loading";
import type { Session, User } from "@supabase/supabase-js";
import { AuthProvider, useAuth } from "@/context/auth";

// Lazy load all page components for code splitting
const DashboardSidebar = lazy(() => import("@/components/DashboardSidebar"));
const DashboardPageLayout = lazy(() => import("@/components/DashboardPageLayout"));
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
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
const PricingPage = lazy(() => import("./components/PricingPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const RefundPolicyPage = lazy(() => import("./pages/RefundPolicyPage"));

// Optimized QueryClient with aggressive caching for faster loads
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes - serve cached data instantly
      gcTime: 1000 * 60 * 60, // 1 hour cache retention
      refetchOnWindowFocus: false,
      refetchOnMount: 'always', // Always mount but serve stale cache first (no blocking)
      retry: 1, // Single retry for transient failures
      networkMode: 'offlineFirst', // Show cached data immediately, refetch in background
    },
  },
});

// Minimal loading fallback
const PageFallback = memo(() => <DashboardPageSkeleton showStats showTabs />);
PageFallback.displayName = 'PageFallback';

const ProfileFallback = memo(() => <ProfileSkeleton />);
ProfileFallback.displayName = 'ProfileFallback';

// Minimal app loading - just shows instantly with no animation delay
const AppLoadingScreen = memo(() => (
  <div className="min-h-screen bg-background" />
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
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setNeedsOnboarding(false);
        } else if (!data) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(!data.is_completed);
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
    {needsOnboarding && !window.location.pathname.match(/^\/[^/]+$/) && (
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

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes (sync callback only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event === "INITIAL_SESSION") return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    // Fast local session hydrate (no UI blocking beyond initial empty screen)
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsReady(true);

        // Server-side verification (Auth API) in background to ensure token is valid
        if (initialSession) {
          supabase.auth.getUser().then(({ data, error }) => {
            if (!mounted) return;
            if (error || !data.user) {
              // If token is invalid/expired, force clean state
              supabase.auth.signOut();
            }
          });
        }
      })
      .catch(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show empty screen only during initial load
  if (!isReady) {
    return <AppLoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider value={{ user, session, isReady }}>
                {user ? (
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

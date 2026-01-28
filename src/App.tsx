import { Suspense, lazy, useState, useEffect, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { DashboardPageSkeleton, ProfileSkeleton, FastLoadingScreen } from "@/components/ui/fast-loading";

// Lazy load all page components for code splitting
const DashboardSidebar = lazy(() => import("@/components/DashboardSidebar"));
const DashboardPageLayout = lazy(() => import("@/components/DashboardPageLayout"));
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
      staleTime: 1000 * 60 * 10, // 10 minutes - longer cache
      gcTime: 1000 * 60 * 60, // 1 hour cache retention
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount for faster navigation
      retry: 0, // No retries for faster failure handling
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
}) => (
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
            <Route path="/settings/dashboard" element={
              <Suspense fallback={<PageFallback />}>
                <DashboardPageLayout><Index /></DashboardPageLayout>
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
                <DashboardPageLayout><Index /></DashboardPageLayout>
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
));

AuthenticatedRoutes.displayName = 'AuthenticatedRoutes';

// Memoized public routes
const PublicRoutes = memo(() => (
  <SidebarProvider defaultOpen={false}>
    <div className="min-h-screen w-full bg-background">
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Ultra-fast session check - no await, immediate response
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fast redirect for authenticated users
  useEffect(() => {
    if (!loading && user && window.location.pathname === '/') {
      window.location.href = '/settings/dashboard';
    }
  }, [loading, user]);

  if (loading) {
    return <AppLoadingScreen />;
  }

  // Prevent flash during redirect
  if (user && window.location.pathname === '/') {
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
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
};

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardPageLayout from "@/components/DashboardPageLayout";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AvatarPage from "./pages/AvatarPage";
import FeedPage from "./pages/FeedPage";
import VirtualCollaborationPage from "./components/VirtualCollaborationPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import SocialLinksPage from "./pages/SocialLinksPage";
import EnhancedCreatePostModal from "./components/EnhancedCreatePostModal";  
import ProfilePage from "./components/ProfilePage";
import UsernameRedirect from "./components/UsernameRedirect";
import FollowersPage from "./pages/FollowersPage";
import AITrainingDashboard from "./components/AITrainingDashboard";
import PromoSettingsPage from "./pages/PromoSettingsPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import BuyTokensPage from "./pages/BuyTokensPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PricingPage from "./components/PricingPage";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyProvider } from "@/hooks/useCurrency";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect authenticated users to dashboard
  const shouldRedirectToDashboard = () => {
    if (loading) return false;
    if (user && window.location.pathname === '/') {
      return true;
    }
    return false;
  };

  if (shouldRedirectToDashboard()) {
    window.location.href = '/settings/dashboard';
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // For authenticated users, always show dashboard with sidebar
  if (user) {
    return (
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-white text-black">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SidebarProvider 
                  defaultOpen={!isMobile}
                  open={sidebarOpen}
                  onOpenChange={setSidebarOpen}
                >
                  <div className="flex min-h-screen w-full bg-white">
                    <DashboardSidebar onCreatePost={() => setIsCreatePostOpen(true)} />
                    
                    <main className="flex-1 min-w-0 transition-all duration-300 bg-white">
                      <Routes>
                        <Route path="/settings/dashboard" element={<DashboardPageLayout><Index /></DashboardPageLayout>} />
                        <Route path="/settings/avatar" element={<DashboardPageLayout><AvatarPage /></DashboardPageLayout>} />
                        <Route path="/settings/virtual-collaboration" element={<DashboardPageLayout><VirtualCollaborationPage /></DashboardPageLayout>} />
                        <Route path="/settings/products" element={<DashboardPageLayout><ProductsPage /></DashboardPageLayout>} />
                        <Route path="/settings/promo" element={<DashboardPageLayout><PromoSettingsPage /></DashboardPageLayout>} />
                        <Route path="/settings/account" element={<DashboardPageLayout><SettingsPage /></DashboardPageLayout>} />
                        <Route path="/settings/social-links" element={<DashboardPageLayout><SocialLinksPage /></DashboardPageLayout>} />
                        <Route path="/settings/feed" element={<DashboardPageLayout><FeedPage /></DashboardPageLayout>} />
                        <Route path="/settings/followers" element={<DashboardPageLayout><FollowersPage /></DashboardPageLayout>} />
                        <Route path="/settings/ai-training" element={<DashboardPageLayout><AITrainingDashboard /></DashboardPageLayout>} />
                        <Route path="/settings/analytics" element={<DashboardPageLayout><AnalyticsPage /></DashboardPageLayout>} />
                        <Route path="/settings/super-admin" element={<DashboardPageLayout><SuperAdminPage /></DashboardPageLayout>} />
                        <Route path="/settings/buy-tokens" element={<DashboardPageLayout><BuyTokensPage /></DashboardPageLayout>} />
                        <Route path="/pricing" element={<DashboardPageLayout><PricingPage /></DashboardPageLayout>} />
                        <Route path="/settings/notifications" element={<DashboardPageLayout><Index /></DashboardPageLayout>} />
                        <Route path="/:username" element={<UsernameRedirect />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>

                    <EnhancedCreatePostModal 
                      isOpen={isCreatePostOpen}
                      onClose={() => setIsCreatePostOpen(false)}
                    />
                  </div>
                </SidebarProvider>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    );
  }

  // For non-authenticated users, show landing page without sidebar
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-white text-black">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen w-full bg-white">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/:username" element={<UsernameRedirect />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
};

export default App;

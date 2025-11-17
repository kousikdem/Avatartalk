
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AvatarPage from "./pages/AvatarPage";
import FeedPage from "./pages/FeedPage";
import CalendarPage from "./components/CalendarPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import SocialLinksPage from "./pages/SocialLinksPage";
import CreatePostModal from "./components/CreatePostModal";  
import ProfilePage from "./components/ProfilePage";
import UsernameRedirect from "./components/UsernameRedirect";
import FollowersPage from "./pages/FollowersPage";
import { supabase } from "@/integrations/supabase/client";

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
                      <Route path="/settings/dashboard" element={<Index />} />
                      <Route path="/settings/avatar" element={<AvatarPage />} />
                      <Route path="/settings/calendar" element={<CalendarPage />} />
                      <Route path="/settings/products" element={<ProductsPage />} />
                      <Route path="/settings/account" element={<SettingsPage />} />
                      <Route path="/settings/social-links" element={<SocialLinksPage />} />
                      <Route path="/settings/feed" element={<FeedPage />} />
                      <Route path="/settings/followers" element={<FollowersPage />} />
                      <Route path="/:username" element={<UsernameRedirect />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>

                  <CreatePostModal 
                    isOpen={isCreatePostOpen}
                    onClose={() => setIsCreatePostOpen(false)}
                  />
                </div>
              </SidebarProvider>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // For non-authenticated users, show landing page without sidebar
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-white text-black">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen w-full bg-white">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/:username" element={<UsernameRedirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

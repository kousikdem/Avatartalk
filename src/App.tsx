
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./components/DashboardSidebar";
import CreatePostModal from "./components/CreatePostModal";
import Index from "./pages/Index";
import ProfilePage from "./components/ProfilePage";
import AiTraining from "./components/AiTraining";
import Dashboard from "./components/Dashboard";
import CalendarPage from "./components/CalendarPage";
import NotificationsPage from "./components/NotificationsPage";
import FollowersPage from "./components/FollowersPage";
import NotFound from "./pages/NotFound";
import AvatarPage from "./pages/AvatarPage";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

// Global Layout wrapper component that includes sidebar only for dashboard pages
const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if current path requires sidebar (dashboard routes)
  const currentPath = window.location.pathname;
  const isDashboardRoute = ['/dashboard', '/avatar', '/calendar', '/notifications', '/followers', '/profiles', '/feed', '/analytics', '/bookmarks', '/settings', '/ai-training'].includes(currentPath);
  
  // Also check for query parameters that indicate dashboard view
  const urlParams = new URLSearchParams(window.location.search);
  const isDashboardView = urlParams.get('view') === 'dashboard';

  // Show sidebar only for authenticated users on dashboard routes OR dashboard view
  if (!user || (!isDashboardRoute && !isDashboardView)) {
    return (
      <div className="min-h-screen w-full bg-background">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar onCreatePost={() => setIsCreatePostOpen(true)} />
        
        <SidebarInset className="flex-1 w-full min-w-0 bg-background">
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-3 sm:gap-4 border-b border-border px-4 sm:px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-50 w-full">
            <SidebarTrigger className="h-8 w-8 p-1.5 hover:bg-accent rounded-md transition-colors" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                {currentPath === '/dashboard' && 'Dashboard'}
                {currentPath === '/avatar' && 'Avatar'}
                {currentPath === '/calendar' && 'Calendar'}
                {currentPath === '/notifications' && 'Notifications'}
                {currentPath === '/followers' && 'Followers'}
                {currentPath === '/profiles' && 'Browse Profiles'}
                {currentPath === '/feed' && 'Feed'}
                {currentPath === '/analytics' && 'Analytics'}
                {currentPath === '/bookmarks' && 'Bookmarks'}
                {currentPath === '/settings' && 'Settings'}
                {currentPath === '/ai-training' && 'AI Training'}
              </h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto w-full bg-background">
            <div className="w-full max-w-full p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </SidebarInset>

        <CreatePostModal 
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
        />
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="w-full min-h-screen bg-background">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/train" element={<AiTraining />} />
              <Route path="/:username" element={<ProfilePage />} />
              
              {/* Dashboard routes with sidebar */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/avatar" element={<AvatarPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/followers" element={<FollowersPage />} />
              <Route path="/profiles" element={
                <div className="w-full max-w-7xl mx-auto">
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Browse Profiles</h1>
                    <p className="text-muted-foreground">Discover amazing AI avatars and connect with their creators</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {['fosik', 'emily', 'alex', 'sarah', 'john', 'demo'].map((username) => (
                      <div key={username} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/20">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">{username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">@{username}</h3>
                            <p className="text-sm text-muted-foreground">AI Avatar</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Visit this profile to see their content and interact with their AI avatar</p>
                        <a 
                          href={`/${username}`} 
                          className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          View Profile
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              } />
              <Route path="/feed" element={
                <div className="w-full max-w-4xl mx-auto">
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Feed</h1>
                    <p className="text-muted-foreground">Stay updated with the latest from your network</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Your Social Feed</h3>
                    <p className="text-muted-foreground">Your social feed will be displayed here once you start following other users.</p>
                  </div>
                </div>
              } />
              <Route path="/analytics" element={
                <div className="w-full max-w-6xl mx-auto">
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Analytics</h1>
                    <p className="text-muted-foreground">Track your avatar's performance and engagement</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Engagement Overview</h3>
                      <p className="text-muted-foreground text-sm">Your analytics data will be displayed here.</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Performance Metrics</h3>
                      <p className="text-muted-foreground text-sm">Detailed metrics coming soon.</p>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/bookmarks" element={
                <div className="w-full max-w-4xl mx-auto">
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Bookmarks</h1>
                    <p className="text-muted-foreground">Your saved content and favorite interactions</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔖</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Bookmarks Yet</h3>
                    <p className="text-muted-foreground">Your saved bookmarks will appear here when you start saving content.</p>
                  </div>
                </div>
              } />
              <Route path="/settings" element={
                <div className="w-full max-w-4xl mx-auto">
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and preferences</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
                    <p className="text-muted-foreground">Your account settings and preferences will be available here.</p>
                  </div>
                </div>
              } />
              <Route path="/ai-training" element={<AiTraining />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GlobalLayout>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

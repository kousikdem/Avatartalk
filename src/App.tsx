
import React, { useState, useEffect, Suspense } from 'react';
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
import AvatarCreationPage from "./pages/AvatarCreationPage";
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      <div className="min-h-screen w-full bg-white">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-white">
        <DashboardSidebar onCreatePost={() => setIsCreatePostOpen(true)} />
        
        <SidebarInset className="flex-1 w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white sticky top-0 z-50 w-full">
            <SidebarTrigger className="h-8 w-8 p-1" />
          </header>
          
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full max-w-full">
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
      <div className="w-full min-h-screen bg-white">
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
              <Route path="/avatar/create" element={
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                  <AvatarCreationPage />
                </Suspense>
              } />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/followers" element={<FollowersPage />} />
              <Route path="/profiles" element={
                <div className="p-4 md:p-6 w-full">
                  <h1 className="text-2xl font-bold mb-4">Browse Profiles</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['fosik', 'emily', 'alex', 'sarah', 'john', 'demo'].map((username) => (
                      <div key={username} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg mb-2">@{username}</h3>
                        <p className="text-gray-600 text-sm mb-3">Visit this profile to see their content</p>
                        <a 
                          href={`/${username}`} 
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          View Profile
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              } />
              <Route path="/feed" element={
                <div className="p-4 md:p-6 w-full">
                  <h1 className="text-2xl font-bold">Feed</h1>
                  <p className="text-gray-600 mt-2">Your social feed will be displayed here.</p>
                </div>
              } />
              <Route path="/analytics" element={
                <div className="p-4 md:p-6 w-full">
                  <h1 className="text-2xl font-bold">Analytics</h1>
                  <p className="text-gray-600 mt-2">Your analytics data will be displayed here.</p>
                </div>
              } />
              <Route path="/bookmarks" element={
                <div className="p-4 md:p-6 w-full">
                  <h1 className="text-2xl font-bold">Bookmarks</h1>
                  <p className="text-gray-600 mt-2">Your saved bookmarks will be displayed here.</p>
                </div>
              } />
              <Route path="/settings" element={
                <div className="p-4 md:p-6 w-full">
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <p className="text-gray-600 mt-2">Your account settings will be displayed here.</p>
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

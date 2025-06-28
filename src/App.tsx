
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
import { useState } from "react";

const queryClient = new QueryClient();

// Dashboard Layout wrapper component
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <DashboardSidebar onCreatePost={() => setIsCreatePostOpen(true)} />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/train" element={
              <DashboardLayout>
                <AiTraining />
              </DashboardLayout>
            } />
            <Route path="/:username" element={<ProfilePage />} />
            
            {/* All dashboard routes with sidebar */}
            <Route path="/dashboard" element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            } />
            <Route path="/calendar" element={
              <DashboardLayout>
                <CalendarPage />
              </DashboardLayout>
            } />
            <Route path="/notifications" element={
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            } />
            <Route path="/followers" element={
              <DashboardLayout>
                <FollowersPage />
              </DashboardLayout>
            } />
            <Route path="/feed" element={
              <DashboardLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Feed</h1>
                  <p className="text-gray-600 mt-2">Your social feed will be displayed here.</p>
                </div>
              </DashboardLayout>
            } />
            <Route path="/analytics" element={
              <DashboardLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Analytics</h1>
                  <p className="text-gray-600 mt-2">Your analytics data will be displayed here.</p>
                </div>
              </DashboardLayout>
            } />
            <Route path="/bookmarks" element={
              <DashboardLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Bookmarks</h1>
                  <p className="text-gray-600 mt-2">Your saved bookmarks will be displayed here.</p>
                </div>
              </DashboardLayout>
            } />
            <Route path="/settings" element={
              <DashboardLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <p className="text-gray-600 mt-2">Your account settings will be displayed here.</p>
                </div>
              </DashboardLayout>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

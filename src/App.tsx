
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AvatarPage from "./pages/AvatarPage";
import CalendarPage from "./components/CalendarPage";
import ProductsPage from "./pages/ProductsPage";
import CreatePostModal from "./components/CreatePostModal";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const isMobile = useIsMobile();

  // Check if we should show sidebar based on URL params or path
  const shouldShowSidebar = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDashboard = urlParams.get('view') === 'dashboard';
    const isDashboardPath = window.location.pathname !== '/' || isDashboard;
    return isDashboardPath;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-white text-black">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {shouldShowSidebar() ? (
              <SidebarProvider 
                defaultOpen={!isMobile}
                open={sidebarOpen}
                onOpenChange={setSidebarOpen}
              >
                <div className="flex min-h-screen w-full bg-white">
                  <DashboardSidebar onCreatePost={() => setIsCreatePostOpen(true)} />
                  
                  <main className="flex-1 min-w-0 transition-all duration-300 bg-white">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/avatar" element={<AvatarPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>

                  <CreatePostModal 
                    isOpen={isCreatePostOpen}
                    onClose={() => setIsCreatePostOpen(false)}
                  />
                </div>
              </SidebarProvider>
            ) : (
              <div className="min-h-screen w-full bg-white">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            )}
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

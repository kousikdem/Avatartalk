
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import DashboardSidebar from '@/components/DashboardSidebar';
import SetupWizard from '@/components/SetupWizard';
import AvatarPage from '@/pages/AvatarPage';

function App() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const queryClient = new QueryClient();

  useEffect(() => {
    const hasCompletedSetup = localStorage.getItem('setupComplete');
    if (!hasCompletedSetup) {
      setIsWizardOpen(true);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<Index />} />
            
            {/* Avatar Creator Page */}
            <Route path="/avatar" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1">
                  <AvatarPage />
                </main>
              </div>
            } />
            
            {/* Dashboard routes - Sidebar is rendered conditionally */}
            <Route
              path="/dashboard"
              element={
                <div className="flex min-h-screen w-full">
                  <DashboardSidebar />
                  <main className="flex-1">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-gray-800">Dashboard Content</h1>
                      <p className="text-gray-600 mt-2">Welcome to your dashboard!</p>
                    </div>
                  </main>
                </div>
              }
            />

            {/* Setup Wizard Route */}
            <Route path="/setup" element={<SetupWizard />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

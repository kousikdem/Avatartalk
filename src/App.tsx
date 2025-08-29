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
            
            {/* Avatar Creation Route */}
            <Route path="/avatar" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1">
                  <AvatarPage />
                </main>
              </div>
            } />
            
            {/* Other Dashboard routes */}
            <Route path="/chat" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Chat Interface</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </main>
              </div>
            } />
            
            <Route path="/training" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">AI Training</h1>
                    <p className="text-gray-600">Configure your AI training settings...</p>
                  </div>
                </main>
              </div>
            } />

            <Route path="/calendar" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Calendar</h1>
                    <p className="text-gray-600">Manage your schedule...</p>
                  </div>
                </main>
              </div>
            } />

            <Route path="/notifications" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Notifications</h1>
                    <p className="text-gray-600">View your notifications...</p>
                  </div>
                </main>
              </div>
            } />

            <Route path="/followers" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Followers</h1>
                    <p className="text-gray-600">Manage your followers...</p>
                  </div>
                </main>
              </div>
            } />

            <Route path="/settings" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Settings</h1>
                    <p className="text-gray-600">Configure your preferences...</p>
                  </div>
                </main>
              </div>
            } />

            <Route path="/dashboard" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
                    <p className="text-gray-600">Welcome to your dashboard...</p>
                  </div>
                </main>
              </div>
            } />

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

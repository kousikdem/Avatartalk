
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
            
            {/* Avatar route with sidebar */}
            <Route path="/avatar" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1">
                  <AvatarPage />
                </main>
              </div>
            } />
            
            {/* Dashboard routes with sidebar */}
            <Route path="/dashboard" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                  <p className="text-gray-600 mt-2">Welcome to your dashboard</p>
                </main>
              </div>
            } />

            <Route path="/chat" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <h1 className="text-3xl font-bold text-gray-800">Chat</h1>
                  <p className="text-gray-600 mt-2">AI Chat interface coming soon</p>
                </main>
              </div>
            } />

            <Route path="/training" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <h1 className="text-3xl font-bold text-gray-800">AI Training</h1>
                  <p className="text-gray-600 mt-2">Train your personalized AI model</p>
                </main>
              </div>
            } />

            <Route path="/calendar" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
                  <p className="text-gray-600 mt-2">Manage your schedule</p>
                </main>
              </div>
            } />

            <Route path="/notifications" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                  <p className="text-gray-600 mt-2">View your notifications</p>
                </main>
              </div>
            } />

            <Route path="/followers" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <h1 className="text-3xl font-bold text-gray-800">Followers</h1>
                  <p className="text-gray-600 mt-2">Manage your followers</p>
                </main>
              </div>
            } />

            <Route path="/settings" element={
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <main className="flex-1 p-6">
                  <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                  <p className="text-gray-600 mt-2">Configure your account</p>
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


import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from './DashboardSidebar';
import CreatePostModal from './CreatePostModal';
import EnhancedDashboard from './EnhancedDashboard';

const Dashboard = () => {
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
          
          <main className="flex-1 p-6">
            <EnhancedDashboard />
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

export default Dashboard;

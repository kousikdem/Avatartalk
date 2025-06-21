
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import ProfilePage from '@/components/ProfilePage';

const Index = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const username = searchParams.get('username');

  // If accessing a specific username profile
  if (username) {
    return <ProfilePage />;
  }

  // Show dashboard view
  if (view === 'dashboard') {
    return (
      <>
        <Navbar />
        <Dashboard />
      </>
    );
  }

  // Show profile view (visitor perspective)
  if (view === 'profile') {
    return <ProfilePage />;
  }

  // Default landing page
  return (
    <>
      <Navbar />
      <LandingPage />
    </>
  );
};

export default Index;

import React from 'react';
import DashboardHeaderStrip from './DashboardHeaderStrip';

interface DashboardPageLayoutProps {
  children: React.ReactNode;
  hideHeaderStrip?: boolean;
}

const DashboardPageLayout: React.FC<DashboardPageLayoutProps> = ({ 
  children, 
  hideHeaderStrip = false 
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderStrip && <DashboardHeaderStrip />}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default DashboardPageLayout;

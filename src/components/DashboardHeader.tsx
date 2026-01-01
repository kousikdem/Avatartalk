import React from 'react';
import TokenDisplay from './TokenDisplay';
import CurrencySelector from './CurrencySelector';
import PlanBadge from './PlanBadge';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  icon,
  children
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <PlanBadge size="md" showIcon />
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <CurrencySelector compact />
        <TokenDisplay compact />
        {children}
      </div>
    </div>
  );
};

export default DashboardHeader;

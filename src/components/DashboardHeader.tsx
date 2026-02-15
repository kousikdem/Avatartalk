import React from 'react';
import TokenDisplay from './TokenDisplay';
import CurrencySelector from './CurrencySelector';
import PlanBadge from './PlanBadge';
import { useEarnings } from '@/hooks/useEarnings';
import { DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const formatUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  icon,
  children
}) => {
  const { earnings } = useEarnings();

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
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 border-emerald-300 bg-emerald-50 text-emerald-700">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="text-sm font-semibold">{formatUSD(earnings.totalEarnings)}</span>
        </Badge>
        <CurrencySelector compact />
        <TokenDisplay compact />
        {children}
      </div>
    </div>
  );
};

export default DashboardHeader;

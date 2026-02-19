import React from 'react';
import { Link } from 'react-router-dom';
import TokenDisplay from './TokenDisplay';
import CurrencySelector from './CurrencySelector';
import PlanBadge from './PlanBadge';
import { useEarnings } from '@/hooks/useEarnings';
import { useCurrency } from '@/hooks/useCurrency';
import { DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  const { earnings } = useEarnings();
  const { formatPrice } = useCurrency();

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
        <Link to="/settings/earnings">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 h-8 px-3">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="text-sm font-semibold">{formatPrice(earnings.totalEarnings)}</span>
          </Button>
        </Link>
        <CurrencySelector compact />
        <TokenDisplay compact />
        {children}
      </div>
    </div>
  );
};

export default DashboardHeader;

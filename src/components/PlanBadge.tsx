import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Crown, Rocket } from 'lucide-react';
import { useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';

interface PlanBadgeProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const planConfig: Record<string, { 
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgClass: string;
  label: string;
}> = {
  free: {
    icon: Star,
    gradient: 'from-slate-400 to-slate-500',
    bgClass: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-300',
    label: 'Free',
  },
  creator: {
    icon: Zap,
    gradient: 'from-blue-500 to-purple-500',
    bgClass: 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-300',
    label: 'Creator',
  },
  pro: {
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500',
    bgClass: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300',
    label: 'Pro',
  },
  business: {
    icon: Rocket,
    gradient: 'from-orange-500 to-red-500',
    bgClass: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-300',
    label: 'Business',
  },
};

const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  className = '', 
  showIcon = true,
  size = 'md' 
}) => {
  const { effectivePlanKey, isExpired, loading } = useUserPlatformSubscription();

  if (loading) {
    return (
      <Badge variant="outline" className={`animate-pulse ${className}`}>
        Loading...
      </Badge>
    );
  }

  const config = planConfig[effectivePlanKey] || planConfig.free;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (isExpired) {
    return (
      <Badge 
        variant="outline" 
        className={`${sizeClasses[size]} border-red-300 bg-red-50 text-red-700 ${className}`}
      >
        {showIcon && <Star className={`${iconSizes[size]} mr-1`} />}
        Expired
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline"
      className={`${sizeClasses[size]} ${config.bgClass} border ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </Badge>
  );
};

export default PlanBadge;

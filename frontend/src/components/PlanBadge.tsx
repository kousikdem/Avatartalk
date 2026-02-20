import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Crown, Rocket } from 'lucide-react';
import { useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';

interface PlanBadgeProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  planKey?: string; // Optional: show a specific plan instead of user's plan
}

// Plan colors matching the pricing page exactly
export const planColors: Record<string, { 
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  label: string;
}> = {
  free: {
    icon: Star,
    gradient: 'from-slate-400 to-slate-500',
    bgClass: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-300 dark:border-slate-600',
    label: 'Free',
  },
  creator: {
    icon: Zap,
    gradient: 'from-blue-500 to-purple-500',
    bgClass: 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-300 dark:border-blue-600',
    label: 'Creator',
  },
  pro: {
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500',
    bgClass: 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-300 dark:border-purple-600',
    label: 'Pro',
  },
  business: {
    icon: Rocket,
    gradient: 'from-orange-500 to-red-500',
    bgClass: 'bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-300 dark:border-orange-600',
    label: 'Business',
  },
};

const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  className = '', 
  showIcon = true,
  size = 'md',
  planKey
}) => {
  const { effectivePlanKey, isExpired, loading } = useUserPlatformSubscription();

  // Use provided planKey or user's plan
  const displayPlanKey = planKey || effectivePlanKey;

  if (loading && !planKey) {
    return (
      <Badge variant="outline" className={`animate-pulse ${className}`}>
        Loading...
      </Badge>
    );
  }

  const config = planColors[displayPlanKey] || planColors.free;
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

  if (isExpired && !planKey) {
    return (
      <Badge 
        variant="outline" 
        className={`${sizeClasses[size]} border-red-300 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ${className}`}
      >
        {showIcon && <Star className={`${iconSizes[size]} mr-1`} />}
        Expired
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline"
      className={`${sizeClasses[size]} ${config.bgClass} ${config.textClass} ${config.borderClass} border ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </Badge>
  );
};

export default PlanBadge;

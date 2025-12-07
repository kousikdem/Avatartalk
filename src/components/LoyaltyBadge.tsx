import React from 'react';
import { Crown, Star, Shield, Award, Heart, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoyaltyBadgeProps {
  score: number; // 1-100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showScore?: boolean;
  showTierName?: boolean;
}

export const getLoyaltyTier = (score: number) => {
  if (score >= 80) return { 
    name: 'Diamond', 
    color: 'from-cyan-400 to-blue-500', 
    bgColor: 'bg-gradient-to-r from-cyan-400/20 to-blue-500/20',
    borderColor: 'border-cyan-400/50',
    icon: Gem, 
    textColor: 'text-cyan-400' 
  };
  if (score >= 60) return { 
    name: 'Platinum', 
    color: 'from-violet-400 to-purple-500', 
    bgColor: 'bg-gradient-to-r from-violet-400/20 to-purple-500/20',
    borderColor: 'border-violet-400/50',
    icon: Crown, 
    textColor: 'text-violet-400' 
  };
  if (score >= 40) return { 
    name: 'Gold', 
    color: 'from-yellow-400 to-amber-500', 
    bgColor: 'bg-gradient-to-r from-yellow-400/20 to-amber-500/20',
    borderColor: 'border-yellow-400/50',
    icon: Award, 
    textColor: 'text-yellow-400' 
  };
  if (score >= 20) return { 
    name: 'Silver', 
    color: 'from-slate-300 to-gray-400', 
    bgColor: 'bg-gradient-to-r from-slate-300/20 to-gray-400/20',
    borderColor: 'border-slate-400/50',
    icon: Star, 
    textColor: 'text-slate-400' 
  };
  return { 
    name: 'Bronze', 
    color: 'from-orange-400 to-amber-600', 
    bgColor: 'bg-gradient-to-r from-orange-400/20 to-amber-600/20',
    borderColor: 'border-orange-400/50',
    icon: Heart, 
    textColor: 'text-orange-400' 
  };
};

const LoyaltyBadge: React.FC<LoyaltyBadgeProps> = ({
  score,
  size = 'sm',
  className = '',
  showScore = true,
  showTierName = false
}) => {
  const tier = getLoyaltyTier(score);
  const Icon = tier.icon;
  
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {/* Tier Name Above */}
      {showTierName && (
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", tier.textColor)}>
          {tier.name}
        </span>
      )}
      {/* Badge */}
      <div
        className={cn(
          'inline-flex items-center rounded-full font-semibold shadow-lg backdrop-blur-sm bg-gradient-to-r',
          tier.color,
          sizeClasses[size]
        )}
        style={{
          boxShadow: `0 2px 12px rgba(0,0,0,0.3)`
        }}
      >
        <Icon className={cn(iconSizes[size], 'text-white drop-shadow-sm')} />
        <span className="text-white font-bold drop-shadow-sm">
          {showScore ? `${Math.round(score)}` : tier.name}
        </span>
      </div>
    </div>
  );
};

export default LoyaltyBadge;

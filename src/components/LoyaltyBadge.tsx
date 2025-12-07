import React from 'react';
import { Crown, Star, Shield, Award, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoyaltyBadgeProps {
  score: number; // 1-100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showScore?: boolean;
}

const getLoyaltyTier = (score: number) => {
  if (score >= 80) return { name: 'Diamond', color: 'from-blue-400 to-cyan-300', icon: Crown, textColor: 'text-cyan-300' };
  if (score >= 60) return { name: 'Platinum', color: 'from-violet-400 to-purple-300', icon: Award, textColor: 'text-purple-300' };
  if (score >= 40) return { name: 'Gold', color: 'from-yellow-400 to-amber-300', icon: Star, textColor: 'text-amber-300' };
  if (score >= 20) return { name: 'Silver', color: 'from-slate-300 to-gray-200', icon: Shield, textColor: 'text-gray-300' };
  return { name: 'Bronze', color: 'from-orange-400 to-amber-600', icon: Heart, textColor: 'text-amber-500' };
};

const LoyaltyBadge: React.FC<LoyaltyBadgeProps> = ({
  score,
  size = 'sm',
  className = '',
  showScore = true
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
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold shadow-lg backdrop-blur-sm bg-gradient-to-r',
        tier.color,
        sizeClasses[size],
        className
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
  );
};

export default LoyaltyBadge;

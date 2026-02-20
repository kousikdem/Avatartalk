import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriberBadgeProps {
  text?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

const SubscriberBadge: React.FC<SubscriberBadgeProps> = ({
  text = 'Subscriber',
  color = '#6366f1',
  size = 'sm',
  className = '',
  showIcon = true
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5'
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold shadow-lg backdrop-blur-sm',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}ee`,
        color: 'white',
        boxShadow: `0 2px 8px ${color}40`
      }}
    >
      {showIcon && <Crown className={iconSizes[size]} />}
      <span>{text}</span>
    </div>
  );
};

export default SubscriberBadge;

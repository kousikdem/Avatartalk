
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg`}>
      <MessageSquare
        className="w-3/5 h-3/5 text-white"
        strokeWidth={2.5}
        fill="currentColor"
      />
      <Sparkles
        className="absolute -top-0.5 -right-0.5 w-2 h-2 text-yellow-300"
        fill="currentColor"
      />
    </div>
  );
};

export default Logo;

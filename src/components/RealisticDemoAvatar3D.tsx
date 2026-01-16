import React from 'react';
import demoAvatar3D from '@/assets/demo-avatar-3d.png';

interface RealisticDemoAvatar3DProps {
  className?: string;
  isTalking?: boolean;
}

const RealisticDemoAvatar3D: React.FC<RealisticDemoAvatar3DProps> = ({ 
  className = '',
  isTalking = true 
}) => {
  return (
    <div className={`w-full h-56 relative flex items-center justify-center ${className}`}>
      {/* Avatar Image */}
      <div className="relative flex items-center justify-center h-full w-full">
        <img 
          src={demoAvatar3D} 
          alt="Demo Avatar"
          className="h-full w-auto max-w-full object-contain"
          style={{
            filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.15))',
          }}
        />
        
        {/* Subtle talking animation overlay when talking */}
        {isTalking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-full animate-pulse" 
                 style={{ animationDuration: '0.3s' }} />
          </div>
        )}
      </div>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-purple-500/5 rounded-3xl" />
      </div>
    </div>
  );
};

export default RealisticDemoAvatar3D;

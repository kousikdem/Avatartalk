import React, { useState } from 'react';
import demoAvatar3D from '@/assets/demo-avatar-3d.png';

interface RealisticDemoAvatar3DProps {
  className?: string;
  isTalking?: boolean;
}

const RealisticDemoAvatar3D: React.FC<RealisticDemoAvatar3DProps> = ({ 
  className = '',
  isTalking = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`w-full h-56 relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: '1000px',
        background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)',
      }}
    >
      {/* 3D Avatar Container */}
      <div 
        className="relative flex items-center justify-center h-full w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered 
            ? 'rotateY(5deg) rotateX(-2deg) scale(1.02)' 
            : 'rotateY(0deg) rotateX(0deg) scale(1)',
        }}
      >
        {/* Floating animation wrapper */}
        <div 
          className="relative"
          style={{
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          {/* Avatar Image */}
          <img 
            src={demoAvatar3D} 
            alt="Demo Avatar"
            className="h-48 w-auto object-contain relative z-10"
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',
            }}
          />
          
          {/* 3D depth shadow layer */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              transform: 'translateZ(-20px) scale(0.95)',
              filter: 'blur(8px)',
              opacity: 0.3,
            }}
          >
            <img 
              src={demoAvatar3D} 
              alt=""
              className="h-48 w-auto object-contain opacity-50"
              style={{
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        </div>
        
        {/* Talking animation indicator */}
        {isTalking && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '0.4s' }} />
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.1s', animationDuration: '0.4s' }} />
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s', animationDuration: '0.4s' }} />
          </div>
        )}
      </div>

      {/* Ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      </div>

      {/* Subtle rim light effect */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl z-30"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, hsl(var(--primary) / 0.05) 100%)',
        }}
      />
    </div>
  );
};

export default RealisticDemoAvatar3D;

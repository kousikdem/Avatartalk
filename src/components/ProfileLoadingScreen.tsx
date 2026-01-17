import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, MessageCircle, Sparkles, Zap } from 'lucide-react';

interface ProfileLoadingScreenProps {
  isLoading: boolean;
  maxDuration?: number;
}

export const ProfileLoadingScreen: React.FC<ProfileLoadingScreenProps> = ({
  isLoading,
  maxDuration = 2500, // Max 2.5s to complete under 3s target
}) => {
  const [progress, setProgress] = useState(0);
  const [forceComplete, setForceComplete] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      return;
    }

    setProgress(0);
    setForceComplete(false);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / maxDuration, 1);
      
      // Exponential easing for fast start, smooth finish
      const easedProgress = 1 - Math.pow(1 - progressRatio, 4);
      setProgress(Math.min(easedProgress * 100, 99));

      if (elapsed >= maxDuration) {
        setForceComplete(true);
        setProgress(100);
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isLoading, maxDuration]);

  const shouldShow = isLoading && !forceComplete;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
        >
          <div className="flex flex-col items-center gap-6 p-8">
            {/* Hi-Fi Animated Icon */}
            <div className="relative w-24 h-24">
              {/* Outer rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Middle pulsing ring */}
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-purple-500/50"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Inner glowing circle */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Center icon container */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Link icon */}
                <motion.div
                  className="relative"
                  animate={{ 
                    y: [0, -4, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Link className="w-8 h-8 text-blue-400" strokeWidth={2.5} />
                  
                  {/* Sparkle effects around the icon */}
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ 
                      scale: [0.5, 1, 0.5],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute -bottom-1 -left-2"
                    animate={{ 
                      scale: [0.5, 1, 0.5],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                  >
                    <Zap className="w-2.5 h-2.5 text-cyan-400" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute top-0 -left-3"
                    animate={{ 
                      scale: [0.5, 1, 0.5],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
                  >
                    <MessageCircle className="w-2.5 h-2.5 text-purple-400" />
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Orbiting particles */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-blue-400"
                style={{ top: '50%', left: '0%' }}
                animate={{
                  rotate: 360,
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                initial={{ rotate: 0 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-400"
                  style={{ 
                    position: 'absolute',
                    left: '-48px',
                    top: '-4px',
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Loading Text with typewriter effect */}
            <div className="text-center space-y-2">
              <motion.h2 
                className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Get Link. Let's Chat...
              </motion.h2>
              
              {/* Animated dots */}
              <div className="flex items-center justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400"
                    animate={{ 
                      y: [0, -6, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      delay: i * 0.15,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Progress percentage */}
            <motion.p 
              className="text-xs text-slate-500 font-mono"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Profile page skeleton for instant perceived loading
export const ProfilePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-2">
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-slate-900/95 border border-slate-700/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl min-h-[90vh] p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          </div>
        </div>
        
        {/* Bio skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-slate-800 rounded animate-pulse" />
        </div>
        
        {/* Avatar preview skeleton */}
        <div className="h-64 w-full bg-slate-800/50 rounded-2xl animate-pulse" />
        
        {/* Action buttons skeleton */}
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3 h-12 bg-slate-800 rounded-xl animate-pulse" />
          <div className="col-span-2 h-12 bg-slate-800 rounded-xl animate-pulse" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
        
        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="flex gap-4 border-b border-slate-700/30 pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-48 bg-slate-800/30 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export default ProfileLoadingScreen;

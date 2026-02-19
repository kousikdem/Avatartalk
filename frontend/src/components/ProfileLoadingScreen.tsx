import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ProfileLoadingScreenProps {
  isLoading: boolean;
  maxDuration?: number;
}

export const ProfileLoadingScreen: React.FC<ProfileLoadingScreenProps> = memo(({
  isLoading,
  maxDuration = 1500, // Reduced to 1.5s for faster load
}) => {
  const [progress, setProgress] = useState(0);
  const [forceComplete, setForceComplete] = useState(false);
  const [displayText, setDisplayText] = useState('');
  
  const fullText = "Get Link. Let's Chat...";

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
      
      // Fast eased progress
      const easedProgress = 1 - Math.pow(1 - progressRatio, 2);
      setProgress(Math.min(easedProgress * 100, 99));

      if (elapsed >= maxDuration) {
        setForceComplete(true);
        setProgress(100);
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isLoading, maxDuration]);

  // Typewriter effect - faster
  useEffect(() => {
    if (!isLoading || forceComplete) return;

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 40); // Faster typing

    return () => clearInterval(typeInterval);
  }, [isLoading, forceComplete]);

  const shouldShow = isLoading && !forceComplete;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
        >
          <div className="flex flex-col items-center gap-6 p-8">
            {/* Animated icon */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20"
                animate={{ 
                  boxShadow: [
                    '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
                    '0 10px 30px -10px rgba(168, 85, 247, 0.3)',
                    '0 10px 30px -10px rgba(236, 72, 153, 0.3)',
                    '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>

            {/* Typewriter text */}
            <div className="h-6 flex items-center">
              <motion.span
                className="text-lg font-medium text-white/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {displayText}
                <motion.span
                  className="inline-block w-0.5 h-5 bg-white/80 ml-0.5"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
              </motion.span>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ProfileLoadingScreen.displayName = 'ProfileLoadingScreen';

export const ProfilePageSkeleton: React.FC = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-2">
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-slate-900/95 border border-slate-700/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl min-h-[90vh] p-6 space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-800" />
            <div className="space-y-2">
              <div className="h-5 w-28 bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="w-8 h-8 rounded-full bg-slate-800" />
          </div>
        </div>
        
        {/* Bio skeleton */}
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-full bg-slate-800 rounded" />
          <div className="h-3 w-3/4 bg-slate-800 rounded" />
        </div>
        
        {/* Avatar preview skeleton */}
        <div className="h-56 w-full bg-slate-800/50 rounded-2xl animate-pulse" />
        
        {/* Action buttons skeleton */}
        <div className="grid grid-cols-5 gap-2 animate-pulse">
          <div className="col-span-3 h-11 bg-slate-800 rounded-xl" />
          <div className="col-span-2 h-11 bg-slate-800 rounded-xl" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
        
        {/* Tabs skeleton */}
        <div className="space-y-4 animate-pulse">
          <div className="flex gap-4 border-b border-slate-700/30 pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-14 bg-slate-800 rounded" />
            ))}
          </div>
          <div className="h-40 bg-slate-800/30 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
));

ProfilePageSkeleton.displayName = 'ProfilePageSkeleton';

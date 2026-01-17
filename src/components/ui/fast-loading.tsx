import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Priority levels for content loading
export type LoadingPriority = 'critical' | 'high' | 'medium' | 'low';

interface PriorityLoaderProps {
  children: React.ReactNode;
  priority: LoadingPriority;
  isDataReady: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

// Delay mapping based on priority (faster loading for higher priority)
const priorityDelays: Record<LoadingPriority, number> = {
  critical: 0,
  high: 100,
  medium: 200,
  low: 400,
};

export const PriorityLoader: React.FC<PriorityLoaderProps> = ({
  children,
  priority,
  isDataReady,
  fallback,
  className,
}) => {
  const [shouldRender, setShouldRender] = useState(priority === 'critical');

  useEffect(() => {
    if (priority === 'critical') {
      setShouldRender(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldRender(true);
    }, priorityDelays[priority]);

    return () => clearTimeout(timer);
  }, [priority]);

  if (!shouldRender) {
    return fallback || null;
  }

  return (
    <AnimatePresence mode="wait">
      {isDataReady ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={className}
        >
          {fallback}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Fast loading spinner that completes within 3 seconds
interface FastLoadingScreenProps {
  isLoading: boolean;
  message?: string;
  maxDuration?: number;
}

export const FastLoadingScreen: React.FC<FastLoadingScreenProps> = ({
  isLoading,
  message = 'Loading...',
  maxDuration = 2500, // Max 2.5s to leave buffer
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

    // Accelerating progress that reaches 100% within maxDuration
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / maxDuration, 1);
      
      // Eased progress curve - faster at start, slower near end
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-6 p-8">
            {/* Animated logo/spinner */}
            <div className="relative w-16 h-16">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary/20"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Message */}
            <p className="text-sm text-muted-foreground animate-pulse">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Skeleton components for different content types
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
    <div className="flex justify-between items-start">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-4 w-20" />
  </div>
);

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-lg border bg-card p-6", className)}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <div className="flex items-center gap-4 p-4 border-b">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className={cn("h-4", i === 0 ? "w-32" : "w-20")} />
    ))}
  </div>
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="rounded-lg border bg-card overflow-hidden">
    <Skeleton className="h-40 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="h-64 flex items-end gap-2 pt-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1 rounded-t"
          style={{ height: `${Math.random() * 60 + 40}%` }}
        />
      ))}
    </div>
  </div>
);

export const HeaderSkeleton: React.FC = () => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24 rounded" />
      <Skeleton className="h-10 w-32 rounded" />
    </div>
  </div>
);

export const TabsSkeleton: React.FC<{ tabCount?: number }> = ({ tabCount = 3 }) => (
  <div className="space-y-6">
    <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
      {Array.from({ length: tabCount }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Dashboard page skeleton for consistent loading across pages
export const DashboardPageSkeleton: React.FC<{ 
  showStats?: boolean;
  showTabs?: boolean;
  showChart?: boolean;
  statsCount?: number;
  tabCount?: number;
}> = ({ 
  showStats = true, 
  showTabs = true, 
  showChart = false,
  statsCount = 4,
  tabCount = 3
}) => (
  <div className="min-h-screen bg-background p-4 sm:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <HeaderSkeleton />

      {/* Stats */}
      {showStats && (
        <div className={cn(
          "grid gap-4",
          statsCount <= 4 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-" + Math.min(statsCount, 7)
        )}>
          {Array.from({ length: statsCount }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Chart */}
      {showChart && <ChartSkeleton />}

      {/* Tabs/Content */}
      {showTabs && <TabsSkeleton tabCount={tabCount} />}
    </div>
  </div>
);

// Hook for managing progressive loading
export function useProgressiveLoading(dataStates: Record<string, boolean>) {
  const [loadingPhase, setLoadingPhase] = useState<'initial' | 'loading' | 'ready'>('initial');

  const criticalReady = Object.entries(dataStates)
    .filter(([key]) => key.includes('critical') || key.includes('auth'))
    .every(([, ready]) => ready);

  const allReady = Object.values(dataStates).every(Boolean);

  useEffect(() => {
    if (allReady) {
      setLoadingPhase('ready');
    } else if (criticalReady) {
      setLoadingPhase('loading');
    }
  }, [criticalReady, allReady]);

  return {
    loadingPhase,
    criticalReady,
    allReady,
    isInitialLoading: loadingPhase === 'initial',
    isPartiallyLoaded: loadingPhase === 'loading',
    isFullyLoaded: loadingPhase === 'ready',
  };
}

// Wrapper component for easy page-level loading
interface FastPageLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  loadingMessage?: string;
}

export const FastPageLoader: React.FC<FastPageLoaderProps> = ({
  isLoading,
  children,
  skeleton,
  loadingMessage = 'Loading page...',
}) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Show skeleton for minimum 300ms for smooth transition
    const timer = setTimeout(() => {
      setShowSkeleton(false);
      setInitialLoadComplete(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // If still in initial load or loading data, show appropriate state
  if (showSkeleton || (isLoading && !initialLoadComplete)) {
    return (
      <>
        <FastLoadingScreen 
          isLoading={!initialLoadComplete} 
          message={loadingMessage}
        />
        <AnimatePresence>
          {skeleton && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {skeleton}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default FastPageLoader;

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Priority-based loading delays (in ms)
const priorityDelays = {
  critical: 0,
  high: 50,
  medium: 150,
  low: 300,
};

export type LoadingPriority = 'critical' | 'high' | 'medium' | 'low';

interface PriorityLoaderProps {
  children: React.ReactNode;
  priority: LoadingPriority;
  isDataReady: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

export const PriorityLoader: React.FC<PriorityLoaderProps> = memo(({
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
          transition={{ duration: 0.15 }}
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
          transition={{ duration: 0.1 }}
          className={className}
        >
          {fallback}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

PriorityLoader.displayName = 'PriorityLoader';

interface FastLoadingScreenProps {
  isLoading: boolean;
  message?: string;
  maxDuration?: number;
}

export const FastLoadingScreen: React.FC<FastLoadingScreenProps> = memo(({
  isLoading,
  message = 'Loading...',
  maxDuration = 1500, // Reduced to 1.5s for faster perceived load
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
      
      // Faster eased progress curve
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

  const shouldShow = isLoading && !forceComplete;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="relative w-12 h-12">
              <motion.div
                className="absolute inset-0 rounded-full border-3 border-primary/20"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            <div className="w-40 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

FastLoadingScreen.displayName = 'FastLoadingScreen';

// Optimized skeleton components with minimal DOM
export const CardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card p-4 space-y-3 animate-pulse">
    <div className="h-4 bg-muted rounded w-3/4" />
    <div className="h-3 bg-muted rounded w-1/2" />
    <div className="h-20 bg-muted rounded" />
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';

export const StatCardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card p-4 space-y-2 animate-pulse">
    <div className="h-3 bg-muted rounded w-1/2" />
    <div className="h-6 bg-muted rounded w-3/4" />
  </div>
));

StatCardSkeleton.displayName = 'StatCardSkeleton';

export const TableRowSkeleton = memo(() => (
  <div className="flex items-center gap-4 p-3 border-b animate-pulse">
    <div className="h-8 w-8 bg-muted rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="h-2 bg-muted rounded w-1/4" />
    </div>
    <div className="h-6 w-16 bg-muted rounded" />
  </div>
));

TableRowSkeleton.displayName = 'TableRowSkeleton';

export const ProductCardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card overflow-hidden animate-pulse">
    <div className="h-32 bg-muted" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-5 bg-muted rounded w-1/4" />
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export const ChartSkeleton = memo(() => (
  <div className="rounded-lg border bg-card p-4 animate-pulse">
    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
    <div className="h-48 bg-muted rounded" />
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

export const HeaderSkeleton = memo(() => (
  <div className="flex items-center justify-between p-4 border-b animate-pulse">
    <div className="h-6 bg-muted rounded w-1/4" />
    <div className="flex gap-2">
      <div className="h-8 w-20 bg-muted rounded" />
      <div className="h-8 w-8 bg-muted rounded" />
    </div>
  </div>
));

HeaderSkeleton.displayName = 'HeaderSkeleton';

export const TabsSkeleton = memo(({ count = 4 }: { count?: number }) => (
  <div className="flex gap-1 border-b pb-2 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-8 w-20 bg-muted rounded" />
    ))}
  </div>
));

TabsSkeleton.displayName = 'TabsSkeleton';

// Compact dashboard skeleton
export const DashboardPageSkeleton = memo(({ 
  showStats = true,
  showTabs = true,
  showChart = false,
  statsCount = 4,
  tabCount = 4,
}: { 
  showStats?: boolean;
  showTabs?: boolean;
  showChart?: boolean;
  statsCount?: number;
  tabCount?: number;
}) => (
  <div className="p-4 space-y-4 animate-pulse">
    <HeaderSkeleton />
    
    {showStats && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: statsCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )}
    
    {showTabs && <TabsSkeleton count={tabCount} />}
    
    {showChart && <ChartSkeleton />}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
));

DashboardPageSkeleton.displayName = 'DashboardPageSkeleton';

// Minimal profile skeleton
export const ProfileSkeleton = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-2">
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-slate-900/95 border border-slate-700/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl min-h-[90vh] p-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-800" />
            <div className="space-y-2">
              <div className="h-5 w-28 bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
        <div className="h-56 w-full bg-slate-800/50 rounded-2xl" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
));

ProfileSkeleton.displayName = 'ProfileSkeleton';

// Progressive loading hook
export const useProgressiveLoading = (dataStates: boolean[]) => {
  const [loadingState, setLoadingState] = useState<'initial' | 'loading' | 'ready'>('initial');

  useEffect(() => {
    const criticalReady = dataStates[0];
    const allReady = dataStates.every(Boolean);

    if (allReady) {
      setLoadingState('ready');
    } else if (criticalReady) {
      setLoadingState('loading');
    } else {
      setLoadingState('initial');
    }
  }, [dataStates]);

  return loadingState;
};

// Fast page loader wrapper
interface FastPageLoaderProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  message?: string;
  maxDuration?: number;
}

export const FastPageLoader: React.FC<FastPageLoaderProps> = memo(({
  isLoading,
  skeleton,
  children,
}) => {
  // Show skeleton instantly while loading, then content
  if (isLoading) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
});

FastPageLoader.displayName = 'FastPageLoader';

// Lazy image component with blur placeholder
export const LazyImage = memo(({ 
  src, 
  alt, 
  className,
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

// Intersection observer hook for lazy loading
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, isVisible };
};

// Deferred content loader
export const DeferredContent = memo(({ 
  children, 
  delay = 100,
  fallback = null 
}: { 
  children: React.ReactNode; 
  delay?: number;
  fallback?: React.ReactNode;
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return fallback;
  return <>{children}</>;
});

DeferredContent.displayName = 'DeferredContent';

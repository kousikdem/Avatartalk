import React, { useState, useEffect, memo } from 'react';

export type LoadingPriority = 'critical' | 'high' | 'medium' | 'low';

interface PriorityLoaderProps {
  children: React.ReactNode;
  priority: LoadingPriority;
  isDataReady: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

export const PriorityLoader: React.FC<PriorityLoaderProps> = memo((
  { children, priority, isDataReady, fallback, className }
) => {
  if (!isDataReady) return <div className={className}>{fallback}</div>;
  return <div className={className}>{children}</div>;
});
PriorityLoader.displayName = 'PriorityLoader';

interface FastLoadingScreenProps {
  isLoading: boolean;
  message?: string;
  maxDuration?: number;
}

// Speed progress animation (replaces old spinner)
export const FastLoadingScreen: React.FC<FastLoadingScreenProps> = memo(({ isLoading, message = 'Loading...' }) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-5">
      {/* Brand logo */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
        <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <rect x="7" y="8" width="10" height="9" rx="1.5" fill="white" opacity="0.95"/>
            <circle cx="10" cy="11" r="0.8" fill="#3b82f6"/>
            <circle cx="14" cy="11" r="0.8" fill="#3b82f6"/>
            <rect x="10.5" y="14" width="3" height="0.6" rx="0.3" fill="#3b82f6"/>
            <circle cx="12" cy="6.5" r="1" fill="white" opacity="0.95"/>
            <rect x="11.5" y="6.5" width="1" height="1.5" fill="white" opacity="0.95"/>
            <circle cx="18" cy="4" r="2" fill="#fde047"/>
          </svg>
        </div>
      </div>
      {/* Speed progress bar */}
      <div className="w-28 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-400 to-indigo-500"
          style={{ animation: 'speedProgressBar 1.6s ease-in-out infinite' }}
        />
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      <style>{`
        @keyframes speedProgressBar {
          0%   { width: 0%;   margin-left: 0%;    opacity: 1; }
          65%  { width: 85%;  margin-left: 5%;    opacity: 1; }
          90%  { width: 12%;  margin-left: 88%;   opacity: 0.5; }
          100% { width: 0%;   margin-left: 100%;  opacity: 0; }
        }
      `}</style>
    </div>
  );
});
FastLoadingScreen.displayName = 'FastLoadingScreen';

// ── Progress speed shimmer (replaces animate-pulse skeleton shimmer) ────────
// Each "Skeleton" line is now a speed-shimmer bar that races left-to-right
const SpeedShimmerBar = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded bg-muted/60 ${className}`}>
    <div
      className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      style={{ animation: 'speedShimmer 1.4s ease-in-out infinite' }}
    />
    <style>{`
      @keyframes speedShimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(300%); }
      }
    `}</style>
  </div>
);

export const CardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card p-4 space-y-3">
    <SpeedShimmerBar className="h-4 w-3/4" />
    <SpeedShimmerBar className="h-3 w-1/2" />
    <SpeedShimmerBar className="h-20 w-full" />
  </div>
));
CardSkeleton.displayName = 'CardSkeleton';

export const StatCardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card p-4 space-y-2">
    <SpeedShimmerBar className="h-3 w-1/2" />
    <SpeedShimmerBar className="h-6 w-3/4" />
  </div>
));
StatCardSkeleton.displayName = 'StatCardSkeleton';

export const TableRowSkeleton = memo(() => (
  <div className="flex items-center gap-4 p-3 border-b">
    <SpeedShimmerBar className="h-8 w-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <SpeedShimmerBar className="h-3 w-1/3" />
      <SpeedShimmerBar className="h-2 w-1/4" />
    </div>
    <SpeedShimmerBar className="h-6 w-16" />
  </div>
));
TableRowSkeleton.displayName = 'TableRowSkeleton';

export const ProductCardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card overflow-hidden">
    <SpeedShimmerBar className="h-32 w-full rounded-none" />
    <div className="p-3 space-y-2">
      <SpeedShimmerBar className="h-4 w-3/4" />
      <SpeedShimmerBar className="h-3 w-1/2" />
      <SpeedShimmerBar className="h-5 w-1/4" />
    </div>
  </div>
));
ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export const ChartSkeleton = memo(() => (
  <div className="rounded-lg border bg-card p-4">
    <SpeedShimmerBar className="h-4 w-1/4 mb-4" />
    <SpeedShimmerBar className="h-48 w-full" />
  </div>
));
ChartSkeleton.displayName = 'ChartSkeleton';

export const HeaderSkeleton = memo(() => (
  <div className="flex items-center justify-between p-4 border-b">
    <SpeedShimmerBar className="h-6 w-1/4" />
    <div className="flex gap-2">
      <SpeedShimmerBar className="h-8 w-20" />
      <SpeedShimmerBar className="h-8 w-8" />
    </div>
  </div>
));
HeaderSkeleton.displayName = 'HeaderSkeleton';

export const TabsSkeleton = memo(({ count = 4 }: { count?: number }) => (
  <div className="flex gap-1 border-b pb-2">
    {Array.from({ length: count }).map((_, i) => (
      <SpeedShimmerBar key={i} className="h-8 w-20" />
    ))}
  </div>
));
TabsSkeleton.displayName = 'TabsSkeleton';

export const DashboardPageSkeleton = memo(({ 
  showStats = true, showTabs = true, showChart = false,
  statsCount = 4, tabCount = 4,
}: { 
  showStats?: boolean; showTabs?: boolean; showChart?: boolean;
  statsCount?: number; tabCount?: number;
}) => (
  <div className="p-4 space-y-4">
    <HeaderSkeleton />
    {showStats && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: statsCount }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )}
    {showTabs && <TabsSkeleton count={tabCount} />}
    {showChart && <ChartSkeleton />}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  </div>
));
DashboardPageSkeleton.displayName = 'DashboardPageSkeleton';

export const ProfileSkeleton = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-2">
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-slate-900/95 border border-slate-700/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl min-h-[90vh] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SpeedShimmerBar className="w-14 h-14 rounded-full" />
            <div className="space-y-2">
              <SpeedShimmerBar className="h-5 w-28" />
              <SpeedShimmerBar className="h-3 w-16" />
            </div>
          </div>
        </div>
        <SpeedShimmerBar className="h-56 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => <SpeedShimmerBar key={i} className="h-14 rounded-xl" />)}
        </div>
      </div>
    </div>
  </div>
));
ProfileSkeleton.displayName = 'ProfileSkeleton';

export const useProgressiveLoading = (dataStates: boolean[]) => {
  const [loadingState, setLoadingState] = useState<'initial' | 'loading' | 'ready'>('initial');
  useEffect(() => {
    const criticalReady = dataStates[0];
    const allReady = dataStates.every(Boolean);
    if (allReady) setLoadingState('ready');
    else if (criticalReady) setLoadingState('loading');
    else setLoadingState('initial');
  }, [dataStates]);
  return loadingState;
};

interface FastPageLoaderProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  message?: string;
  maxDuration?: number;
}

export const FastPageLoader: React.FC<FastPageLoaderProps> = memo(({ isLoading, skeleton, children }) => {
  if (isLoading) return <>{skeleton}</>;
  return <>{children}</>;
});
FastPageLoader.displayName = 'FastPageLoader';

export const LazyImage = memo(({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && <SpeedShimmerBar className="absolute inset-0" />}
      <img
        src={src} alt={alt}
        className={`transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)} onError={() => setError(true)}
        loading="lazy" decoding="async" {...props}
      />
    </div>
  );
});
LazyImage.displayName = 'LazyImage';

export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return { ref: setRef, isVisible };
};

export const DeferredContent = memo(({ children, delay = 100, fallback = null }: { 
  children: React.ReactNode; delay?: number; fallback?: React.ReactNode;
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

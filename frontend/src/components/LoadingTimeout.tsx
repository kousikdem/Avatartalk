import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingTimeoutProps {
  isLoading: boolean;
  timeout?: number;
  onRetry: () => void;
  message?: string;
}

/**
 * Loading Timeout Component
 * Shows error message after 8 seconds of loading
 */
export function LoadingTimeout({
  isLoading,
  timeout = 8000,
  onRetry,
  message = 'Something went wrong. Please try again.',
}: LoadingTimeoutProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  if (!showTimeout) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md p-8 space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Loading Taking Too Long</h2>
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}

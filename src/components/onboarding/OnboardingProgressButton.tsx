import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { ONBOARDING_STEPS } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProgressButtonProps {
  onOpenOnboarding?: () => void;
}

const OnboardingProgressButton: React.FC<OnboardingProgressButtonProps> = ({ onOpenOnboarding }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<{ completed: number; total: number; isCompleted: boolean } | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_onboarding')
        .select('completed_steps, is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const completed = (data.completed_steps as string[]) || [];
        setProgress({
          completed: completed.length,
          total: ONBOARDING_STEPS.length,
          isCompleted: data.is_completed || false,
        });
      } else {
        setProgress({ completed: 0, total: ONBOARDING_STEPS.length, isCompleted: false });
      }
    };
    fetchProgress();
    
    // Refetch every 5s when modal might be open
    const interval = setInterval(fetchProgress, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (!progress) return null;

  const percentage = progress.isCompleted ? 100 : Math.round((progress.completed / progress.total) * 100);
  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = progress.isCompleted;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={onOpenOnboarding}
          className={cn(
            "relative h-9 gap-1.5 px-2 rounded-full transition-all duration-300",
            isComplete 
              ? "hover:bg-green-50 text-green-700" 
              : "hover:bg-blue-50 text-blue-700"
          )}
        >
          {/* SVG circular progress */}
          <div className="relative w-8 h-8 shrink-0">
            <svg className="absolute inset-0 w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
              <motion.circle
                cx="18" cy="18" r="14" fill="none"
                stroke={isComplete ? "hsl(142, 71%, 45%)" : "url(#progressGradient)"}
                strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
                  <stop offset="100%" stopColor="hsl(263, 70%, 50%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {isComplete ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <Rocket className="w-3.5 h-3.5 text-green-600" />
                </motion.div>
              ) : (
                <span className="text-[9px] font-bold">{percentage}%</span>
              )}
            </div>
          </div>
          {/* Text label */}
          <span className="hidden sm:inline text-[11px] font-semibold whitespace-nowrap">
            {isComplete ? 'Setup ✓' : 'Quick Setup'}
          </span>
          {!isComplete && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden sm:block"
            >
              <Sparkles className="w-3 h-3 text-purple-500" />
            </motion.div>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">{isComplete ? 'Quick Setup — Complete ✓' : `Quick Setup — ${percentage}% complete`}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default OnboardingProgressButton;
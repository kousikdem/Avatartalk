import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { ONBOARDING_STEPS } from '@/hooks/useOnboarding';
import OnboardingFlow from './OnboardingFlow';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const OnboardingProgressButton: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<{ completed: number; total: number; isCompleted: boolean } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        // No onboarding record yet — show 0% progress
        setProgress({
          completed: 0,
          total: ONBOARDING_STEPS.length,
          isCompleted: false,
        });
      }
    };
    fetchProgress();
  }, [user, showOnboarding]); // Refetch when modal closes

  if (!progress) return null;

  const percentage = progress.isCompleted ? 100 : Math.round((progress.completed / progress.total) * 100);
  const circumference = 2 * Math.PI * 14; // radius = 14
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = progress.isCompleted;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOnboarding(true)}
            className={cn(
              "relative h-9 w-9 rounded-full",
              isComplete ? "hover:bg-green-50" : "hover:bg-blue-50"
            )}
          >
            {/* SVG circular progress */}
            <svg className="absolute inset-0 w-9 h-9 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="2.5"
              />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke={isComplete ? "hsl(142, 71%, 45%)" : "url(#progressGradient)"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
                  <stop offset="100%" stopColor="hsl(263, 70%, 50%)" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center content */}
            {isComplete ? (
              <Rocket className="relative z-10 w-3.5 h-3.5 text-green-600" />
            ) : (
              <span className="relative z-10 text-[9px] font-bold text-blue-700">
                {percentage}%
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{isComplete ? 'Quick Setup — Complete ✓' : `Quick Setup — ${percentage}% complete`}</p>
        </TooltipContent>
      </Tooltip>

      {showOnboarding && (
        <OnboardingFlow
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          isModal
        />
      )}
    </>
  );
};

export default OnboardingProgressButton;

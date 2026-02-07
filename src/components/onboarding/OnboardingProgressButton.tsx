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
      }
    };
    fetchProgress();
  }, [user, showOnboarding]); // Refetch when modal closes

  if (!progress || progress.isCompleted) return null;

  const percentage = Math.round((progress.completed / progress.total) * 100);
  const circumference = 2 * Math.PI * 14; // radius = 14
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOnboarding(true)}
            className="relative h-9 w-9 rounded-full hover:bg-blue-50"
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
                stroke="url(#progressGradient)"
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
            <span className="relative z-10 text-[9px] font-bold text-blue-700">
              {percentage}%
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Quick Setup — {percentage}% complete</p>
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

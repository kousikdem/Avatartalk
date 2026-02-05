import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ONBOARDING_STEPS, OnboardingStep } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  children: React.ReactNode;
  onSkip?: () => void;
  showSkip?: boolean;
  title?: string;
  subtitle?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  completedSteps,
  skippedSteps,
  children,
  onSkip,
  showSkip = true,
  title,
  subtitle,
}) => {
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.key === currentStep);
  const progress = ((currentIndex) / (ONBOARDING_STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  {currentIndex + 1}
                </span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">
                  {title || ONBOARDING_STEPS[currentIndex]?.label}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {subtitle || ONBOARDING_STEPS[currentIndex]?.description}
                </p>
              </div>
            </div>
            
            {showSkip && onSkip && currentStep !== 'pricing' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2" />

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4 overflow-x-auto pb-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.key);
              const isSkipped = skippedSteps.includes(step.key);
              const isCurrent = step.key === currentStep;
              const isPast = index < currentIndex;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex flex-col items-center min-w-[80px]",
                    isCurrent && "scale-105"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground",
                      isSkipped && "bg-muted text-muted-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted && !isSkipped && !isCurrent && isPast && "bg-muted text-muted-foreground",
                      !isCompleted && !isSkipped && !isCurrent && !isPast && "bg-muted/50 text-muted-foreground/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1 text-center whitespace-nowrap",
                      isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-48 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;

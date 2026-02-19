import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, SkipForward, User, Sparkles, Brain, Settings, Link2, Package, Video, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ONBOARDING_STEPS, OnboardingStep } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

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

const stepIcons: Record<string, React.ReactNode> = {
  user: <User className="w-4 h-4" />,
  sparkles: <Sparkles className="w-4 h-4" />,
  brain: <Brain className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  link: <Link2 className="w-4 h-4" />,
  package: <Package className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  crown: <Crown className="w-4 h-4" />,
};

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Top row: Logo + Skip */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AvatarTalk.Co
              </span>
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                <span className="text-xs text-blue-200">Step {currentIndex + 1} of {ONBOARDING_STEPS.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {showSkip && onSkip && currentStep !== 'pricing' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-blue-200 hover:text-white hover:bg-white/10"
                >
                  <SkipForward className="w-4 h-4 mr-1.5" />
                  Skip
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mb-3">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-1 scrollbar-none">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.key);
              const isSkipped = skippedSteps.includes(step.key);
              const isCurrent = step.key === currentStep;
              const isPast = index < currentIndex;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex flex-col items-center min-w-[64px] transition-all duration-300",
                    isCurrent && "scale-105"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs",
                      isCompleted && "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/20",
                      isSkipped && "bg-white/10 text-blue-300",
                      isCurrent && "bg-gradient-to-br from-blue-400 to-purple-500 text-white ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/30",
                      !isCompleted && !isSkipped && !isCurrent && isPast && "bg-white/10 text-blue-300",
                      !isCompleted && !isSkipped && !isCurrent && !isPast && "bg-white/5 text-white/30"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      stepIcons[step.icon] || <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-1 text-center whitespace-nowrap leading-tight",
                      isCurrent ? "text-blue-300 font-medium" : "text-white/40"
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
      <div className="pt-40 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Step title */}
          <motion.div 
            key={`title-${currentStep}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              {title || ONBOARDING_STEPS[currentIndex]?.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle || ONBOARDING_STEPS[currentIndex]?.description}
            </p>
          </motion.div>

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

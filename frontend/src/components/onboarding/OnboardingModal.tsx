import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, SkipForward, User, Sparkles, Brain, Settings, Link2, Package, Video, Crown, X, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ONBOARDING_STEPS, OnboardingStep } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  children: React.ReactNode;
  onSkip?: () => void;
  onGoToStep?: (step: OnboardingStep) => void;
  onBack?: () => void;
  showSkip?: boolean;
  isFirstTime?: boolean;
}

const stepIcons: Record<string, React.ReactNode> = {
  user: <User className="w-3.5 h-3.5" />,
  sparkles: <Sparkles className="w-3.5 h-3.5" />,
  brain: <Brain className="w-3.5 h-3.5" />,
  settings: <Settings className="w-3.5 h-3.5" />,
  link: <Link2 className="w-3.5 h-3.5" />,
  package: <Package className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  crown: <Crown className="w-3.5 h-3.5" />,
};

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  completedSteps,
  skippedSteps,
  children,
  onSkip,
  onGoToStep,
  onBack,
  showSkip = true,
  isFirstTime = false,
}) => {
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.key === currentStep);
  const progress = ((completedSteps.length) / ONBOARDING_STEPS.length) * 100;
  const [voicePlayed, setVoicePlayed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice greeting on first open
  useEffect(() => {
    if (isOpen && isFirstTime && !voicePlayed && !isMuted) {
      const timer = setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance('Setup AI Avatar Bio Link in 60 seconds');
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 0.7;
          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
          setVoicePlayed(true);
        } catch (e) {
          console.log('Speech synthesis not available');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isFirstTime, voicePlayed, isMuted]);

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
    setIsMuted(!isMuted);
  };

  const canGoBack = currentIndex > 0;
  const handleBack = () => {
    if (canGoBack && onBack) {
      onBack();
    }
  };

  // First-time users can only click on completed/skipped steps, not jump ahead
  // Returning users (isFirstTime=false) can click any step
  const canClickStep = (step: typeof ONBOARDING_STEPS[0], index: number) => {
    if (!isFirstTime) return true; // returning users can click any step
    const isCompleted = completedSteps.includes(step.key);
    const isSkipped = skippedSteps.includes(step.key);
    const isCurrent = step.key === currentStep;
    return isCompleted || isSkipped || isCurrent;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
        onClick={(e) => {
          // Don't allow closing by clicking outside for first-time users
          if (e.target === e.currentTarget && !isFirstTime) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-4 sm:px-6 py-3 shrink-0">
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:inline">
                  AvatarTalk.Co
                </span>
              </div>

              {/* Center tagline */}
              <div className="hidden sm:flex items-center gap-2">
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm font-medium text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text"
                >
                  ⚡ Setup AI Avatar Bio Link in 60 Sec
                </motion.p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {showSkip && onSkip && currentStep !== 'pricing' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="text-blue-200 hover:text-white hover:bg-white/10 h-7 text-xs"
                  >
                    <SkipForward className="w-3 h-3 mr-1" />
                    Skip
                  </Button>
                )}
                {/* Only show close button for returning users */}
                {!isFirstTime && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile tagline */}
            <div className="sm:hidden mb-2">
              <p className="text-[11px] font-medium text-center text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text">
                ⚡ Setup AI Avatar Bio Link in 60 Sec
              </p>
            </div>

            {/* Progress bar */}
            <div className="relative mb-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-blue-300/70">{Math.round(progress)}% Complete</span>
                <span className="text-[10px] text-blue-300/70">Step {currentIndex + 1}/{ONBOARDING_STEPS.length}</span>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-between overflow-x-auto pb-1 gap-0.5 scrollbar-none">
              {ONBOARDING_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.key);
                const isSkipped = skippedSteps.includes(step.key);
                const isCurrent = step.key === currentStep;
                const isClickable = canClickStep(step, index);

                return (
                  <button
                    key={step.key}
                    onClick={() => isClickable && onGoToStep?.(step.key)}
                    disabled={!isClickable}
                    className={cn(
                      "flex flex-col items-center min-w-[52px] transition-all duration-300 group",
                      isClickable ? "cursor-pointer" : "cursor-default opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                        isCompleted && "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/20",
                        isSkipped && "bg-white/10 text-blue-300",
                        isCurrent && "bg-gradient-to-br from-blue-400 to-purple-500 text-white ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/30",
                        !isCompleted && !isSkipped && !isCurrent && "bg-white/5 text-white/30",
                        isClickable && "group-hover:scale-110"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        stepIcons[step.icon] || <Circle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] mt-0.5 text-center whitespace-nowrap leading-tight",
                        isCurrent ? "text-blue-300 font-medium" : "text-white/40"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <motion.div
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                {ONBOARDING_STEPS[currentIndex]?.label}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ONBOARDING_STEPS[currentIndex]?.description}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom bar with Back button */}
          {canGoBack && (
            <div className="shrink-0 border-t border-slate-200 bg-white px-4 sm:px-6 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;

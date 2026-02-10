import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding, OnboardingStep, ONBOARDING_STEPS } from '@/hooks/useOnboarding';
import OnboardingModal from './OnboardingModal';
import PersonalInfoStep from './steps/PersonalInfoStep';
import AvatarStep from './steps/AvatarStep';
import AITrainingStep from './steps/AITrainingStep';
import AISettingsStep from './steps/AISettingsStep';
import SocialLinksStep from './steps/SocialLinksStep';
import ProductsStep from './steps/ProductsStep';
import VirtualCollaborationStep from './steps/VirtualCollaborationStep';
import PricingStep from './steps/PricingStep';
import ShareModal from '@/components/ShareModal';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingFlowProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen = true, onClose, isModal = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentStep,
    completedSteps,
    skippedSteps,
    completeStep,
    skipStep,
    goToStep,
    finishOnboarding,
    loading,
    onboardingState,
  } = useOnboarding();

  const [showShareModal, setShowShareModal] = useState(false);
  const [username, setUsername] = useState('');

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate('/settings/dashboard');
    }
  }, [onClose, navigate]);

  const showShareAndClose = useCallback(async () => {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      setUsername(profile?.username || 'user');
    }
    setShowShareModal(true);
  }, [user]);

  const handleCompleteStep = useCallback(async (data?: Record<string, unknown>) => {
    try {
      const nextStep = await completeStep(currentStep, data);
      // Don't auto-complete on pricing - pricing step handles its own flow
      if (currentStep === 'pricing') {
        // Pricing step calls onComplete after payment
        return;
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  }, [currentStep, completeStep]);

  const handlePricingComplete = useCallback(async (planKey?: string) => {
    try {
      await completeStep('pricing');
      await finishOnboarding();
      // Show share popup after plan is activated
      await showShareAndClose();
    } catch (error) {
      console.error('Error completing pricing:', error);
    }
  }, [completeStep, finishOnboarding, showShareAndClose]);

  const handleSkipStep = useCallback(async () => {
    try {
      const nextStep = await skipStep(currentStep);
      if (currentStep === 'pricing' || nextStep === undefined) {
        await finishOnboarding();
        await showShareAndClose();
      }
    } catch (error) {
      console.error('Error skipping step:', error);
    }
  }, [currentStep, skipStep, finishOnboarding, showShareAndClose]);

  const handleBack = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      goToStep(ONBOARDING_STEPS[currentIndex - 1].key);
    }
  }, [currentStep, goToStep]);

  const handleShareClose = () => {
    setShowShareModal(false);
    handleClose();
  };

  if (loading) {
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'personal_info':
        return <PersonalInfoStep onComplete={handleCompleteStep} />;
      case 'avatar':
        return <AvatarStep onComplete={() => handleCompleteStep()} />;
      case 'ai_training':
        return <AITrainingStep onComplete={() => handleCompleteStep()} />;
      case 'ai_settings':
        return <AISettingsStep onComplete={() => handleCompleteStep()} />;
      case 'social_links':
        return <SocialLinksStep onComplete={() => handleCompleteStep()} />;
      case 'products':
        return <ProductsStep onComplete={() => handleCompleteStep()} />;
      case 'virtual_collaboration':
        return <VirtualCollaborationStep onComplete={() => handleCompleteStep()} />;
      case 'pricing':
        return <PricingStep onComplete={handlePricingComplete} />;
      default:
        return <PersonalInfoStep onComplete={handleCompleteStep} />;
    }
  };

  const profileUrl = username
    ? `${window.location.origin}/${username}`
    : window.location.origin;

  // First time = no completed steps and not opened as modal from button
  const isFirstTime = completedSteps.length === 0 && skippedSteps.length === 0 && !isModal;

  return (
    <>
      <OnboardingModal
        isOpen={isOpen}
        onClose={handleClose}
        currentStep={currentStep}
        completedSteps={completedSteps}
        skippedSteps={skippedSteps}
        onSkip={handleSkipStep}
        onGoToStep={goToStep}
        onBack={handleBack}
        showSkip={currentStep !== 'pricing'}
        isFirstTime={isFirstTime}
      >
        {renderStep()}
      </OnboardingModal>

      <ShareModal
        isOpen={showShareModal}
        onClose={handleShareClose}
        profileUrl={profileUrl}
        username={username}
      />
    </>
  );
};

export default OnboardingFlow;
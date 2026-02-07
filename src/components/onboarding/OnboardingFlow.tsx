import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';
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

  const handleCompleteStep = useCallback(async (data?: Record<string, unknown>) => {
    try {
      const nextStep = await completeStep(currentStep, data);
      if (currentStep === 'pricing' || nextStep === undefined) {
        await finishOnboarding();
        // Fetch username for share modal
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          setUsername(profile?.username || 'user');
        }
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  }, [currentStep, completeStep, finishOnboarding, user]);

  const handleSkipStep = useCallback(async () => {
    try {
      const nextStep = await skipStep(currentStep);
      if (currentStep === 'pricing' || nextStep === undefined) {
        await finishOnboarding();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          setUsername(profile?.username || 'user');
        }
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error skipping step:', error);
    }
  }, [currentStep, skipStep, finishOnboarding, user]);

  const handleShareClose = () => {
    setShowShareModal(false);
    handleClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading your setup...</p>
        </div>
      </div>
    );
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
        return <PricingStep onComplete={() => handleCompleteStep()} />;
      default:
        return <PersonalInfoStep onComplete={handleCompleteStep} />;
    }
  };

  const profileUrl = username
    ? `${window.location.origin}/${username}`
    : window.location.origin;

  // For first-time (non-modal) flow, check if completedSteps is empty
  const isFirstTime = completedSteps.length === 0 && !isModal;

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

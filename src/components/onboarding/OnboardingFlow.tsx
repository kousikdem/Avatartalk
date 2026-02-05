import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding, ONBOARDING_STEPS, OnboardingStep } from '@/hooks/useOnboarding';
import OnboardingLayout from './OnboardingLayout';
import PersonalInfoStep from './steps/PersonalInfoStep';
import AvatarStep from './steps/AvatarStep';
import AITrainingStep from './steps/AITrainingStep';
import SocialLinksStep from './steps/SocialLinksStep';
import ProductsStep from './steps/ProductsStep';
import VirtualCollaborationStep from './steps/VirtualCollaborationStep';
import PricingStep from './steps/PricingStep';
import { Loader2 } from 'lucide-react';

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    completedSteps,
    skippedSteps,
    completeStep,
    skipStep,
    finishOnboarding,
    loading,
  } = useOnboarding();

  const handleCompleteStep = useCallback(async (data?: Record<string, unknown>) => {
    try {
      const nextStep = await completeStep(currentStep, data);
      if (currentStep === 'pricing' || nextStep === undefined) {
        await finishOnboarding();
        navigate('/settings/dashboard');
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  }, [currentStep, completeStep, finishOnboarding, navigate]);

  const handleSkipStep = useCallback(async () => {
    try {
      const nextStep = await skipStep(currentStep);
      if (currentStep === 'pricing' || nextStep === undefined) {
        await finishOnboarding();
        navigate('/settings/dashboard');
      }
    } catch (error) {
      console.error('Error skipping step:', error);
    }
  }, [currentStep, skipStep, finishOnboarding, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  return (
    <OnboardingLayout
      currentStep={currentStep}
      completedSteps={completedSteps}
      skippedSteps={skippedSteps}
      onSkip={handleSkipStep}
      showSkip={currentStep !== 'pricing'}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default OnboardingFlow;

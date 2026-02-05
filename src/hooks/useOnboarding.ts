import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

export type OnboardingStep = 
  | 'personal_info' 
  | 'avatar' 
  | 'ai_training' 
  | 'social_links' 
  | 'products' 
  | 'virtual_collaboration'
  | 'pricing';

interface OnboardingState {
  id: string;
  user_id: string;
  completed_steps: OnboardingStep[];
  current_step: OnboardingStep;
  is_completed: boolean;
  skipped_steps: OnboardingStep[];
  personal_info_data: Record<string, unknown>;
}

export const ONBOARDING_STEPS: { key: OnboardingStep; label: string; description: string }[] = [
  { key: 'personal_info', label: 'Personal Info', description: 'Tell us about yourself' },
  { key: 'avatar', label: 'Avatar', description: 'Create your digital avatar' },
  { key: 'ai_training', label: 'AI Training', description: 'Set up your AI assistant' },
  { key: 'social_links', label: 'Social Links', description: 'Connect your social profiles' },
  { key: 'products', label: 'Products', description: 'Add your first product' },
  { key: 'virtual_collaboration', label: 'Virtual Collaboration', description: 'Set up virtual meetings' },
  { key: 'pricing', label: 'Choose Plan', description: 'Select your pricing plan' },
];

export const useOnboarding = () => {
  const { user } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboardingState = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setOnboardingState({
          ...data,
          completed_steps: (data.completed_steps as OnboardingStep[]) || [],
          current_step: (data.current_step as OnboardingStep) || 'personal_info',
          skipped_steps: (data.skipped_steps as OnboardingStep[]) || [],
          personal_info_data: (data.personal_info_data as Record<string, unknown>) || {},
        });
      } else {
        // Create new onboarding record
        const { data: newData, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;

        setOnboardingState({
          ...newData,
          completed_steps: [],
          current_step: 'personal_info',
          skipped_steps: [],
          personal_info_data: {},
        });
      }
    } catch (err) {
      console.error('Error fetching onboarding state:', err);
      setError('Failed to load onboarding state');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOnboardingState();
  }, [fetchOnboardingState]);

  const completeStep = useCallback(async (step: OnboardingStep, data?: Record<string, unknown>) => {
    if (!user || !onboardingState) return;

    const completedSteps = [...new Set([...onboardingState.completed_steps, step])];
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.key === step);
    const nextStep = ONBOARDING_STEPS[currentIndex + 1]?.key || 'pricing';
    const isCompleted = completedSteps.length >= ONBOARDING_STEPS.length - 1; // Exclude pricing from completion count

    try {
      const updateData: Record<string, unknown> = {
        completed_steps: completedSteps,
        current_step: nextStep,
        is_completed: isCompleted,
      };

      if (data && step === 'personal_info') {
        updateData.personal_info_data = data;
      }

      const { error: updateError } = await supabase
        .from('user_onboarding')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setOnboardingState(prev => prev ? {
        ...prev,
        completed_steps: completedSteps,
        current_step: nextStep,
        is_completed: isCompleted,
        personal_info_data: data && step === 'personal_info' ? data : prev.personal_info_data,
      } : null);

      return nextStep;
    } catch (err) {
      console.error('Error completing step:', err);
      throw err;
    }
  }, [user, onboardingState]);

  const skipStep = useCallback(async (step: OnboardingStep) => {
    if (!user || !onboardingState) return;

    const skippedSteps = [...new Set([...onboardingState.skipped_steps, step])];
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.key === step);
    const nextStep = ONBOARDING_STEPS[currentIndex + 1]?.key || 'pricing';

    try {
      const { error: updateError } = await supabase
        .from('user_onboarding')
        .update({
          skipped_steps: skippedSteps,
          current_step: nextStep,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setOnboardingState(prev => prev ? {
        ...prev,
        skipped_steps: skippedSteps,
        current_step: nextStep,
      } : null);

      return nextStep;
    } catch (err) {
      console.error('Error skipping step:', err);
      throw err;
    }
  }, [user, onboardingState]);

  const goToStep = useCallback(async (step: OnboardingStep) => {
    if (!user || !onboardingState) return;

    try {
      const { error: updateError } = await supabase
        .from('user_onboarding')
        .update({ current_step: step })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setOnboardingState(prev => prev ? { ...prev, current_step: step } : null);
    } catch (err) {
      console.error('Error navigating to step:', err);
      throw err;
    }
  }, [user, onboardingState]);

  const finishOnboarding = useCallback(async () => {
    if (!user || !onboardingState) return;

    try {
      const { error: updateError } = await supabase
        .from('user_onboarding')
        .update({ is_completed: true })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setOnboardingState(prev => prev ? { ...prev, is_completed: true } : null);
    } catch (err) {
      console.error('Error finishing onboarding:', err);
      throw err;
    }
  }, [user, onboardingState]);

  const needsOnboarding = !loading && user && onboardingState && !onboardingState.is_completed;

  return {
    onboardingState,
    loading,
    error,
    needsOnboarding,
    currentStep: onboardingState?.current_step || 'personal_info',
    completedSteps: onboardingState?.completed_steps || [],
    skippedSteps: onboardingState?.skipped_steps || [],
    completeStep,
    skipStep,
    goToStep,
    finishOnboarding,
    refetch: fetchOnboardingState,
  };
};

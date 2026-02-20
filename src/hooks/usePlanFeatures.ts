import { useMemo } from 'react';
import { useUserPlatformSubscription } from './usePlatformPricingPlans';

export type PlanFeatureKey = 
  | 'payments_enabled'
  | 'voice_clone_enabled' 
  | 'virtual_meetings_enabled'
  | 'advanced_analytics'
  | 'api_access'
  | 'digital_products_enabled'
  | 'physical_products_enabled'
  | 'promo_codes_enabled'
  | 'subscription_button_enabled'
  | 'multi_currency_enabled'
  | 'earnings_analytics'
  | 'zoom_integration'
  | 'google_calendar_readonly'
  | 'google_calendar_full'
  | 'team_enabled'
  | 'multiple_admins'
  | 'multilingual_ai'
  | 'priority_ai_processing'
  | 'unlimited_training_sources'
  | 'multiple_avatars_per_profile'
  | 'events_enabled'
  | 'brand_collaborations'
  | 'paid_events_enabled'
  | 'visitors_list'
  | 'avatar_upload_enabled'
  | 'ai_topics_enabled'
  | 'ai_followups_enabled'
  | 'ai_voice_training_enabled'
  | 'ai_webscraper_enabled'
  | 'analytics_enabled';

// Define which plan unlocks each feature
const featurePlanRequirements: Record<PlanFeatureKey, string> = {
  payments_enabled: 'creator',
  digital_products_enabled: 'creator',
  promo_codes_enabled: 'creator',
  subscription_button_enabled: 'creator',
  zoom_integration: 'creator',
  google_calendar_readonly: 'creator',
  avatar_upload_enabled: 'creator',
  ai_topics_enabled: 'creator',
  analytics_enabled: 'creator',
  voice_clone_enabled: 'pro',
  virtual_meetings_enabled: 'pro',
  advanced_analytics: 'pro',
  earnings_analytics: 'pro',
  google_calendar_full: 'pro',
  events_enabled: 'pro',
  multilingual_ai: 'pro',
  ai_followups_enabled: 'pro',
  ai_voice_training_enabled: 'pro',
  ai_webscraper_enabled: 'pro',
  physical_products_enabled: 'business',
  multi_currency_enabled: 'business',
  api_access: 'business',
  team_enabled: 'business',
  multiple_admins: 'business',
  priority_ai_processing: 'business',
  unlimited_training_sources: 'business',
  multiple_avatars_per_profile: 'business',
  brand_collaborations: 'business',
  paid_events_enabled: 'business',
  visitors_list: 'business',
};

const planHierarchy: Record<string, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  business: 3,
};

// Plan limits for products, collaborations, and AI training features
export const planLimits: Record<string, { 
  products: number; 
  collaborations: number; 
  tokens: number;
  qa_pairs: number;
  documents: number;
  web_scraper: number;
}> = {
  free: { products: 2, collaborations: 2, tokens: 10000, qa_pairs: 10, documents: 2, web_scraper: 0 },
  creator: { products: 20, collaborations: 20, tokens: 1000000, qa_pairs: 100, documents: 10, web_scraper: 0 },
  pro: { products: 50, collaborations: 50, tokens: 2000000, qa_pairs: 200, documents: 50, web_scraper: 10 },
  business: { products: -1, collaborations: -1, tokens: 5000000, qa_pairs: -1, documents: -1, web_scraper: 40 }, // -1 = unlimited
};

export const usePlanFeatures = () => {
  const { currentPlan, effectivePlanKey, subscription, isExpired, loading } = useUserPlatformSubscription();

  const planLevel = useMemo(() => {
    if (isExpired) return 0;
    return planHierarchy[effectivePlanKey] || 0;
  }, [effectivePlanKey, isExpired]);

  const hasFeature = (featureKey: PlanFeatureKey): boolean => {
    if (loading) return false;
    
    const requiredPlan = featurePlanRequirements[featureKey];
    const requiredLevel = planHierarchy[requiredPlan] || 0;
    
    return planLevel >= requiredLevel;
  };

  const getRequiredPlanForFeature = (featureKey: PlanFeatureKey): string => {
    return featurePlanRequirements[featureKey] || 'free';
  };

  const limits = useMemo(() => {
    return planLimits[effectivePlanKey] || planLimits.free;
  }, [effectivePlanKey]);

  const canAddProduct = (currentCount: number): boolean => {
    if (limits.products === -1) return true; // Unlimited
    return currentCount < limits.products;
  };

  const canAddCollaboration = (currentCount: number): boolean => {
    if (limits.collaborations === -1) return true; // Unlimited
    return currentCount < limits.collaborations;
  };

  const canAddQAPair = (currentCount: number): boolean => {
    if (limits.qa_pairs === -1) return true; // Unlimited
    return currentCount < limits.qa_pairs;
  };

  const canAddDocument = (currentCount: number): boolean => {
    if (limits.documents === -1) return true; // Unlimited
    return currentCount < limits.documents;
  };

  const canAddWebScraper = (currentCount: number): boolean => {
    if (limits.web_scraper === -1) return true; // Unlimited
    return currentCount < limits.web_scraper;
  };

  const getRemainingProducts = (currentCount: number): number | 'unlimited' => {
    if (limits.products === -1) return 'unlimited';
    return Math.max(0, limits.products - currentCount);
  };

  const getRemainingCollaborations = (currentCount: number): number | 'unlimited' => {
    if (limits.collaborations === -1) return 'unlimited';
    return Math.max(0, limits.collaborations - currentCount);
  };

  const getRemainingQAPairs = (currentCount: number): number | 'unlimited' => {
    if (limits.qa_pairs === -1) return 'unlimited';
    return Math.max(0, limits.qa_pairs - currentCount);
  };

  const getRemainingDocuments = (currentCount: number): number | 'unlimited' => {
    if (limits.documents === -1) return 'unlimited';
    return Math.max(0, limits.documents - currentCount);
  };

  const getRemainingWebScrapers = (currentCount: number): number | 'unlimited' => {
    if (limits.web_scraper === -1) return 'unlimited';
    return Math.max(0, limits.web_scraper - currentCount);
  };

  const canSellProducts = useMemo(() => hasFeature('payments_enabled'), [planLevel, loading]);
  const canSellDigitalProducts = useMemo(() => hasFeature('digital_products_enabled'), [planLevel, loading]);
  const canSellPhysicalProducts = useMemo(() => hasFeature('physical_products_enabled'), [planLevel, loading]);
  const canCreatePaidPosts = useMemo(() => hasFeature('payments_enabled'), [planLevel, loading]);
  const canUseVoiceClone = useMemo(() => hasFeature('voice_clone_enabled'), [planLevel, loading]);
  const canHostVirtualMeetings = useMemo(() => hasFeature('virtual_meetings_enabled'), [planLevel, loading]);
  const canViewAdvancedAnalytics = useMemo(() => hasFeature('advanced_analytics'), [planLevel, loading]);
  const canAccessAPI = useMemo(() => hasFeature('api_access'), [planLevel, loading]);
  const canViewVisitorsList = useMemo(() => hasFeature('visitors_list'), [planLevel, loading]);
  const canCreateEvents = useMemo(() => hasFeature('events_enabled'), [planLevel, loading]);
  const canCreatePaidEvents = useMemo(() => hasFeature('paid_events_enabled'), [planLevel, loading]);
  const canUseAITopics = useMemo(() => hasFeature('ai_topics_enabled'), [planLevel, loading]);
  const canUseAIFollowups = useMemo(() => hasFeature('ai_followups_enabled'), [planLevel, loading]);
  const canUseAIVoiceTraining = useMemo(() => hasFeature('ai_voice_training_enabled'), [planLevel, loading]);
  const canUseWebScraper = useMemo(() => hasFeature('ai_webscraper_enabled'), [planLevel, loading]);
  const canAccessAnalytics = useMemo(() => hasFeature('analytics_enabled'), [planLevel, loading]);

  return {
    loading,
    effectivePlanKey,
    currentPlan,
    subscription,
    isExpired,
    planLevel,
    hasFeature,
    getRequiredPlanForFeature,
    // Plan limits
    limits,
    canAddProduct,
    canAddCollaboration,
    canAddQAPair,
    canAddDocument,
    canAddWebScraper,
    getRemainingProducts,
    getRemainingCollaborations,
    getRemainingQAPairs,
    getRemainingDocuments,
    getRemainingWebScrapers,
    // Convenient boolean checks
    canSellProducts,
    canSellDigitalProducts,
    canSellPhysicalProducts,
    canCreatePaidPosts,
    canUseVoiceClone,
    canHostVirtualMeetings,
    canViewAdvancedAnalytics,
    canAccessAPI,
    canViewVisitorsList,
    canCreateEvents,
    canCreatePaidEvents,
    canUseAITopics,
    canUseAIFollowups,
    canUseAIVoiceTraining,
    canUseWebScraper,
    canAccessAnalytics,
  };
};

export default usePlanFeatures;

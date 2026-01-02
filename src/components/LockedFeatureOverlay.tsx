import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowUp, Zap, Crown, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlanFeatures, PlanFeatureKey } from '@/hooks/usePlanFeatures';

interface LockedFeatureOverlayProps {
  feature?: PlanFeatureKey;
  requiredPlan?: 'creator' | 'pro' | 'business';
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  creator: Zap,
  pro: Crown,
  business: Rocket,
};

const planColors: Record<string, string> = {
  creator: 'from-blue-500 to-purple-500',
  pro: 'from-purple-500 to-pink-500',
  business: 'from-orange-500 to-red-500',
};

export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  feature,
  requiredPlan,
  title = 'Feature Locked',
  description,
  children,
}) => {
  const navigate = useNavigate();
  const { hasFeature, getRequiredPlanForFeature, loading } = usePlanFeatures();

  if (loading) {
    return <>{children}</>;
  }

  const isLocked = feature ? !hasFeature(feature) : false;
  const planRequired = feature ? getRequiredPlanForFeature(feature) : requiredPlan || 'creator';
  const PlanIcon = planIcons[planRequired] || Zap;
  const gradient = planColors[planRequired] || planColors.creator;

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {description || `Upgrade to the ${planRequired.charAt(0).toUpperCase() + planRequired.slice(1)} plan to unlock this feature.`}
          </p>
          <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 mb-4`}>
            <PlanIcon className="w-3 h-3 mr-1" />
            {planRequired.charAt(0).toUpperCase() + planRequired.slice(1)} Plan Required
          </Badge>
          <Button
            onClick={() => navigate('/pricing')}
            className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white`}
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};

interface LimitReachedBannerProps {
  currentCount: number;
  limit: number | 'unlimited';
  itemName: string;
  planForMore: string;
}

export const LimitReachedBanner: React.FC<LimitReachedBannerProps> = ({
  currentCount,
  limit,
  itemName,
  planForMore,
}) => {
  const navigate = useNavigate();

  if (limit === 'unlimited' || currentCount < (limit as number)) {
    return null;
  }

  const PlanIcon = planIcons[planForMore] || Zap;
  const gradient = planColors[planForMore] || planColors.creator;

  return (
    <div className={`p-4 rounded-lg bg-gradient-to-r ${gradient} text-white mb-4`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5" />
          <div>
            <p className="font-medium">
              {itemName} Limit Reached ({currentCount}/{limit})
            </p>
            <p className="text-sm text-white/80">
              Upgrade to {planForMore.charAt(0).toUpperCase() + planForMore.slice(1)} for more
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/pricing')}
          className="bg-white text-gray-900 hover:bg-gray-100"
        >
          <PlanIcon className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      </div>
    </div>
  );
};

export default LockedFeatureOverlay;

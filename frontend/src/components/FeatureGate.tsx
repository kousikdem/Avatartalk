import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';
import { usePlanFeatures, PlanFeatureKey } from '@/hooks/usePlanFeatures';

interface FeatureGateProps {
  feature: PlanFeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  featureLabel?: string;
}

const planLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  creator: { label: 'Creator', icon: Zap },
  pro: { label: 'Pro', icon: Crown },
  business: { label: 'Business', icon: Rocket },
};

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  featureLabel,
}) => {
  const navigate = useNavigate();
  const { hasFeature, getRequiredPlanForFeature, loading } = usePlanFeatures();

  if (loading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg h-20" />
    );
  }

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const requiredPlan = getRequiredPlanForFeature(feature);
  const planInfo = planLabels[requiredPlan] || planLabels.creator;
  const PlanIcon = planInfo.icon;

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        
        <h3 className="font-semibold text-lg mb-2">
          {featureLabel || 'This Feature'} is Locked
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Upgrade to the <Badge variant="secondary" className="mx-1">
            <PlanIcon className="w-3 h-3 mr-1" />
            {planInfo.label}
          </Badge> plan to unlock this feature.
        </p>
        
        <Button 
          onClick={() => navigate('/pricing')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
        >
          Upgrade Now
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export const LockedFeatureButton: React.FC<{
  feature: PlanFeatureKey;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}> = ({ feature, children, onClick, className, variant = 'default' }) => {
  const navigate = useNavigate();
  const { hasFeature, getRequiredPlanForFeature, loading } = usePlanFeatures();

  if (loading) {
    return (
      <Button variant={variant} className={className} disabled>
        {children}
      </Button>
    );
  }

  if (hasFeature(feature)) {
    return (
      <Button variant={variant} className={className} onClick={onClick}>
        {children}
      </Button>
    );
  }

  const requiredPlan = getRequiredPlanForFeature(feature);
  const planInfo = planLabels[requiredPlan] || planLabels.creator;

  return (
    <Button 
      variant="outline" 
      className={`${className} relative opacity-75`}
      onClick={() => navigate('/pricing')}
    >
      <Lock className="w-3 h-3 mr-1" />
      {children}
      <Badge variant="secondary" className="ml-2 text-xs">
        {planInfo.label}
      </Badge>
    </Button>
  );
};

export default FeatureGate;

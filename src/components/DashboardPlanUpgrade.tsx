import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, Zap, Rocket, Star, ChevronRight, Coins, 
  Calendar, AlertTriangle 
} from 'lucide-react';
import { useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';
import { useTokens } from '@/hooks/useTokens';
import { format, differenceInDays } from 'date-fns';

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Star,
  creator: Zap,
  pro: Crown,
  business: Rocket,
};

const planGradients: Record<string, string> = {
  free: 'from-slate-400 to-slate-500',
  creator: 'from-blue-500 to-purple-500',
  pro: 'from-purple-500 to-pink-500',
  business: 'from-orange-500 to-red-500',
};

const DashboardPlanUpgrade = () => {
  const navigate = useNavigate();
  const { subscription, currentPlan, effectivePlanKey, isExpired, loading } = useUserPlatformSubscription();
  const { tokenBalance, loading: tokensLoading } = useTokens();

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const PlanIcon = planIcons[effectivePlanKey] || Star;
  const gradient = planGradients[effectivePlanKey] || planGradients.free;
  
  const daysRemaining = subscription?.expires_at 
    ? differenceInDays(new Date(subscription.expires_at), new Date())
    : null;

  const monthlyTokens = currentPlan?.ai_tokens_monthly || 10000;
  const tokenUsagePercent = Math.min((tokenBalance / monthlyTokens) * 100, 100);

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  const nextPlan = effectivePlanKey === 'free' ? 'creator' 
    : effectivePlanKey === 'creator' ? 'pro'
    : effectivePlanKey === 'pro' ? 'business'
    : null;

  return (
    <Card className={`bg-gradient-to-br from-card via-card/95 to-card/90 border-border/50 overflow-hidden relative`}>
      {/* Background gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
              <PlanIcon className="w-4 h-4 text-white" />
            </div>
            <span className="capitalize">{effectivePlanKey} Plan</span>
          </CardTitle>
          {isExpired && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Expired
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subscription Status */}
        {subscription && !isExpired && subscription.expires_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {daysRemaining !== null && daysRemaining > 0 
                ? `${daysRemaining} days remaining`
                : 'Expires today'}
            </span>
            <span className="text-xs">
              ({format(new Date(subscription.expires_at), 'MMM d, yyyy')})
            </span>
          </div>
        )}

        {/* Token Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              AI Tokens
            </span>
            <span className="font-medium">
              {formatTokens(tokenBalance)} / {formatTokens(monthlyTokens)}
            </span>
          </div>
          <Progress value={tokenUsagePercent} className="h-2" />
          {tokenUsagePercent < 20 && (
            <p className="text-xs text-orange-500">
              Running low on tokens! Consider upgrading or buying more.
            </p>
          )}
        </div>

        {/* Current Plan Features Preview */}
        {currentPlan && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Plan includes:</p>
            <div className="flex flex-wrap gap-1">
              {currentPlan.payments_enabled && (
                <Badge variant="outline" className="text-xs">Payments</Badge>
              )}
              {currentPlan.voice_clone_enabled && (
                <Badge variant="outline" className="text-xs">Voice Clone</Badge>
              )}
              {currentPlan.virtual_meetings_enabled && (
                <Badge variant="outline" className="text-xs">Meetings</Badge>
              )}
              {currentPlan.advanced_analytics && (
                <Badge variant="outline" className="text-xs">Analytics</Badge>
              )}
              {currentPlan.api_access && (
                <Badge variant="outline" className="text-xs">API</Badge>
              )}
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        <div className="flex gap-2 pt-2">
          {nextPlan && (
            <Button 
              className={`flex-1 bg-gradient-to-r ${planGradients[nextPlan]} hover:opacity-90`}
              onClick={() => navigate('/pricing')}
            >
              Upgrade to {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/buy-tokens')}
          >
            <Coins className="w-4 h-4 mr-1" />
            Buy Tokens
          </Button>
        </div>

        {effectivePlanKey === 'business' && (
          <p className="text-center text-sm text-muted-foreground">
            You're on our top plan! 🎉
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardPlanUpgrade;

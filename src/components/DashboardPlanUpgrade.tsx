import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, Zap, Rocket, Star, ChevronRight, Coins, 
  Calendar, AlertTriangle, Sparkles, TrendingUp
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

const planBgColors: Record<string, string> = {
  free: 'from-slate-50 to-gray-50 border-slate-200',
  creator: 'from-blue-50 to-purple-50 border-blue-200',
  pro: 'from-purple-50 to-pink-50 border-purple-200',
  business: 'from-orange-50 to-red-50 border-orange-200',
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
  const bgColor = planBgColors[effectivePlanKey] || planBgColors.free;
  
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

  const getBalanceColor = () => {
    if (tokenBalance <= 1000) return 'text-red-600';
    if (tokenBalance <= 10000) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const nextPlan = effectivePlanKey === 'free' ? 'creator' 
    : effectivePlanKey === 'creator' ? 'pro'
    : effectivePlanKey === 'pro' ? 'business'
    : null;

  return (
    <Card className={`bg-gradient-to-br ${bgColor} border overflow-hidden relative`}>
      {/* Background gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
              <PlanIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg capitalize">{effectivePlanKey} Plan</CardTitle>
              {subscription && !isExpired && subscription.expires_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {daysRemaining !== null && daysRemaining > 0 
                    ? `${daysRemaining} days left`
                    : 'Expires today'}
                </p>
              )}
            </div>
          </div>
          {isExpired ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Expired
            </Badge>
          ) : (
            <Badge className={`bg-gradient-to-r ${gradient} text-white border-0`}>
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Token Balance Section */}
        <div className="bg-white/60 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Tokens</p>
                <p className={`text-xl font-bold ${getBalanceColor()}`}>
                  {tokensLoading ? '...' : formatTokens(tokenBalance)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Plan Tokens</p>
              <p className="text-sm font-semibold">{formatTokens(monthlyTokens)}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress 
              value={Math.min(100, (tokenBalance / monthlyTokens) * 100)} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Balance: {formatTokens(tokenBalance)}</span>
              <span>Plan: {formatTokens(monthlyTokens)}</span>
            </div>
          </div>
          
          {tokenBalance <= 10000 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Low balance! Buy more tokens or upgrade your plan.</span>
            </div>
          )}
        </div>

        {/* Plan Features Preview */}
        {currentPlan && (
          <div className="flex flex-wrap gap-1">
            {currentPlan.payments_enabled && (
              <Badge variant="outline" className="text-xs bg-white/50">Payments</Badge>
            )}
            {currentPlan.voice_clone_enabled && (
              <Badge variant="outline" className="text-xs bg-white/50">Voice Clone</Badge>
            )}
            {currentPlan.virtual_meetings_enabled && (
              <Badge variant="outline" className="text-xs bg-white/50">Meetings</Badge>
            )}
            {currentPlan.advanced_analytics && (
              <Badge variant="outline" className="text-xs bg-white/50">Analytics</Badge>
            )}
            {currentPlan.api_access && (
              <Badge variant="outline" className="text-xs bg-white/50">API</Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {nextPlan ? (
            <Button 
              className={`flex-1 bg-gradient-to-r ${planGradients[nextPlan]} hover:opacity-90 text-white shadow-md`}
              onClick={() => navigate('/pricing')}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Upgrade to {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
              🎉 You're on our top plan!
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/buy-tokens')}
            className="bg-white/50 hover:bg-white"
          >
            <Coins className="w-4 h-4 mr-1" />
            Buy Tokens
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPlanUpgrade;

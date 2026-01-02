import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Share2, Crown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import CurrencySelector from './CurrencySelector';
import TokenDisplay from './TokenDisplay';
import PlanBadge from './PlanBadge';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { useToast } from '@/hooks/use-toast';

const DashboardHeaderStrip: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { effectivePlanKey } = usePlanFeatures();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  const handleShare = async () => {
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AvatarTalk Profile',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Profile link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const nextPlan = effectivePlanKey === 'free' ? 'Creator' 
    : effectivePlanKey === 'creator' ? 'Pro'
    : effectivePlanKey === 'pro' ? 'Business'
    : null;

  return (
    <div className="w-full bg-gradient-to-r from-background via-muted/30 to-background border-b border-border/50 px-4 py-2.5 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left section - Plan Badge with Upgrade */}
        <div className="flex items-center gap-2">
          <PlanBadge size="md" showIcon />
          {nextPlan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pricing')}
              className="text-xs text-primary hover:text-primary/80 gap-1 px-2 py-1 h-7"
            >
              <ArrowUp className="w-3 h-3" />
              Upgrade to {nextPlan}
            </Button>
          )}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <CurrencySelector compact />
          <TokenDisplay compact />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 h-8 px-3 bg-muted/50 hover:bg-muted"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Share</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeaderStrip;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFollows } from '@/hooks/useFollows';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Loader2, Check } from 'lucide-react';

interface SubscribeButtonProps {
  targetUserId: string;
  targetUsername: string;
  currentUserId?: string;
  className?: string;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  targetUserId,
  targetUsername,
  currentUserId,
  className = ''
}) => {
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isFollowing, followUser } = useFollows(currentUserId);
  const { plans, loading: plansLoading } = useSubscriptionPlans(targetUserId);
  const { isActiveSubscriber, loading: subscriptionLoading } = useActiveSubscription(currentUserId, targetUserId);

  const monthlyPlan = plans.find(p => p.billing_cycle === 'monthly') || plans[0];
  const monthlyPrice = monthlyPlan?.price_amount || 0;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.8); // 20% discount for yearly

  const handleSubscribeClick = async () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      return;
    }

    if (!isFollowing(targetUserId)) {
      setShowFollowModal(true);
      return;
    }

    setShowPlanModal(true);
  };

  const handleFollowAndContinue = async () => {
    setIsProcessing(true);
    try {
      await followUser(targetUserId);
      setShowFollowModal(false);
      setShowPlanModal(true);
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateSubscription = async () => {
    setIsProcessing(true);
    setShowPlanModal(false);
    
    try {
      if (!monthlyPlan) {
        toast({
          title: "No Plans Available",
          description: "This user hasn't set up any subscription plans yet",
          variant: "destructive",
        });
        return;
      }

      const amount = selectedBillingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
      const billingCycle = selectedBillingCycle;

      const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          planId: monthlyPlan.id,
          amount: amount,
          currency: monthlyPlan.currency,
          profileId: targetUserId,
          billingCycle: billingCycle
        }
      });

      if (error) throw error;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: 'AvatarTalk Subscription',
          description: `${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription to ${targetUsername}`,
          order_id: data.order_id,
          handler: async (response: any) => {
            const { error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: monthlyPlan.id,
                profileId: targetUserId,
                billingCycle: billingCycle
              }
            });

            if (verifyError) {
              console.error('Payment verification error:', verifyError);
              toast({
                title: "Payment Verification Failed",
                description: verifyError.message || "Please contact support",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Subscription Active!",
                description: `You are now subscribed to ${targetUsername}`,
              });
              window.location.reload();
            }
          },
          prefill: {
            name: currentUserId,
            email: '',
          },
          theme: {
            color: '#6366f1'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error('Error initiating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to initiate subscription",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  if (isActiveSubscriber) {
    return (
      <Button
        disabled
        variant="secondary"
        className={className}
      >
        <Check className="h-4 w-4 mr-2" />
        Subscribed
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleSubscribeClick}
        disabled={isProcessing}
        className={className}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Crown className="h-4 w-4 mr-2" />
        )}
        Subscribe - ₹{monthlyPrice}/mo
      </Button>

      {/* Follow Required Modal */}
      <Dialog open={showFollowModal} onOpenChange={setShowFollowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Follow Required</DialogTitle>
            <DialogDescription>
              You need to follow {targetUsername} before subscribing to their content.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowFollowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleFollowAndContinue} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Follow & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Selection Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>
              Subscribe to {targetUsername}'s exclusive content
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            {/* Monthly Option */}
            <div
              onClick={() => setSelectedBillingCycle('monthly')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedBillingCycle === 'monthly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Monthly</h4>
                  <p className="text-sm text-muted-foreground">Billed monthly</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">₹{monthlyPrice}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
            </div>

            {/* Yearly Option */}
            <div
              onClick={() => setSelectedBillingCycle('yearly')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                selectedBillingCycle === 'yearly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="absolute -top-2 right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Yearly</h4>
                  <p className="text-sm text-muted-foreground">Billed annually</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">₹{yearlyPrice}</span>
                  <span className="text-muted-foreground">/yr</span>
                  <p className="text-xs text-muted-foreground">
                    ₹{Math.round(yearlyPrice / 12)}/mo
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowPlanModal(false)}>
              Cancel
            </Button>
            <Button onClick={initiateSubscription} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Continue - ₹{selectedBillingCycle === 'yearly' ? yearlyPrice : monthlyPrice}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscribeButton;

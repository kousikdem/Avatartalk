import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFollows } from '@/hooks/useFollows';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Loader2 } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isFollowing, followUser } = useFollows(currentUserId);
  const { subscriptions } = useSubscriptions();
  const { plans, loading: plansLoading } = useSubscriptionPlans(targetUserId);

  const isSubscribed = subscriptions.some(
    sub => sub.subscribed_to_id === targetUserId && sub.status === 'active'
  );

  const handleSubscribeClick = async () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      return;
    }

    // Check if user is following
    if (!isFollowing(targetUserId)) {
      setShowFollowModal(true);
      return;
    }

    // Proceed with subscription
    await initiateSubscription();
  };

  const handleFollowAndContinue = async () => {
    setIsProcessing(true);
    try {
      await followUser(targetUserId);
      setShowFollowModal(false);
      await initiateSubscription();
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
    try {
      // Get the first active plan (or let user choose if multiple)
      const selectedPlan = plans[0];
      
      if (!selectedPlan) {
        toast({
          title: "No Plans Available",
          description: "This user hasn't set up any subscription plans yet",
          variant: "destructive",
        });
        return;
      }

      // Call Razorpay edge function to create order
      const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          planId: selectedPlan.id,
          amount: selectedPlan.price_amount,
          currency: selectedPlan.currency,
          profileId: targetUserId
        }
      });

      if (error) throw error;

      // Load Razorpay script
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
          description: `Subscribe to ${targetUsername}`,
          order_id: data.order_id,
          handler: async (response: any) => {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: selectedPlan.id,
                profileId: targetUserId
              }
            });

            if (verifyError) {
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Subscription Active!",
                description: `You are now subscribed to ${targetUsername}`,
              });
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

  if (plansLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (plans.length === 0) {
    return null; // Don't show button if no plans
  }

  return (
    <>
      <Button
        onClick={handleSubscribeClick}
        disabled={isProcessing || isSubscribed}
        variant={isSubscribed ? "secondary" : "default"}
        className={className}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Crown className="h-4 w-4 mr-2" />
        )}
        {isSubscribed ? 'Subscribed' : `Subscribe - ₹${plans[0]?.price_amount}`}
      </Button>

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
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Follow & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscribeButton;

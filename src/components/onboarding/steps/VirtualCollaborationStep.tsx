import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';

interface VirtualCollaborationStepProps {
  onComplete: () => void;
}

const VirtualCollaborationStep: React.FC<VirtualCollaborationStepProps> = ({ onComplete }) => {
  const { canHostVirtualMeetings, hasFeature } = usePlanFeatures();

  const features = [
    {
      icon: Video,
      title: '1:1 Video Calls',
      description: 'Host personal consultations and coaching sessions',
      requiredPlan: 'pro',
      available: canHostVirtualMeetings,
    },
    {
      icon: Users,
      title: 'Webinars & Events',
      description: 'Conduct group sessions and live workshops',
      requiredPlan: 'pro',
      available: canHostVirtualMeetings,
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Integrate with Google Calendar and Zoom',
      requiredPlan: 'creator',
      available: hasFeature('zoom_integration'),
    },
  ];

  return (
    <Card className="border-0 shadow-xl bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center"
        >
          <Video className="w-8 h-8 text-secondary-foreground" />
        </motion.div>
        <CardTitle className="text-2xl">Virtual Collaboration</CardTitle>
        <CardDescription>
          Offer paid video sessions and connect with your audience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative ${!feature.available ? 'opacity-60' : ''}`}>
                  {!feature.available && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={feature.requiredPlan} size="sm" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Boost your earnings</p>
              <p className="text-xs text-muted-foreground">
                Creators using virtual collaboration earn on average 3x more than those who don't
              </p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/80"
          onClick={onComplete}
        >
          Continue to Pricing
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default VirtualCollaborationStep;

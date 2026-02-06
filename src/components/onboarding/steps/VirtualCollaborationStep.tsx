import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            Offer paid video sessions and connect with your audience
          </p>
        </div>

        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`relative p-4 rounded-xl border transition-all ${
                  feature.available ? 'border-slate-200 hover:border-blue-200' : 'border-slate-100 opacity-60'
                }`}>
                  {!feature.available && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={feature.requiredPlan} size="sm" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Boost your earnings</p>
              <p className="text-xs text-muted-foreground">
                Set up collaboration sessions from the Virtual Collaboration page after setup
              </p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
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

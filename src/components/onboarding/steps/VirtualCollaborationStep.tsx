import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, ArrowRight, Zap, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { useNavigate } from 'react-router-dom';

interface VirtualCollaborationStepProps {
  onComplete: () => void;
}

const VirtualCollaborationStep: React.FC<VirtualCollaborationStepProps> = ({ onComplete }) => {
  const navigate = useNavigate();
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
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          Offer paid video sessions and connect with your audience
        </p>

        <div className="space-y-2.5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`relative p-3 rounded-xl border transition-all ${
                  feature.available ? 'border-slate-200 hover:border-blue-200' : 'border-slate-100 opacity-60'
                }`}>
                  {!feature.available && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={feature.requiredPlan} size="sm" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600" />
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

        {/* Add Collaboration Button */}
        <Button
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 gap-2"
          onClick={() => navigate('/settings/virtual-collaboration')}
          disabled={!canHostVirtualMeetings}
        >
          <Plus className="w-4 h-4" />
          Add New Collaboration
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </Button>

        {!canHostVirtualMeetings && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Collaborations require</span>
            <PlanBadge planKey="pro" size="sm" />
          </div>
        )}

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

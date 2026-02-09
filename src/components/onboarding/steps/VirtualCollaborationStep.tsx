import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface VirtualCollaborationStepProps {
  onComplete: () => void;
}

const VirtualCollaborationStep: React.FC<VirtualCollaborationStepProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { canHostVirtualMeetings, hasFeature, limits, canAddCollaboration, getRemainingCollaborations } = usePlanFeatures();

  const currentCount = 0;
  const remaining = getRemainingCollaborations(currentCount);
  const canAdd = canAddCollaboration(currentCount);

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          Offer paid video sessions and connect with your audience
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {currentCount} / {limits.collaborations === -1 ? '∞' : limits.collaborations} collaborations
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {remaining === 'unlimited' ? 'Unlimited' : `${remaining} remaining`}
          </span>
        </div>

        <div className="space-y-2">
          {[
            { icon: Video, title: '1:1 Video Calls', desc: 'Personal consultations', plan: 'pro', available: canHostVirtualMeetings },
            { icon: Users, title: 'Webinars & Events', desc: 'Group sessions', plan: 'pro', available: canHostVirtualMeetings },
            { icon: Calendar, title: 'Smart Scheduling', desc: 'Calendar + Zoom sync', plan: 'creator', available: hasFeature('zoom_integration') },
          ].map((f, i) => (
            <div key={f.title} className={`flex items-center gap-3 p-2.5 rounded-lg border ${f.available ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <f.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">{f.title}</span>
                <span className="text-xs text-muted-foreground ml-2">{f.desc}</span>
              </div>
              {!f.available && <PlanBadge planKey={f.plan} size="sm" />}
            </div>
          ))}
        </div>

        {/* Prominent Add Collaboration Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg text-sm font-semibold h-12"
            onClick={() => navigate('/settings/virtual-collaboration')}
            disabled={!canAdd}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Collaboration ({remaining === 'unlimited' ? '∞' : remaining} available)
          </Button>
        </motion.div>

        {!canAdd && (
          <p className="text-xs text-center text-muted-foreground">Collaboration limit reached. Upgrade your plan.</p>
        )}

        <Button
          size="lg"
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={onComplete}
        >
          Continue to Choose Plan
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default VirtualCollaborationStep;
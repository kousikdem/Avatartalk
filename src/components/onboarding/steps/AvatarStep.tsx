import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, ArrowRight, Image, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';

interface AvatarStepProps {
  onComplete: () => void;
}

const AvatarStep: React.FC<AvatarStepProps> = ({ onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<'upload' | 'create' | null>(null);
  const { hasFeature } = usePlanFeatures();

  const avatarOptions = [
    {
      id: 'upload' as const,
      title: 'Upload Photo',
      description: 'Use your own profile picture as avatar',
      icon: Upload,
      available: true,
      requiredPlan: 'free',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'create' as const,
      title: '3D Avatar Studio',
      description: 'Create a customized 3D avatar with full controls',
      icon: Sparkles,
      available: hasFeature('avatar_upload_enabled'),
      requiredPlan: 'creator',
      gradient: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            Choose how you want to represent yourself to visitors
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {avatarOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.id;
            const isLocked = !option.available;

            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
              >
                <div
                  className={`cursor-pointer rounded-xl border-2 p-6 text-center transition-all relative overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50'
                      : isLocked
                      ? 'opacity-50 cursor-not-allowed border-slate-200'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/20'
                  }`}
                  onClick={() => !isLocked && setSelectedOption(option.id)}
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={option.requiredPlan} size="sm" />
                    </div>
                  )}
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{option.title}</h3>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 text-center">
          <p className="text-xs text-muted-foreground">
            You can edit your avatar anytime from the Avatar Studio in your dashboard
          </p>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={onComplete}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AvatarStep;

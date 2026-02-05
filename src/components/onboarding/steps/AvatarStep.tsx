import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, ArrowRight, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      description: 'Use your own profile picture',
      icon: Upload,
      available: true,
      requiredPlan: 'free',
    },
    {
      id: 'create' as const,
      title: '3D Avatar Studio',
      description: 'Create a customized 3D avatar',
      icon: Sparkles,
      available: hasFeature('avatar_upload_enabled'),
      requiredPlan: 'creator',
    },
  ];

  const handleContinue = () => {
    onComplete();
  };

  return (
    <Card className="border-0 shadow-xl bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center"
        >
          <Image className="w-8 h-8 text-secondary-foreground" />
        </motion.div>
        <CardTitle className="text-2xl">Set up your avatar</CardTitle>
        <CardDescription>
          Choose how you want to represent yourself to visitors
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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
                <Card
                  className={`cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-primary border-primary'
                      : isLocked
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => !isLocked && setSelectedOption(option.id)}
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={option.requiredPlan} size="sm" />
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You can always change your avatar later from the Avatar settings page
          </p>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/80"
          onClick={handleContinue}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AvatarStep;

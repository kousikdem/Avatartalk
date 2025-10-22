import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Stethoscope, GraduationCap, Palette, Shield, Flame } from 'lucide-react';
import { avatarPresets } from '@/data/avatarPresets';

interface ReadyMadeAvatarsProps {
  onAvatarSelected: (config: any) => void;
}

const professionPresets = [
  {
    id: 'doctor',
    name: 'Doctor',
    icon: <Stethoscope className="w-6 h-6" />,
    description: 'Medical professional',
    config: {
      clothingTop: 'lab coat',
      accessories: ['stethoscope', 'id badge'],
      currentExpression: 'professional',
      currentPose: 'confident'
    }
  },
  {
    id: 'businessman',
    name: 'Business Executive',
    icon: <Briefcase className="w-6 h-6" />,
    description: 'Corporate professional',
    config: {
      clothingTop: 'suit',
      clothingBottom: 'dress pants',
      shoes: 'formal',
      accessories: ['watch', 'tie'],
      currentExpression: 'confident',
      currentPose: 'professional'
    }
  },
  {
    id: 'teacher',
    name: 'Teacher',
    icon: <GraduationCap className="w-6 h-6" />,
    description: 'Educator',
    config: {
      clothingTop: 'casual shirt',
      accessories: ['glasses'],
      currentExpression: 'friendly',
      currentPose: 'teaching'
    }
  },
  {
    id: 'artist',
    name: 'Artist',
    icon: <Palette className="w-6 h-6" />,
    description: 'Creative professional',
    config: {
      clothingTop: 'casual',
      accessories: ['beret', 'paint'],
      currentExpression: 'creative',
      currentPose: 'expressive'
    }
  },
  {
    id: 'police',
    name: 'Police Officer',
    icon: <Shield className="w-6 h-6" />,
    description: 'Law enforcement',
    config: {
      clothingTop: 'uniform',
      accessories: ['badge', 'cap'],
      currentExpression: 'serious',
      currentPose: 'standing'
    }
  },
  {
    id: 'firefighter',
    name: 'Firefighter',
    icon: <Flame className="w-6 h-6" />,
    description: 'Emergency responder',
    config: {
      clothingTop: 'firefighter uniform',
      accessories: ['helmet'],
      currentExpression: 'determined',
      currentPose: 'ready'
    }
  }
];

const ReadyMadeAvatars: React.FC<ReadyMadeAvatarsProps> = ({ onAvatarSelected }) => {
  const [selectedCategory, setSelectedCategory] = useState<'male' | 'female' | 'profession'>('male');

  const handlePresetSelect = (preset: any) => {
    onAvatarSelected(preset.config || preset);
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Ready-Made Avatar Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="male">Male Avatars</TabsTrigger>
            <TabsTrigger value="female">Female Avatars</TabsTrigger>
            <TabsTrigger value="profession">Professions</TabsTrigger>
          </TabsList>

          <TabsContent value="male" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {avatarPresets
                .filter(p => p.gender === 'male')
                .map((preset) => (
                  <Card key={preset.id} className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="text-6xl">{preset.thumbnail}</div>
                        <div>
                          <h3 className="font-semibold">{preset.name}</h3>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="secondary" className="text-xs">
                            Age: {preset.config.age}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {preset.config.ethnicity}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full"
                          size="sm"
                        >
                          Use This Avatar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="female" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {avatarPresets
                .filter(p => p.gender === 'female')
                .map((preset) => (
                  <Card key={preset.id} className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="text-6xl">{preset.thumbnail}</div>
                        <div>
                          <h3 className="font-semibold">{preset.name}</h3>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="secondary" className="text-xs">
                            Age: {preset.config.age}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {preset.config.ethnicity}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full"
                          size="sm"
                        >
                          Use This Avatar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="profession" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Professional avatar templates with appropriate attire and accessories
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionPresets.map((prof) => (
                <Card key={prof.id} className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        {prof.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{prof.name}</h3>
                        <p className="text-sm text-muted-foreground">{prof.description}</p>
                      </div>
                      <Button
                        onClick={() => handlePresetSelect({
                          ...avatarPresets[0].config,
                          ...prof.config
                        })}
                        className="w-full"
                        size="sm"
                      >
                        Use This Style
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReadyMadeAvatars;

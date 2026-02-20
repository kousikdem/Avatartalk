
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User, Baby, Briefcase, GraduationCap, Heart, Zap, Crown } from 'lucide-react';

interface PresetAvatarsProps {
  onPresetSelect: (preset: any) => void;
}

const PresetAvatars: React.FC<PresetAvatarsProps> = ({ onPresetSelect }) => {
  const presets = [
    {
      id: 'business_woman',
      name: 'Business Woman',
      icon: Briefcase,
      category: 'Professional',
      config: {
        body: { gender: 'female', age: 30, ethnicity: 'caucasian', height: 165, weight: 60, muscle: 45, fat: 25 },
        face: { eyeColor: 'blue', skinTone: '#F5DEB3', hairStyle: 'medium', hairColor: '#8B4513' },
        clothing: { outfit: 'business', accessories: ['glasses'] },
        pose: 'standing',
        expression: 'neutral'
      }
    },
    {
      id: 'business_man',
      name: 'Business Man',
      icon: Briefcase,
      category: 'Professional',
      config: {
        body: { gender: 'male', age: 35, ethnicity: 'caucasian', height: 180, weight: 75, muscle: 60, fat: 20 },
        face: { eyeColor: 'brown', skinTone: '#DEB887', hairStyle: 'short', hairColor: '#654321' },
        clothing: { outfit: 'business', accessories: ['watch'] },
        pose: 'standing',
        expression: 'neutral'
      }
    },
    {
      id: 'student_female',
      name: 'Student',
      icon: GraduationCap,
      category: 'Casual',
      config: {
        body: { gender: 'female', age: 20, ethnicity: 'asian', height: 160, weight: 50, muscle: 35, fat: 20 },
        face: { eyeColor: 'brown', skinTone: '#F5DEB3', hairStyle: 'long', hairColor: '#000000' },
        clothing: { outfit: 'casual', accessories: [] },
        pose: 'relaxed',
        expression: 'smiling'
      }
    },
    {
      id: 'athlete_male',
      name: 'Athlete',
      icon: Zap,
      category: 'Sports',
      config: {
        body: { gender: 'male', age: 25, ethnicity: 'african', height: 185, weight: 80, muscle: 85, fat: 10 },
        face: { eyeColor: 'brown', skinTone: '#8B7355', hairStyle: 'buzz', hairColor: '#000000' },
        clothing: { outfit: 'sports', accessories: [] },
        pose: 'running',
        expression: 'neutral'
      }
    },
    {
      id: 'artist_female',
      name: 'Artist',
      icon: Heart,
      category: 'Creative',
      config: {
        body: { gender: 'female', age: 28, ethnicity: 'hispanic', height: 170, weight: 65, muscle: 40, fat: 30 },
        face: { eyeColor: 'green', skinTone: '#D2B48C', hairStyle: 'curly', hairColor: '#8B4513' },
        clothing: { outfit: 'casual', accessories: ['hat'] },
        pose: 'dancing',
        expression: 'smiling'
      }
    },
    {
      id: 'senior_man',
      name: 'Senior',
      icon: User,
      category: 'Mature',
      config: {
        body: { gender: 'male', age: 65, ethnicity: 'caucasian', height: 175, weight: 70, muscle: 35, fat: 35 },
        face: { eyeColor: 'blue', skinTone: '#F5DEB3', hairStyle: 'short', hairColor: '#808080' },
        clothing: { outfit: 'formal', accessories: ['glasses'] },
        pose: 'standing',
        expression: 'neutral'
      }
    },
    {
      id: 'teen_male',
      name: 'Teenager',
      icon: Baby,
      category: 'Young',
      config: {
        body: { gender: 'male', age: 16, ethnicity: 'mixed', height: 170, weight: 60, muscle: 40, fat: 25 },
        face: { eyeColor: 'hazel', skinTone: '#DEB887', hairStyle: 'medium', hairColor: '#4B0082' },
        clothing: { outfit: 'casual', accessories: [] },
        pose: 'relaxed',
        expression: 'smiling'
      }
    },
    {
      id: 'executive_woman',
      name: 'Executive',
      icon: Crown,
      category: 'Leadership',
      config: {
        body: { gender: 'female', age: 40, ethnicity: 'african', height: 168, weight: 65, muscle: 50, fat: 25 },
        face: { eyeColor: 'brown', skinTone: '#654321', hairStyle: 'short', hairColor: '#000000' },
        clothing: { outfit: 'formal', accessories: ['jewelry'] },
        pose: 'standing',
        expression: 'neutral'
      }
    }
  ];

  const categories = [...new Set(presets.map(preset => preset.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            Ready-Made Avatars
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h4 className="text-sm font-medium text-gray-600 mb-3">{category}</h4>
              <div className="grid grid-cols-2 gap-3">
                {presets
                  .filter(preset => preset.category === category)
                  .map(preset => {
                    const IconComponent = preset.icon;
                    return (
                      <Button
                        key={preset.id}
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2 p-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        onClick={() => onPresetSelect(preset.config)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">{preset.name}</span>
                      </Button>
                    );
                  })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Quick Start</h4>
        <p className="text-blue-700 text-sm">
          Select a preset avatar that matches your needs, then customize it further using the Body, Face, and Style tabs.
        </p>
      </div>
    </div>
  );
};

export default PresetAvatars;

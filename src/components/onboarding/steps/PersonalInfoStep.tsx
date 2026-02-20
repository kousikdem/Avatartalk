import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, UserCircle, MapPin, Phone, Calendar, Briefcase, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CountrySelect } from '@/components/ui/country-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { ProfessionSelect, type ProfessionOption } from '@/components/ui/profession-select';
import { IconSelect, type IconSelectOption } from '@/components/ui/icon-select';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Stethoscope, Wrench, Code, Palette as PaletteIcon, GraduationCap, Scale, Calculator,
  Building2, Camera, Music, Mic, PenTool, Utensils, Plane, Dumbbell, Heart, Scissors,
  BookOpen, Lightbulb, Megaphone, Film, Gamepad2, ShoppingBag, Landmark, Leaf, Award,
  CircleUserRound, Users, CircleUser, HelpCircle, UserRound,
  type LucideIcon
} from 'lucide-react';

interface PersonalInfoStepProps {
  onComplete: (data: Record<string, unknown>) => void;
}

const professionOptions: ProfessionOption[] = [
  { value: 'doctor', label: 'Doctor / Healthcare', icon: Stethoscope, color: 'text-red-500' },
  { value: 'engineer', label: 'Engineer', icon: Wrench, color: 'text-gray-600' },
  { value: 'software_developer', label: 'Software Developer', icon: Code, color: 'text-blue-500' },
  { value: 'designer', label: 'Designer / Artist', icon: PaletteIcon, color: 'text-pink-500' },
  { value: 'teacher', label: 'Teacher / Educator', icon: GraduationCap, color: 'text-green-600' },
  { value: 'lawyer', label: 'Lawyer / Legal', icon: Scale, color: 'text-amber-600' },
  { value: 'accountant', label: 'Accountant / Finance', icon: Calculator, color: 'text-emerald-500' },
  { value: 'entrepreneur', label: 'Entrepreneur', icon: Building2, color: 'text-indigo-500' },
  { value: 'photographer', label: 'Photographer', icon: Camera, color: 'text-violet-500' },
  { value: 'musician', label: 'Musician / Singer', icon: Music, color: 'text-purple-500' },
  { value: 'content_creator', label: 'Content Creator', icon: Mic, color: 'text-rose-500' },
  { value: 'writer', label: 'Writer / Author', icon: PenTool, color: 'text-cyan-600' },
  { value: 'fitness_trainer', label: 'Fitness Trainer', icon: Dumbbell, color: 'text-lime-600' },
  { value: 'student', label: 'Student', icon: Award, color: 'text-amber-500' },
];

const genderOptions: IconSelectOption[] = [
  { value: 'male', label: 'Male', icon: UserRound, color: 'text-blue-500' },
  { value: 'female', label: 'Female', icon: CircleUserRound, color: 'text-pink-500' },
  { value: 'non_binary', label: 'Non-binary', icon: Users, color: 'text-purple-500' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: HelpCircle, color: 'text-gray-500' },
];

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    username: '',
    bio: '',
    profession: '',
    gender: '',
    phone_number: '',
    country: '',
    location: '',
    date_of_birth: '',
    website: '',
    profile_pic_url: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          setFormData({
            full_name: data.full_name || '',
            display_name: data.display_name || '',
            username: data.username || '',
            bio: data.bio || '',
            profession: data.profession || '',
            gender: data.gender || '',
            phone_number: data.phone_number || '',
            country: data.country || '',
            location: data.location || '',
            date_of_birth: data.date_of_birth || '',
            website: data.website || '',
            profile_pic_url: data.profile_pic_url || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Profile updated!',
        description: 'Your personal information has been saved.',
      });
      onComplete(formData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpdate = (newImageUrl: string) => {
    setFormData(prev => ({ ...prev, profile_pic_url: newImageUrl }));
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <ProfilePictureUpload
              currentImageUrl={formData.profile_pic_url}
              onImageUpdate={handleProfileImageUpdate}
              displayName={formData.display_name || formData.username || 'User'}
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-3.5 w-3.5 text-blue-500" />
                Full Name *
              </Label>
              <Input
                id="full_name"
                placeholder="Your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name" className="flex items-center gap-2 text-sm font-medium">
                <UserCircle className="h-3.5 w-3.5 text-purple-500" />
                Display Name *
              </Label>
              <Input
                id="display_name"
                placeholder="Display name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-3.5 w-3.5 text-indigo-500" />
              Username
            </Label>
            <Input
              id="username"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell visitors about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/500</p>
          </div>

          {/* Profession & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-3.5 w-3.5 text-green-500" />
                Profession
              </Label>
              <ProfessionSelect
                options={professionOptions}
                value={formData.profession}
                onChange={(val) => setFormData({ ...formData, profession: val })}
                placeholder="Select profession"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gender</Label>
              <IconSelect
                options={genderOptions}
                value={formData.gender}
                onChange={(val) => setFormData({ ...formData, gender: val })}
                placeholder="Select gender"
              />
            </div>
          </div>

          {/* Phone & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-3.5 w-3.5 text-orange-500" />
                Phone Number
              </Label>
              <PhoneInput
                value={formData.phone_number}
                onChange={(val) => setFormData({ ...formData, phone_number: val })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                Country
              </Label>
              <CountrySelect
                value={formData.country}
                onChange={(val) => setFormData({ ...formData, country: val })}
              />
            </div>
          </div>

          {/* Location & DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">City / Location</Label>
              <Input
                id="location"
                placeholder="Your city"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-3.5 w-3.5 text-teal-500" />
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
            disabled={loading || !formData.display_name}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoStep;

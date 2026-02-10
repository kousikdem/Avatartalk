import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Volume2,
  Link,
  Save,
  Upload,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  CreditCard,
  MessageSquare,
  Lock,
  Zap,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Stethoscope,
  GraduationCap,
  Code,
  Palette as PaletteIcon,
  Camera,
  Music,
  Mic,
  PenTool,
  Scale,
  Calculator,
  Building2,
  Plane,
  Utensils,
  Scissors,
  Heart,
  Dumbbell,
  BookOpen,
  Lightbulb,
  Megaphone,
  Film,
  Gamepad2,
  Wrench,
  ShoppingBag,
  Landmark,
  Leaf,
  Award,
  UserCircle,
  Plus,
  Check,
  ChevronDown,
  Mail,
  Flag,
  CircleUser,
  CircleUserRound,
  UserRound,
  Users,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { useAvatarSettings } from '@/hooks/useAvatarSettings';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import SocialLinksManager from '@/components/SocialLinksManager';
import { OrdersDashboard } from '@/components/OrdersDashboard';
import TokenDisplay from '@/components/TokenDisplay';
import UserChatSettingsPanel from '@/components/UserChatSettingsPanel';
import PlanBadge, { planColors } from '@/components/PlanBadge';
import { CountrySelect } from '@/components/ui/country-select';
import { IconSelect, type IconSelectOption } from '@/components/ui/icon-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { ProfessionSelect, type ProfessionOption } from '@/components/ui/profession-select';
import { SettingsSkeleton } from '@/components/ui/page-skeletons';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const { settings: avatarSettings, updateSetting, loading: avatarLoading } = useAvatarSettings();
  const { plans, createPlan, updatePlan, deletePlan } = useSubscriptionPlans(currentUser?.id);
  const { hasFeature } = usePlanFeatures();
  const canAccessSubscriptionPlans = hasFeature('subscription_button_enabled');
  const creatorPlanConfig = planColors.creator;
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    price_amount: 99,
    currency: 'INR',
    billing_cycle: 'monthly',
    trial_days: 0,
    benefits: [],
    badge: { text: 'Subscriber', color: '#6366f1' },
    active: true,
    require_follow: true
  });

  // Currency exchange rates (base: INR)
  const currencyRates: Record<string, number> = {
    'INR': 1,
    'USD': 0.012,
    'EUR': 0.011,
    'GBP': 0.0095,
    'AUD': 0.018,
    'CAD': 0.017,
    'SGD': 0.016,
    'AED': 0.044,
    'JPY': 1.85,
    'CNY': 0.087,
  };

  const convertPrice = (amount: number, fromCurrency: string, toCurrency: string) => {
    const inINR = amount / currencyRates[fromCurrency];
    return Math.round(inINR * currencyRates[toCurrency]);
  };

  // Use auth context instead of redundant session check (App.tsx already gates auth)
  const { user: authUser } = useAuth();
  
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
      setAuthLoading(false);
    }
  }, [authUser]);

  // Profession options with icons
  const professionOptions: ProfessionOption[] = [
    { value: 'doctor', label: 'Doctor / Healthcare', icon: Stethoscope, color: 'text-red-500' },
    { value: 'engineer', label: 'Engineer', icon: Wrench, color: 'text-gray-600' },
    { value: 'software_developer', label: 'Software Developer', icon: Code, color: 'text-blue-500' },
    { value: 'designer', label: 'Designer / Artist', icon: PaletteIcon, color: 'text-pink-500' },
    { value: 'teacher', label: 'Teacher / Educator', icon: GraduationCap, color: 'text-green-600' },
    { value: 'lawyer', label: 'Lawyer / Legal', icon: Scale, color: 'text-amber-600' },
    { value: 'accountant', label: 'Accountant / Finance', icon: Calculator, color: 'text-emerald-500' },
    { value: 'entrepreneur', label: 'Entrepreneur / Business Owner', icon: Building2, color: 'text-indigo-500' },
    { value: 'photographer', label: 'Photographer', icon: Camera, color: 'text-violet-500' },
    { value: 'musician', label: 'Musician / Singer', icon: Music, color: 'text-purple-500' },
    { value: 'content_creator', label: 'Content Creator / Influencer', icon: Mic, color: 'text-rose-500' },
    { value: 'writer', label: 'Writer / Author', icon: PenTool, color: 'text-cyan-600' },
    { value: 'chef', label: 'Chef / Culinary', icon: Utensils, color: 'text-orange-500' },
    { value: 'pilot', label: 'Pilot / Aviation', icon: Plane, color: 'text-sky-500' },
    { value: 'fitness_trainer', label: 'Fitness Trainer / Coach', icon: Dumbbell, color: 'text-lime-600' },
    { value: 'healthcare_worker', label: 'Healthcare Worker', icon: Heart, color: 'text-red-400' },
    { value: 'stylist', label: 'Stylist / Beauty', icon: Scissors, color: 'text-fuchsia-500' },
    { value: 'researcher', label: 'Researcher / Scientist', icon: BookOpen, color: 'text-teal-500' },
    { value: 'consultant', label: 'Consultant', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'marketer', label: 'Marketing / Advertising', icon: Megaphone, color: 'text-orange-600' },
    { value: 'filmmaker', label: 'Filmmaker / Video Creator', icon: Film, color: 'text-slate-600' },
    { value: 'gamer', label: 'Gamer / Esports', icon: Gamepad2, color: 'text-purple-600' },
    { value: 'retail', label: 'Retail / E-commerce', icon: ShoppingBag, color: 'text-pink-600' },
    { value: 'government', label: 'Government / Public Service', icon: Landmark, color: 'text-blue-700' },
    { value: 'environmentalist', label: 'Environmental / Sustainability', icon: Leaf, color: 'text-green-500' },
    { value: 'student', label: 'Student', icon: Award, color: 'text-amber-500' },
  ];

  // Gender options with distinct icons
  const genderOptions: IconSelectOption[] = [
    { value: 'male', label: 'Male', icon: UserRound, color: 'text-blue-500' },
    { value: 'female', label: 'Female', icon: CircleUserRound, color: 'text-pink-500' },
    { value: 'non_binary', label: 'Non-binary', icon: Users, color: 'text-purple-500' },
    { value: 'transgender', label: 'Transgender', icon: CircleUser, color: 'text-cyan-500' },
    { value: 'genderqueer', label: 'Genderqueer', icon: UserCircle, color: 'text-indigo-500' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: HelpCircle, color: 'text-gray-500' },
    { value: 'other', label: 'Other', icon: User, color: 'text-orange-500' },
  ];

  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: '',
    display_name: '',
    username: '',
    bio: '',
    profession: '',
    custom_profession: '',
    age: 18,
    gender: '',
    email: '',
    phone_number: '',
    location: '',
    country: '',
    website: '',
    date_of_birth: '',
    profile_pic_url: '',
  });

  const [showCustomProfession, setShowCustomProfession] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    like_notifications: true,
    comment_notifications: true,
    follow_notifications: true,
    post_notifications: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    show_followers: true,
    show_following: true,
    allow_messages: true,
    show_online_status: true,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setCurrentUser(userData.user);

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        const profession = profileData.profession || '';
        const isCustomProfession = profession && !professionOptions.some(opt => opt.value === profession || opt.label === profession);
        
        setProfileData({
          full_name: profileData.full_name || '',
          display_name: profileData.display_name || '',
          username: profileData.username || '',
          bio: profileData.bio || '',
          profession: isCustomProfession ? 'other' : profession,
          custom_profession: isCustomProfession ? profession : '',
          age: profileData.age || 18,
          gender: profileData.gender || '',
          email: profileData.email || '',
          phone_number: profileData.phone_number || '',
          location: profileData.location || '',
          country: profileData.country || '',
          website: profileData.website || '',
          date_of_birth: profileData.date_of_birth || '',
          profile_pic_url: profileData.profile_pic_url || '',
        });
        
        setShowCustomProfession(isCustomProfession || profession === 'other');
      }

      // Load social links
      const { data: socialData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (socialError && socialError.code !== 'PGRST116') throw socialError;

      if (socialData) {
        setSocialLinks(socialData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpdate = (newImageUrl: string) => {
    setProfileData(prev => ({ ...prev, profile_pic_url: newImageUrl }));
  };

  const saveProfileSettings = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      // Determine the actual profession value to save
      const professionToSave = profileData.profession === 'other' 
        ? profileData.custom_profession 
        : profileData.profession;

      const { custom_profession, ...dataToSave } = profileData;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          ...dataToSave,
          profession: professionToSave,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Profile settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSocialLinks = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('social_links')
        .upsert({
          user_id: currentUser.id,
          ...socialLinks,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Social links saved successfully",
      });
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: "Error",
        description: "Failed to save social links",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Show skeleton only during initial auth check - once authed, render shell immediately
  if (authLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and configurations</p>
          </div>
          <TokenDisplay compact />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 bg-white shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
              <PlanBadge planKey="creator" size="sm" showIcon={false} />
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture Upload Component */}
                <ProfilePictureUpload
                  currentImageUrl={profileData.profile_pic_url}
                  onImageUpdate={handleProfileImageUpdate}
                  displayName={profileData.display_name || profileData.username || currentUser?.email || 'User'}
                />

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-purple-500" />
                      Display Name
                    </Label>
                    <Input
                      id="display_name"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-500" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-500" />
                      Mobile Number
                    </Label>
                    <PhoneInput
                      value={profileData.phone_number}
                      onChange={(value) => setProfileData(prev => ({ ...prev, phone_number: value }))}
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-pink-500" />
                      Date of Birth
                    </Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profileData.date_of_birth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="120"
                      value={profileData.age}
                      onChange={(e) => setProfileData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-violet-500" />
                      Gender
                    </Label>
                    <IconSelect
                      options={genderOptions}
                      value={profileData.gender}
                      onChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
                      placeholder="Select your gender"
                    />
                  </div>
                </div>

                <Separator />

                {/* Profession Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Profession
                  </h3>
                  <ProfessionSelect
                    options={professionOptions}
                    value={profileData.profession}
                    customValue={profileData.custom_profession}
                    onChange={(value, isCustom) => {
                      setProfileData(prev => ({ 
                        ...prev, 
                        profession: value,
                        custom_profession: isCustom ? prev.custom_profession : ''
                      }));
                      setShowCustomProfession(isCustom);
                    }}
                    onCustomValueChange={(value) => {
                      setProfileData(prev => ({ ...prev, custom_profession: value }));
                    }}
                    placeholder="Search or add your profession"
                  />
                  
                  {showCustomProfession && profileData.custom_profession && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-700">
                        Custom profession: <strong>{profileData.custom_profession}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Location & Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Location & Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        City / Location
                      </Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Mumbai, India"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-green-500" />
                        Country
                      </Label>
                      <CountrySelect
                        value={profileData.country}
                        onChange={(value) => setProfileData(prev => ({ ...prev, country: value }))}
                        placeholder="Select your country"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bio Section */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-purple-500" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={saveProfileSettings} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avatar Settings */}
          <TabsContent value="avatar" className="space-y-6">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-600" />
                  Avatar Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!avatarLoading ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Avatar Type</Label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={avatarSettings?.avatar_type || 'realistic'}
                          onChange={(e) => updateSetting('avatar_type', e.target.value)}
                        >
                          <option value="realistic">Realistic</option>
                          <option value="cartoon">Cartoon</option>
                          <option value="anime">Anime</option>
                          <option value="abstract">Abstract</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Avatar Mood</Label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={avatarSettings?.avatar_mood || 'friendly'}
                          onChange={(e) => updateSetting('avatar_mood', e.target.value)}
                        >
                          <option value="friendly">Friendly</option>
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="energetic">Energetic</option>
                          <option value="calm">Calm</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Voice Type</Label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={avatarSettings?.voice_type || 'neutral'}
                          onChange={(e) => updateSetting('voice_type', e.target.value)}
                        >
                          <option value="neutral">Neutral</option>
                          <option value="masculine">Masculine</option>
                          <option value="feminine">Feminine</option>
                          <option value="robotic">Robotic</option>
                          <option value="child">Child</option>
                        </select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Lip Sync</Label>
                          <p className="text-sm text-gray-500">Enable lip synchronization with speech</p>
                        </div>
                        <Switch
                          checked={avatarSettings?.lip_sync || false}
                          onCheckedChange={(checked) => updateSetting('lip_sync', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Head Movement</Label>
                          <p className="text-sm text-gray-500">Enable natural head movements</p>
                        </div>
                        <Switch
                          checked={avatarSettings?.head_movement || false}
                          onCheckedChange={(checked) => updateSetting('head_movement', checked)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading avatar settings...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Chat Settings */}
          <TabsContent value="chat" className="space-y-6">
            {currentUser && <UserChatSettingsPanel userId={currentUser.id} />}
          </TabsContent>

          {/* Social Links */}
          <TabsContent value="social" className="space-y-6">
            <SocialLinksManager />
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, push_notifications: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Like Notifications</Label>
                      <p className="text-sm text-gray-500">Get notified when someone likes your posts</p>
                    </div>
                    <Switch
                      checked={notificationSettings.like_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, like_notifications: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Comment Notifications</Label>
                      <p className="text-sm text-gray-500">Get notified when someone comments on your posts</p>
                    </div>
                    <Switch
                      checked={notificationSettings.comment_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, comment_notifications: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Follow Notifications</Label>
                      <p className="text-sm text-gray-500">Get notified when someone follows you</p>
                    </div>
                    <Switch
                      checked={notificationSettings.follow_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, follow_notifications: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            {!canAccessSubscriptionPlans ? (
              <Card className={`${creatorPlanConfig.bgClass} ${creatorPlanConfig.borderClass} border`}>
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${creatorPlanConfig.gradient}`}>
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className={`text-xl font-semibold ${creatorPlanConfig.textClass}`}>
                        Subscription Plans
                      </h3>
                      <PlanBadge planKey="creator" size="sm" />
                    </div>
                    <p className="text-muted-foreground max-w-md">
                      Create subscription plans to monetize your content and build recurring revenue from your audience.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/pricing')}
                    className={`bg-gradient-to-r ${creatorPlanConfig.gradient} text-white hover:opacity-90`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade to Creator
                  </Button>
                </CardContent>
              </Card>
            ) : (
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Subscription Plans
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="currency-selector" className="text-sm">Currency:</Label>
                    <select
                      id="currency-selector"
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium"
                      value={selectedCurrency}
                      onChange={(e) => {
                        setSelectedCurrency(e.target.value);
                        setNewPlan(prev => ({ ...prev, currency: e.target.value }));
                      }}
                    >
                      <option value="INR">INR - ₹</option>
                      <option value="USD">USD - $</option>
                      <option value="EUR">EUR - €</option>
                      <option value="GBP">GBP - £</option>
                      <option value="AUD">AUD - A$</option>
                      <option value="CAD">CAD - C$</option>
                      <option value="SGD">SGD - S$</option>
                      <option value="AED">AED - د.إ</option>
                      <option value="JPY">JPY - ¥</option>
                      <option value="CNY">CNY - ¥</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Plans */}
                {plans.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Active Plans</h3>
                    {plans.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{plan.title}</h4>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePlan(plan.id)}
                          >
                            Delete
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Price:</span> {selectedCurrency} {convertPrice(plan.price_amount, plan.currency, selectedCurrency)}
                          </div>
                          <div>
                            <span className="text-gray-600">Cycle:</span> {plan.billing_cycle}
                          </div>
                          {plan.trial_days && plan.trial_days > 0 && (
                            <div>
                              <span className="text-gray-600">Trial:</span> {plan.trial_days} days
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Original: {plan.currency} {plan.price_amount}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Separator />
                  </div>
                )}

                {/* Create New Plan */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Create New Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan_title">Plan Title</Label>
                      <Input
                        id="plan_title"
                        value={newPlan.title}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Premium Access"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan_price">Price ({selectedCurrency})</Label>
                      <Input
                        id="plan_price"
                        type="number"
                        min="1"
                        value={newPlan.price_amount}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, price_amount: parseInt(e.target.value) || 99 }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="plan_description">Description</Label>
                      <Textarea
                        id="plan_description"
                        value={newPlan.description}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what subscribers will get"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing_cycle">Billing Cycle</Label>
                      <select
                        id="billing_cycle"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newPlan.billing_cycle}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, billing_cycle: e.target.value }))}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one-time">One-time</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trial_days">Trial Days</Label>
                      <Input
                        id="trial_days"
                        type="number"
                        min="0"
                        value={newPlan.trial_days}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex items-center justify-between md:col-span-2">
                      <div>
                        <Label>Require Follow Before Subscribe</Label>
                        <p className="text-sm text-gray-500">Users must follow you to subscribe</p>
                      </div>
                      <Switch
                        checked={newPlan.require_follow}
                        onCheckedChange={(checked) => setNewPlan(prev => ({ ...prev, require_follow: checked }))}
                      />
                    </div>
                    
                    {/* Badge Configuration */}
                    <div className="md:col-span-2 border-t pt-4 mt-2">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span className="text-indigo-600">🏷️</span> Subscriber Badge Settings
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="badge_text">Badge Text</Label>
                          <Input
                            id="badge_text"
                            value={newPlan.badge?.text || 'Subscriber'}
                            onChange={(e) => setNewPlan(prev => ({ 
                              ...prev, 
                              badge: { ...prev.badge, text: e.target.value } 
                            }))}
                            placeholder="e.g., Subscriber, VIP, Premium"
                            maxLength={20}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="badge_color">Badge Color</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="badge_color"
                              type="color"
                              value={newPlan.badge?.color || '#6366f1'}
                              onChange={(e) => setNewPlan(prev => ({ 
                                ...prev, 
                                badge: { ...prev.badge, color: e.target.value } 
                              }))}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              value={newPlan.badge?.color || '#6366f1'}
                              onChange={(e) => setNewPlan(prev => ({ 
                                ...prev, 
                                badge: { ...prev.badge, color: e.target.value } 
                              }))}
                              placeholder="#6366f1"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-500">Preview:</span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: newPlan.badge?.color || '#6366f1' }}
                        >
                          👑 {newPlan.badge?.text || 'Subscriber'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!newPlan.title || newPlan.price_amount < 1) {
                        toast({
                          title: "Validation Error",
                          description: "Please fill in all required fields",
                          variant: "destructive",
                        });
                        return;
                      }
                      const success = await createPlan(newPlan);
                      if (success) {
                        setNewPlan({
                          title: '',
                          description: '',
                          price_amount: 99,
                          currency: 'INR',
                          billing_cycle: 'monthly',
                          trial_days: 0,
                          benefits: [],
                          badge: { text: 'Subscriber', color: '#6366f1' },
                          active: true,
                          require_follow: true
                        });
                      }
                    }}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          {/* Orders Dashboard */}
          <TabsContent value="orders" className="space-y-6">
            <OrdersDashboard type="buyer" />
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={privacySettings.profile_visibility}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profile_visibility: e.target.value }))}
                    >
                      <option value="public">Public - Anyone can view</option>
                      <option value="followers">Followers Only</option>
                      <option value="private">Private - Only you</option>
                    </select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Followers Count</Label>
                      <p className="text-sm text-gray-500">Display your follower count publicly</p>
                    </div>
                    <Switch
                      checked={privacySettings.show_followers}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, show_followers: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Following Count</Label>
                      <p className="text-sm text-gray-500">Display who you're following publicly</p>
                    </div>
                    <Switch
                      checked={privacySettings.show_following}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, show_following: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-gray-500">Let others send you direct messages</p>
                    </div>
                    <Switch
                      checked={privacySettings.allow_messages}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allow_messages: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Online Status</Label>
                      <p className="text-sm text-gray-500">Let others see when you're online</p>
                    </div>
                    <Switch
                      checked={privacySettings.show_online_status}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, show_online_status: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
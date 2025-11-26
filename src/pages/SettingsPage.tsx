import React, { useState, useEffect } from 'react';
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
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAvatarSettings } from '@/hooks/useAvatarSettings';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import SocialLinksManager from '@/components/SocialLinksManager';

const SettingsPage = () => {
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

  // Authentication check
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
      
      // Redirect to login if not authenticated
      if (!session?.user) {
        window.location.href = '/';
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session?.user) {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: '',
    display_name: '',
    username: '',
    bio: '',
    profession: '',
    age: 18,
    gender: '',
    email: '',
    profile_pic_url: '',
  });

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
        setProfileData({
          full_name: profileData.full_name || '',
          display_name: profileData.display_name || '',
          username: profileData.username || '',
          bio: profileData.bio || '',
          profession: profileData.profession || '',
          age: profileData.age || 18,
          gender: profileData.gender || '',
          email: profileData.email || '',
          profile_pic_url: profileData.profile_pic_url || '',
        });
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
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          ...profileData,
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

  // Authentication and loading check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and configurations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
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
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={profileData.profession}
                      onChange={(e) => setProfileData(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="Enter your profession"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="120"
                      value={profileData.age}
                      onChange={(e) => setProfileData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={profileData.gender}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                      placeholder="Enter your gender"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
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
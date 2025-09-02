
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Users, MessageSquare, BarChart3, Calendar, User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';
import Avatar3DPreview from '@/components/Avatar3DPreview';
import ShareModal from './ShareModal';

const Dashboard = () => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { profileData, loading: profileLoading } = useUserProfile();
  const { currentConfig, loading: configLoading } = useAvatarConfigurations();
  
  const loading = profileLoading || configLoading;
  
  // Convert AvatarConfiguration to the expected format for Avatar3DPreview
  const convertConfigForPreview = (config: any) => {
    if (!config) return null;
    return {
      body: {
        gender: config.gender || 'male',
        age: config.age_category === 'child' ? 12 : config.age_category === 'teen' ? 16 : 
             config.age_category === 'adult' ? 30 : 50,
        ethnicity: 'mixed',
        height: config.height || 170,
        weight: config.weight || 70,
        muscle: config.muscle_definition || 50,
        fat: config.body_fat || 20,
      },
      face: {
        eyeColor: config.eye_color || '#8B4513',
        skinTone: config.skin_tone || '#F1C27D',
        hairStyle: config.hair_style || 'medium',
        hairColor: config.hair_color || '#8B4513',
        faceShape: config.head_shape || 'oval',
        eyeShape: config.eye_shape || 'almond',
        noseShape: config.nose_shape || 'straight',
        lipShape: config.lip_shape || 'normal',
      },
      clothing: {
        outfit: `${config.clothing_top || 'casual_shirt'}_${config.clothing_bottom || 'jeans'}`,
        accessories: config.accessories || [],
      },
      pose: config.current_pose || 'standing',
      expression: config.current_expression || 'neutral',
    };
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-white p-6">
      {/* Header Section with Share Button */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Manage your AI avatar and track your interactions</p>
        </div>
        
        <Button 
          onClick={() => setIsShareOpen(true)}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Share Profile</span>
          <span className="sm:hidden">Share</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* 3D Avatar Preview Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Your 3D Avatar</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-32 flex items-center justify-center">
              {currentConfig ? (
                <Avatar3DPreview
                  config={convertConfigForPreview(currentConfig)}
                />
              ) : (
                <div className="text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No Avatar</p>
                </div>
              )}
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs font-medium text-foreground">
                {currentConfig?.avatar_name || 'No Avatar'}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentConfig?.gender || 'Unknown'} • {currentConfig?.age_category || 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,234</div>
            <p className="text-xs text-gray-600">+20% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">567</div>
            <p className="text-xs text-gray-600">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">89%</div>
            <p className="text-xs text-gray-600">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Events</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-600">3 upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white border-0"
              onClick={() => window.location.href = '/avatar'}
            >
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">Setup Avatar</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white border-0"
              onClick={() => window.location.href = '/products'}
            >
              <div className="text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">View Products</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 hover:from-green-600 hover:via-teal-600 hover:to-blue-600 text-white border-0"
              onClick={() => window.location.href = '/calendar'}
            >
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">Calendar</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white border-0"
              onClick={() => window.location.href = '/analytics'}
            >
              <div className="text-center">
                <BarChart3 className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">Analytics</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profileUrl={profileData?.public_link || `${window.location.origin}/profile`}
        username={profileData?.username || 'user'}
      />
    </div>
  );
};

export default Dashboard;

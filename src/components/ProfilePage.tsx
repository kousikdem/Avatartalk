
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Users, 
  Eye, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  Share2,
  UserPlus,
  UserMinus,
  Crown,
  Verified
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFollows } from '@/hooks/useFollows';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import ChatTab from './ChatTab';

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  full_name: string;
  email: string;
  bio: string;
  profile_pic_url: string;
  avatar_url: string;
  created_at: string;
}

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData: currentUserProfile } = useUserProfile();
  const { followUser, unfollowUser } = useFollows();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Load profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Profile error:', error);
        navigate('/404');
        return;
      }

      setProfileData(profile);

      // Check if this is the current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      setIsCurrentUser(user?.id === profile.id);

      // Load follow status and counts
      if (user && user.id !== profile.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .single();

        setIsFollowing(!!followData);
      }

      // Load follower and following counts
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', profile.id),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', profile.id)
      ]);

      setFollowerCount(followersResult.count || 0);
      setFollowingCount(followingResult.count || 0);

      // Increment profile views
      if (user && user.id !== profile.id) {
        await supabase
          .from('profile_visitors')
          .insert([{
            visitor_id: user.id,
            visited_profile_id: profile.id
          }]);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileData) return;

    try {
      if (isFollowing) {
        await unfollowUser(profileData.id);
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else {
        await followUser(profileData.id);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h1>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileData.profile_pic_url || profileData.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profileData.display_name?.substring(0, 2) || profileData.full_name?.substring(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">
                    {profileData.display_name || profileData.full_name || profileData.username}
                  </h1>
                  <Verified className="w-5 h-5 text-blue-500" />
                </div>

                <p className="text-gray-600 text-lg mb-2">@{profileData.username}</p>
                
                {profileData.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{profileData.bio}</p>
                )}

                {/* Stats */}
                <div className="flex space-x-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{followerCount}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {!isCurrentUser && (
                    <>
                      <Button
                        onClick={handleFollowToggle}
                        variant={isFollowing ? "outline" : "default"}
                        className="flex items-center space-x-2"
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            <span>Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Follow</span>
                          </>
                        )}
                      </Button>

                      <Button variant="outline" className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Message</span>
                      </Button>

                      <Button variant="outline" className="flex items-center space-x-2">
                        <Crown className="w-4 h-4" />
                        <span>Subscribe</span>
                      </Button>
                    </>
                  )}

                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* Like and Comment Section for Profile */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <LikeButton 
                      itemId={profileData.id} 
                      itemType="profile"
                      className="hover:bg-red-50"
                    />
                    <CommentSection 
                      itemId={profileData.id} 
                      itemType="profile"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts would go here - currently empty */}
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No posts yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="h-[600px]">
              <ChatTab />
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">About</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-700">
                    {profileData.bio || "No bio available"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Member Since</h4>
                  <p className="text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDistanceToNow(new Date(profileData.created_at), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;

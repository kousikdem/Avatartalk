import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { useProfileManager } from '@/hooks/useProfileManager';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PostCard } from '@/components/profile/PostCard';
import { ChatBox } from '@/components/profile/ChatBox';
import { SocialLinks } from '@/components/profile/SocialLinks';

interface ProfilePageProps {
  userId?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId = "demo-user" }) => {
  const { profile, socialLinks, userStats, loading } = useProfile(userId);
  const { profileData, updateField } = useProfileManager();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProfileHeader profile={profile} userStats={userStats} />

        {/* Enhanced Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="tab-navigation w-full">
            <TabsTrigger value="posts" className="tab-trigger">Posts</TabsTrigger>
            <TabsTrigger value="chat" className="tab-trigger">Chat</TabsTrigger>
            <TabsTrigger value="products" className="tab-trigger">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {[1, 2].map((i) => (
              <PostCard key={i} postId={i} profile={profile} />
            ))}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ChatBox />
          </TabsContent>

          <TabsContent value="products">
            <Card className="neo-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Featured Products
                </h3>
                <p className="text-muted-foreground">No products available yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <SocialLinks socialLinks={socialLinks} />
      </div>
    </div>
  );
};

export default ProfilePage;

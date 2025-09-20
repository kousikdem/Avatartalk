import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import SocialFeed from './SocialFeed';
import CreatePostModal from './CreatePostModal';

const DashboardFeed = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { profileData } = useUserProfile();

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Feed</h2>
          <p className="text-gray-600">Share and interact with your community</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Feed Tabs */}
      <Tabs defaultValue="my-posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white">
          <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="public">Public Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="my-posts" className="mt-6">
          <SocialFeed 
            userId={profileData?.id}
            showCreatePost={true}
            feedType="user"
          />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <SocialFeed 
            userId={profileData?.id}
            showCreatePost={false}
            feedType="following"
          />
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <SocialFeed 
            userId={profileData?.id}
            showCreatePost={false}
            feedType="public"
          />
        </TabsContent>
      </Tabs>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default DashboardFeed;
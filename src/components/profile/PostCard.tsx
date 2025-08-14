import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface PostCardProps {
  postId: number;
  profile: any;
}

export const PostCard: React.FC<PostCardProps> = ({ postId, profile }) => {
  return (
    <Card className="neo-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{profile?.display_name || 'User'}</p>
            <p className="text-sm text-muted-foreground">2 hours ago</p>
          </div>
        </div>
        <p className="mb-4">This is a sample post #{postId}. Great to connect with everyone!</p>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500 hover:to-pink-500 hover:text-white hover:scale-105 transition-all duration-300 border border-red-500/30"
          >
            <Heart className="w-4 h-4 mr-2" />
            {12 + postId}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:scale-105 transition-all duration-300 border border-blue-500/30"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {3 + postId}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500 hover:to-emerald-500 hover:text-white hover:scale-105 transition-all duration-300 border border-green-500/30"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
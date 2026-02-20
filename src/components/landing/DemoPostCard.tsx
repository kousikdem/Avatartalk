import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MoreVertical, Eye, Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoPost {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  is_subscriber_only?: boolean;
  profile: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface DemoPostCardProps {
  post: DemoPost;
}

const DemoPostCard: React.FC<DemoPostCardProps> = ({ post }) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 ring-2 ring-blue-500/30">
                <AvatarImage src={post.profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {post.profile.display_name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">
                    {post.profile.display_name}
                  </h4>
                  {post.is_subscriber_only && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 py-0 border-0">
                      <Crown className="w-2.5 h-2.5 mr-0.5" />
                      Exclusive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  @{post.profile.username} • {formatTimeAgo(post.created_at)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 p-4">
          {/* Post Content */}
          {post.is_subscriber_only ? (
            <div className="relative">
              <p className="text-gray-800 leading-relaxed mb-3 blur-sm select-none">
                {post.content}
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Subscribe to unlock</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>
          )}
          
          {/* Media */}
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden relative">
              <img
                src={post.media_url}
                alt="Post media"
                className={`w-full h-auto max-h-48 object-cover ${post.is_subscriber_only ? 'blur-md' : ''}`}
              />
              {post.is_subscriber_only && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 my-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                {post.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views_count}
              </span>
            </div>
            <span>{post.comments_count} comments</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Heart className="w-4 h-4 fill-current mr-2" />
              Like
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-9 text-gray-500 hover:text-blue-500 hover:bg-blue-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Comment
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-9 text-gray-500 hover:text-green-500 hover:bg-green-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DemoPostCard;

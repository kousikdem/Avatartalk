import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, MoreVertical, Eye } from 'lucide-react';
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
  profile: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface DemoPostCardProps {
  post: DemoPost;
  isDarkMode?: boolean;
}

const DemoPostCard: React.FC<DemoPostCardProps> = ({ post, isDarkMode = true }) => {
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

  if (isDarkMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-slate-800/40 border-slate-700/40 overflow-hidden hover:bg-slate-800/60 transition-colors">
          <CardHeader className="pb-2 p-3">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 ring-2 ring-blue-500/30">
                <AvatarImage src={post.profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {post.profile.display_name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm truncate">
                  {post.profile.display_name}
                </h4>
                <p className="text-xs text-slate-400">
                  @{post.profile.username} • {formatTimeAgo(post.created_at)}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 p-3">
            {/* Post Content */}
            <p className="text-slate-200 text-sm leading-relaxed mb-2">{post.content}</p>
            
            {/* Media */}
            {post.media_url && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={post.media_url}
                  alt="Post media"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between text-xs text-slate-400 mt-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                  {post.likes_count}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views_count}
                </span>
              </div>
              <span>{post.comments_count} comments</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Heart className="w-3.5 h-3.5 fill-current mr-1" />
                <span className="text-xs">Like</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Comment</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Light mode version
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {post.profile.display_name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {post.profile.display_name}
              </h4>
              <p className="text-sm text-gray-500">
                @{post.profile.username} • {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>
          
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={post.media_url}
                alt="Post media"
                className="w-full h-auto max-h-48 object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 my-3">
            <div className="flex items-center gap-4">
              <span>{post.likes_count} likes</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views_count} views
              </span>
            </div>
            <span>{post.comments_count} comments</span>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
              <Heart className="w-5 h-5 fill-current mr-2" />
              Like
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DemoPostCard;

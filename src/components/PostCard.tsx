
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Eye, 
  DollarSign, 
  ExternalLink,
  Music,
  Github,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import { Post } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const getIntegrationIcon = (app: string) => {
    switch (app.toLowerCase()) {
      case 'spotify': return <Music className="h-4 w-4" />;
      case 'github': return <Github className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality with database
  };

  return (
    <Card className="mb-6 border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                U
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">User</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          {post.is_paid && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <DollarSign className="h-3 w-3 mr-1" />
              ${post.price}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Title */}
        {post.metadata?.title && (
          <h3 className="text-xl font-bold mb-3 text-foreground">
            {post.metadata.title}
          </h3>
        )}

        {/* Content */}
        {post.content && (
          <p className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Media */}
        {post.media_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {post.media_type === 'image' && (
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="w-full h-auto max-h-96 object-cover"
              />
            )}
            {post.media_type === 'video' && (
              <video 
                src={post.media_url} 
                controls 
                className="w-full h-auto max-h-96"
              />
            )}
            {post.media_type === 'document' && (
              <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Document</p>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    View Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Link Preview */}
        {post.metadata?.link_url && (
          <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Link</span>
            </div>
            <Button variant="link" className="p-0 h-auto text-primary">
              {post.metadata.link_url}
            </Button>
          </div>
        )}

        {/* Integration */}
        {post.metadata?.integration_app && (
          <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              {getIntegrationIcon(post.metadata.integration_app)}
              <span className="text-sm font-medium capitalize">
                Connected via {post.metadata.integration_app}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 ${
                isLiked ? 'text-red-600' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </Button>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{post.views_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;

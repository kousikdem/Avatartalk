
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  ExternalLink,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/hooks/usePosts';
import { useLikes } from '@/hooks/useLikes';

interface PostCardProps {
  post: Post;
  showAuthor?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, showAuthor = true }) => {
  const [showComments, setShowComments] = useState(false);
  const { likesCount, isLiked, toggleLike } = useLikes(post.id, 'post');

  const handleLike = async () => {
    await toggleLike();
  };

  const renderMedia = () => {
    if (!post.media_url) return null;

    if (post.media_type?.startsWith('image/')) {
      return (
        <div className="mt-4">
          <img
            src={post.media_url}
            alt="Post media"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      );
    }

    if (post.media_type?.startsWith('video/')) {
      return (
        <div className="mt-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              src={post.media_url}
              controls
              className="w-full max-h-96"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      );
    }

    // Document or other file types
    return (
      <div className="mt-4">
        <div className="flex items-center gap-3 p-4 border border-muted rounded-lg bg-muted/30">
          <Download className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-sm font-medium">Attached Document</div>
            <div className="text-xs text-muted-foreground">Click to download</div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={post.media_url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    );
  };

  const renderLink = () => {
    if (!post.link_url) return null;

    return (
      <div className="mt-4">
        <div className="flex items-center gap-3 p-4 border border-primary/20 rounded-lg bg-primary/5">
          <ExternalLink className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{post.link_url}</div>
            <div className="text-xs text-muted-foreground">External link</div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={post.link_url} target="_blank" rel="noopener noreferrer">
              Visit
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full bg-card border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Author Info */}
        {showAuthor && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">Anonymous User</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.is_paid && (
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200">
                  💰 ${post.price}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {post.post_type}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Title */}
        {post.title && (
          <h3 className="text-lg font-semibold mb-2 leading-tight">
            {post.title}
          </h3>
        )}

        {/* Content */}
        {post.content && (
          <div className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        )}

        {/* Media */}
        {renderMedia()}

        {/* Link */}
        {renderLink()}

        {/* Integration */}
        {post.integration_data?.app && (
          <div className="mt-4">
            <div className="flex items-center gap-2 p-3 border border-secondary/20 rounded-lg bg-secondary/5">
              <Badge variant="secondary">{post.integration_data.app}</Badge>
              <span className="text-sm text-muted-foreground">Integration active</span>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 hover:bg-red-50 hover:text-red-600 transition-colors ${
                isLiked ? 'text-red-600 bg-red-50' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{post.views_count} views</span>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">Comments ({post.comments_count})</div>
            <div className="text-xs text-muted-foreground">
              Comment functionality will be implemented in the next iteration.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;

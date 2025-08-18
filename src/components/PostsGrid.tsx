
import React from 'react';
import { Post } from '@/hooks/usePosts';
import PostCard from './PostCard';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface PostsGridProps {
  posts: Post[];
  isLoading: boolean;
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div>
                  <div className="h-4 w-24 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="h-4 w-5/6 bg-muted rounded"></div>
              </div>
              <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                <div className="h-4 w-12 bg-muted rounded"></div>
                <div className="h-4 w-12 bg-muted rounded"></div>
                <div className="h-4 w-12 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CardContent className="pt-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground">
            Start sharing your thoughts, experiences, and insights with the world!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsGrid;

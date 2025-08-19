
import React from 'react';
import { Post } from '@/hooks/usePosts';
import PostCard from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';

interface PostsGridProps {
  posts: Post[];
  isLoading: boolean;
  showAuthor?: boolean;
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, isLoading, showAuthor = true }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a1 1 0 00-1 1v14a1 1 0 001 1h8a1 1 0 001-1V5a1 1 0 00-1-1m-9 0V4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">No posts yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start sharing your thoughts with the world!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showAuthor={showAuthor} />
      ))}
    </div>
  );
};

export default PostsGrid;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface CommentSectionProps {
  itemId: string;
  itemType: 'post' | 'profile';
  showCount?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  itemId,
  itemType,
  showCount = true
}) => {
  const { comments, loading, submitting, addComment, deleteComment } = useComments(itemId, itemType);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    await addComment(newComment);
    setNewComment('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Comment button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="flex items-center space-x-1"
      >
        <MessageSquare className="w-4 h-4 text-gray-500" />
        {showCount && <span className="text-sm">{comments.length}</span>}
      </Button>

      {/* Comments section */}
      {showComments && (
        <div className="space-y-4 border-t pt-4">
          {/* Add comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              size="sm"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>

          {/* Comments list */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback>
                      {comment.profiles?.display_name?.substring(0, 2) || 
                       comment.profiles?.full_name?.substring(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">
                          {comment.profiles?.display_name || 
                           comment.profiles?.full_name || 'Anonymous'}
                        </h4>
                        {currentUser?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 h-auto text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;

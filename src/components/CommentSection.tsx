
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Trash2, Reply } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { comments, loading, submitting, addComment, deleteComment } = useComments(itemId, itemType);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

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

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;
    
    await addComment(replyContent, parentCommentId);
    setReplyContent('');
    setReplyingTo(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  const handleProfileClick = (username?: string) => {
    if (username) {
      navigate(`/${username}`);
    }
  };

  const renderComment = (comment: any, isReply: boolean = false) => (
    <div key={comment.id} className={`flex space-x-3 ${isReply ? 'ml-12 mt-2' : ''}`}>
      <Avatar 
        className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleProfileClick(comment.profiles?.username)}
      >
        <AvatarImage src={comment.profiles?.avatar_url} />
        <AvatarFallback>
          {comment.profiles?.display_name?.substring(0, 2) || 
           comment.profiles?.full_name?.substring(0, 2) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <h4 
              className="font-medium text-sm cursor-pointer hover:underline"
              onClick={() => handleProfileClick(comment.profiles?.username)}
            >
              {comment.profiles?.display_name || 
               comment.profiles?.full_name || 'Anonymous'}
            </h4>
            <div className="flex items-center gap-2">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="p-1 h-auto text-muted-foreground hover:text-foreground"
                >
                  <Reply className="w-3 h-3" />
                </Button>
              )}
              {currentUser?.id === comment.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1 h-auto text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-foreground">{comment.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </p>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-2 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={submitting || !replyContent.trim()}
                size="sm"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </Button>
              <Button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply: any) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Comment button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="flex items-center space-x-1"
      >
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
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
              {comments.map((comment) => renderComment(comment))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;

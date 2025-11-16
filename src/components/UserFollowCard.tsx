import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';
import { formatDistanceToNow } from 'date-fns';

interface UserFollowCardProps {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  profilePicUrl?: string;
  profession?: string;
  followersCount?: number;
  followingCount?: number;
  lastSeen?: string;
  visitCount?: number;
  showFollowButton?: boolean;
  showMessageButton?: boolean;
  currentUserId?: string;
  onAction?: () => void;
}

const UserFollowCard: React.FC<UserFollowCardProps> = ({
  id,
  username,
  displayName,
  bio,
  avatarUrl,
  profilePicUrl,
  profession,
  followersCount = 0,
  followingCount = 0,
  lastSeen,
  visitCount,
  showFollowButton = true,
  showMessageButton = true,
  currentUserId,
  onAction
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/@${username}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/@${username}`);
  };

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card border-border/50 hover:border-primary/30"
      onClick={handleProfileClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={profilePicUrl || avatarUrl || ''} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {displayName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">@{username}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {showMessageButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChatClick}
                  className="rounded-xl"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              {showFollowButton && (
                <FollowButton
                  targetUserId={id}
                  targetUsername={username}
                  currentUserId={currentUserId}
                  variant="compact"
                />
              )}
            </div>
          </div>

          {/* Bio/Profession */}
          {(bio || profession) && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {profession && <span className="font-medium">{profession}</span>}
              {profession && bio && <span className="mx-1">•</span>}
              {bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">{followersCount}</span>
              <span className="text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">{followingCount}</span>
              <span className="text-muted-foreground">following</span>
            </div>
            {lastSeen && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>Visited {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}</span>
              </div>
            )}
            {visitCount !== undefined && visitCount > 1 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>• {visitCount} visits</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserFollowCard;

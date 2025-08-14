import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  profile: any;
  userStats: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, userStats }) => {
  return (
    <Card className="neo-card border-2">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-2xl">
            <AvatarImage src={profile?.profile_pic_url || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              {profile?.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {profile?.display_name || 'User Name'}
              </h1>
              <p className="text-muted-foreground">@{profile?.username || 'username'}</p>
            </div>

            <p className="text-foreground/80 max-w-2xl">
              {profile?.bio || 'This user hasn\'t added a bio yet.'}
            </p>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{userStats?.total_conversations || 0}</div>
                <div className="stat-label">Conversations</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{userStats?.followers_count || 0}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{userStats?.engagement_score || 0}%</div>
                <div className="stat-label">Engagement</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
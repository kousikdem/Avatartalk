import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, User, Settings, Eye, Sparkles } from 'lucide-react';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import { useAvatarSettings } from '@/hooks/useAvatarSettings';
import { useUserProfile } from '@/hooks/useUserProfile';
import EnhancedAvatarPreview from './EnhancedAvatarPreview';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface AvatarSyncDashboardProps {
  className?: string;
}

const AvatarSyncDashboard: React.FC<AvatarSyncDashboardProps> = ({ className = "" }) => {
  const { avatarConfig, loading: avatarLoading, syncWithProfile } = useRealtimeAvatar();
  const { settings, loading: settingsLoading } = useAvatarSettings();
  const { profileData, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();

  const handleSyncAll = async () => {
    try {
      await syncWithProfile();
      toast({
        title: "Sync Complete",
        description: "All avatar settings synchronized across dashboard and profile!",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize avatar settings.",
        variant: "destructive"
      });
    }
  };

  const isLoading = avatarLoading || settingsLoading || profileLoading;
  const isSynced = avatarConfig && settings && profileData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sync Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Avatar Synchronization
            </div>
            <Badge variant={isSynced ? "default" : "secondary"}>
              {isSynced ? "Synchronized" : "Pending"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Dashboard Avatar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Dashboard Avatar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {avatarConfig ? (
                    <div className="space-y-3">
                      <EnhancedAvatarPreview 
                        userId={avatarConfig.user_id}
                        isLarge={false}
                        showControls={false}
                        isInteractive={false}
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Name:</strong> {avatarConfig.avatar_name}</p>
                        <p><strong>Style:</strong> {avatarConfig.gender} • {avatarConfig.age_category}</p>
                        <p><strong>Updated:</strong> {new Date(avatarConfig.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                      No avatar configured
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Avatar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile Avatar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profileData.profile_pic_url || profileData.avatar_data?.preview_url} />
                          <AvatarFallback>{profileData.display_name?.[0] || 'A'}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 text-center">
                        <p><strong>Name:</strong> {profileData.display_name || profileData.username}</p>
                        <p><strong>Profession:</strong> {profileData.profession || 'Not specified'}</p>
                        <p><strong>Followers:</strong> {profileData.analytics?.followers_count || 0}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                      Profile not loaded
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Avatar Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Avatar Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settings ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <Badge variant="outline">{settings.avatar_type}</Badge>
                        <Badge variant="outline">{settings.avatar_mood}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Voice:</strong> {settings.voice_type}</p>
                        <p><strong>Lip Sync:</strong> {settings.lip_sync ? 'Enabled' : 'Disabled'}</p>
                        <p><strong>Head Movement:</strong> {settings.head_movement ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                      No settings configured
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sync Actions */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSyncAll}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isLoading ? 'Syncing...' : 'Sync All Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Avatar Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <EnhancedAvatarPreview 
              userId={avatarConfig?.user_id}
              isLarge={true}
              showControls={true}
              enableVoice={true}
              isInteractive={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarSyncDashboard;
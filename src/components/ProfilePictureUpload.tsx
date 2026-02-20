
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
  displayName?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  displayName = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload a profile picture.",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Update profile with new image URL - ONLY profile_pic_url, NOT avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_pic_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setDeleting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Update profile to remove image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_pic_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onImageUpdate('');
      
      toast({
        title: "Success",
        description: "Profile picture removed successfully!",
      });

    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-700">Profile Picture</Label>
      
      <div className="flex items-center space-x-6">
        <Avatar className="w-20 h-20 border-2 border-gray-200">
          <AvatarImage src={currentImageUrl} alt={displayName} />
          <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700">
            {displayName.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={uploading}
              className="border-blue-400 text-blue-600 hover:bg-blue-50"
            >
              <label htmlFor="profile-picture" className="cursor-pointer flex items-center">
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </>
                )}
              </label>
            </Button>
            
            {currentImageUrl && (
              <Button
                onClick={handleDeleteImage}
                variant="outline"
                size="sm"
                disabled={deleting}
                className="border-red-400 text-red-600 hover:bg-red-50"
              >
                {deleting ? (
                  <>
                    <Trash2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </>
                )}
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            JPG, PNG, or WebP. Max 5MB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;

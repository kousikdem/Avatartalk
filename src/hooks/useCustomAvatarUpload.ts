import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadedAvatar {
  model_url: string;
  thumbnail_url: string;
  format: string;
  file_size: number;
}

export const useCustomAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadCustomAvatar = async (file: File): Promise<UploadedAvatar | null> => {
    try {
      setUploading(true);
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate file type - support ALL avatar formats
      const validFormats = ['.glb', '.gltf', '.fbx', '.obj', '.json', '.gif', '.png', '.jpg', '.jpeg'];
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validFormats.includes(fileExt)) {
        throw new Error(`Invalid file format. Supported: ${validFormats.join(', ').toUpperCase()}`);
      }

      setProgress(30);

      // Validate file size (max 50MB)
      const MAX_FILE_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size: 50MB');
      }

      // Upload to organized storage structure
      const fileName = `${user.id}/avatars/models/custom-avatar-${Date.now()}${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setProgress(60);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      setProgress(70);

      // Generate thumbnail
      let thumbnailUrl = '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png';
      const isImageFormat = ['.gif', '.png', '.jpg', '.jpeg', '.webp'].includes(fileExt);
      const is3DFormat = ['.glb', '.gltf', '.fbx', '.obj'].includes(fileExt);
      
      if (isImageFormat) {
        thumbnailUrl = urlData.publicUrl;
      } else if (is3DFormat) {
        // Try to generate thumbnail via edge function
        try {
          const { data: thumbData } = await supabase.functions.invoke('avatar-format-converter', {
            body: {
              action: 'generate_thumbnail',
              modelUrl: urlData.publicUrl,
              userId: user.id
            }
          });
          if (thumbData?.thumbnailUrl) {
            thumbnailUrl = thumbData.thumbnailUrl;
          }
        } catch (thumbError) {
          console.warn('Thumbnail generation failed, using default:', thumbError);
        }
      }

      setProgress(85);

      // Save to database immediately
      const avatarName = file.name.replace(/\.[^/.]+$/, '');
      const exportUrlField = `${fileExt.replace('.', '')}_export_url`;
      
      const { data: savedConfig, error: dbError } = await supabase
        .from('avatar_configurations')
        .upsert({
          user_id: user.id,
          model_url: urlData.publicUrl,
          thumbnail_url: thumbnailUrl,
          avatar_name: avatarName,
          [exportUrlField]: urlData.publicUrl,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Failed to save to database:', dbError);
      } else {
        console.log('Avatar saved to database:', savedConfig);
      }

      setProgress(100);

      toast.success(`Custom avatar uploaded successfully! (${fileExt.toUpperCase()})`);

      return {
        model_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        format: fileExt.replace('.', ''),
        file_size: file.size
      };

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploading,
    progress,
    uploadCustomAvatar
  };
};

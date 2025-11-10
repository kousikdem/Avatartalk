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

      // Upload to storage
      const fileName = `${user.id}/custom-avatar-${Date.now()}${fileExt}`;
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

      setProgress(80);

      // For image formats, use as thumbnail; for 3D formats, use default thumbnail
      const isImageFormat = ['.gif', '.png', '.jpg', '.jpeg'].includes(fileExt);
      const thumbnailUrl = isImageFormat 
        ? urlData.publicUrl 
        : '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png';

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

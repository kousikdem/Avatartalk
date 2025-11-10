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

      // Validate file type
      const validFormats = ['.glb', '.gltf', '.fbx', '.obj'];
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validFormats.includes(fileExt)) {
        throw new Error('Invalid file format. Supported: GLB, GLTF, FBX, OBJ');
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

      // Generate thumbnail (for now, use placeholder - can be enhanced with 3D rendering)
      const thumbnailUrl = '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png';

      setProgress(100);

      toast.success('Custom avatar uploaded successfully!');

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

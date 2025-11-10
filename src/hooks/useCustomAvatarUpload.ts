import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

interface UploadedAvatar {
  model_url: string;
  thumbnail_url: string;
  format: string;
  file_size: number;
}

const VALID_3D_FORMATS = ['.glb', '.gltf', '.fbx', '.obj'];
const VALID_IMAGE_FORMATS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const useCustomAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateThumbnailFromModel = async (modelUrl: string): Promise<string> => {
    try {
      // Create off-screen renderer
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(0, 1, 3);
      camera.lookAt(0, 0, 0);

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 2, 1);
      scene.add(directionalLight);

      // Load model
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(modelUrl);
      scene.add(gltf.scene);

      // Render
      renderer.render(scene, camera);

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve('/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png');
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png';
    }
  };

  const uploadCustomAvatar = async (file: File): Promise<UploadedAvatar | null> => {
    try {
      setUploading(true);
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Validate file type
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const allValidFormats = [...VALID_3D_FORMATS, ...VALID_IMAGE_FORMATS];
      
      if (!allValidFormats.includes(fileExt)) {
        throw new Error(`Invalid format. Supported: ${allValidFormats.join(', ')}`);
      }

      setProgress(30);

      // Upload to proper storage path
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
      
      if (VALID_3D_FORMATS.includes(fileExt)) {
        // For 3D models, generate thumbnail from model
        thumbnailUrl = await generateThumbnailFromModel(urlData.publicUrl);
        
        // Upload thumbnail if generated
        if (!thumbnailUrl.startsWith('/lovable-uploads')) {
          const thumbnailBlob = await fetch(thumbnailUrl).then(r => r.blob());
          const thumbnailPath = `${user.id}/avatars/thumbnails/thumbnail-${Date.now()}.png`;
          
          const { error: thumbError } = await supabase.storage
            .from('thumbnails')
            .upload(thumbnailPath, thumbnailBlob, {
              contentType: 'image/png',
              upsert: true,
            });

          if (!thumbError) {
            const { data: thumbData } = supabase.storage
              .from('thumbnails')
              .getPublicUrl(thumbnailPath);
            thumbnailUrl = thumbData.publicUrl;
          }
        }
      } else if (VALID_IMAGE_FORMATS.includes(fileExt)) {
        // For images, use the image itself as thumbnail
        thumbnailUrl = urlData.publicUrl;
      }

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

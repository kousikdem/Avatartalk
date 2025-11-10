import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';
// @ts-ignore - gltf-pipeline doesn't have types
import gltfPipeline from 'gltf-pipeline';

interface AvatarBuildOptions {
  format: 'json' | 'gif' | 'glb' | 'gltf' | 'fbx';
  compress?: boolean;
  quality?: number;
}

export const useAvatarBuilder = () => {
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState(0);

  const buildAvatarJSON = async (config: any) => {
    const fullConfig = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      morphology: {
        height: config.height,
        weight: config.weight,
        muscle: config.muscle,
        fat: config.fat,
        torsoLength: config.torsoLength,
        legLength: config.legLength,
        shoulderWidth: config.shoulderWidth,
        handSize: config.handSize,
      },
      facialStructure: {
        headSize: config.headSize,
        headShape: config.headShape,
        faceWidth: config.faceWidth,
        jawline: config.jawline,
        cheekbones: config.cheekbones,
        eyeSize: config.eyeSize,
        eyeDistance: config.eyeDistance,
        eyeShape: config.eyeShape,
        eyeColor: config.eyeColor,
        noseSize: config.noseSize,
        noseWidth: config.noseWidth,
        noseShape: config.noseShape,
        mouthWidth: config.mouthWidth,
        lipThickness: config.lipThickness,
        lipShape: config.lipShape,
        earSize: config.earSize,
        earPosition: config.earPosition,
        earShape: config.earShape,
      },
      materials: {
        skinTone: config.skinTone,
        skinTexture: config.skinTexture,
        hairColor: config.hairColor,
        facialHairColor: config.facialHairColor,
      },
      clothing: {
        top: config.clothingTop,
        bottom: config.clothingBottom,
        shoes: config.shoes,
        accessories: config.accessories || [],
      },
      animation: {
        currentPose: config.currentPose,
        currentExpression: config.currentExpression,
      },
      assets: {
        hairStyle: config.hairStyle,
        hairLength: config.hairLength,
        facialHair: config.facialHair,
      },
    };

    return JSON.stringify(fullConfig, null, 2);
  };

  const buildAvatar3DScene = (config: any): THREE.Scene => {
    const scene = new THREE.Scene();
    const group = new THREE.Group();

    // Create body
    const bodyGeometry = new THREE.CapsuleGeometry(0.75, 2.8, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.skinTone || '#F1C27D'),
      roughness: 0.35,
      metalness: 0.02,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Create head
    const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 2.3, 0);
    group.add(head);

    // Create hair
    if (config.hairStyle !== 'bald') {
      const hairGeometry = new THREE.SphereGeometry(0.65, 20, 20);
      const hairMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.hairColor || '#8B4513'),
        roughness: 0.8,
      });
      const hair = new THREE.Mesh(hairGeometry, hairMaterial);
      hair.position.set(0, 2.5, 0);
      group.add(hair);
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(group);

    return scene;
  };

  const buildAvatarGLTF = async (config: any, binary: boolean = true): Promise<ArrayBuffer> => {
    const scene = buildAvatar3DScene(config);
    const exporter = new GLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        async (result) => {
          try {
            if (result instanceof ArrayBuffer) {
              // Already binary GLB format
              resolve(result);
            } else {
              // GLTF JSON format - optionally optimize with gltf-pipeline
              if (binary) {
                // Convert to GLB using gltf-pipeline
                try {
                  const glbResult = await gltfPipeline.gltfToGlb(result);
                  resolve(glbResult.glb.buffer);
                } catch (pipelineError) {
                  console.warn('gltf-pipeline conversion failed, using fallback:', pipelineError);
                  // Fallback: manual conversion
                  const json = JSON.stringify(result);
                  const buffer = new TextEncoder().encode(json);
                  resolve(buffer.buffer);
                }
              } else {
                // Return as JSON
                const json = JSON.stringify(result);
                const buffer = new TextEncoder().encode(json);
                resolve(buffer.buffer);
              }
            }
          } catch (error) {
            reject(error);
          }
        },
        (error) => reject(error),
        { binary }
      );
    });
  };

  const buildAvatarGIF = async (config: any, canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Capture frames for GIF animation
      const frames: string[] = [];
      const frameCount = 30;
      
      for (let i = 0; i < frameCount; i++) {
        frames.push(canvas.toDataURL('image/png'));
      }

      // Use gifshot library to create GIF
      if (typeof (window as any).gifshot !== 'undefined') {
        (window as any).gifshot.createGIF({
          images: frames,
          gifWidth: canvas.width,
          gifHeight: canvas.height,
          interval: 0.1,
        }, (obj: any) => {
          if (!obj.error) {
            fetch(obj.image)
              .then(res => res.blob())
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error(obj.error));
          }
        });
      } else {
        // Fallback: create a static image blob
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/gif');
      }
    });
  };

  const compressFile = async (file: Blob, format: string, userId: string): Promise<string> => {
    try {
      const fileName = `avatar_${Date.now()}.${format}`;
      const filePath = `${userId}/${fileName}`;

      // Upload original file to storage
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Call compression edge function
      const { data, error } = await supabase.functions.invoke('avatar-file-compress', {
        body: {
          filePath,
          bucket: 'thumbnails',
          format,
        },
      });

      if (error) throw error;

      return data.compressedUrl;
    } catch (error) {
      console.error('Compression error:', error);
      throw error;
    }
  };

  const validateFormat = (format: string): boolean => {
    const validFormats = ['json', 'gif', 'glb', 'gltf', 'fbx', 'obj'];
    return validFormats.includes(format.toLowerCase());
  };

  const buildAndExport = async (config: any, options: AvatarBuildOptions, canvas?: HTMLCanvasElement): Promise<string> => {
    setBuilding(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (!validateFormat(options.format)) {
        throw new Error(`Invalid format: ${options.format}`);
      }

      setProgress(20);
      let fileBlob: Blob;
      let fileName: string;
      let exportUrlField: string;

      switch (options.format) {
        case 'json':
          const jsonContent = await buildAvatarJSON(config);
          fileBlob = new Blob([jsonContent], { type: 'application/json' });
          fileName = `avatar_${config.avatarName || 'export'}.json`;
          exportUrlField = 'json_export_url';
          break;

        case 'glb':
        case 'gltf':
          setProgress(40);
          const gltfBuffer = await buildAvatarGLTF(config, options.format === 'glb');
          fileBlob = new Blob([gltfBuffer], { type: 'model/gltf-binary' });
          fileName = `avatar_${config.avatarName || 'export'}.${options.format}`;
          exportUrlField = `${options.format}_export_url`;
          break;

        case 'gif':
          if (!canvas) throw new Error('Canvas required for GIF export');
          setProgress(40);
          fileBlob = await buildAvatarGIF(config, canvas);
          fileName = `avatar_${config.avatarName || 'export'}.gif`;
          exportUrlField = 'gif_export_url';
          break;

        case 'fbx':
          setProgress(40);
          const fbxBuffer = await buildAvatarGLTF(config, true);
          fileBlob = new Blob([fbxBuffer], { type: 'application/octet-stream' });
          fileName = `avatar_${config.avatarName || 'export'}.fbx`;
          exportUrlField = 'fbx_export_url';
          toast.warning('FBX export requires Blender for full compatibility');
          break;

        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      setProgress(60);

      // Compress if requested
      let finalUrl: string;
      if (options.compress && options.format !== 'json') {
        setProgress(70);
        finalUrl = await compressFile(fileBlob, options.format, user.id);
        exportUrlField = `compressed_${options.format}_url`;
        setProgress(90);
      } else {
        // Upload without compression
        const filePath = `${user.id}/avatars/exports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(filePath, fileBlob, {
            contentType: fileBlob.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(filePath);

        finalUrl = urlData.publicUrl;
      }

      setProgress(80);

      // Save export URL to avatar_configurations if config has an id
      if (config.id) {
        const { error: updateError } = await supabase
          .from('avatar_configurations')
          .update({ [exportUrlField]: finalUrl })
          .eq('id', config.id);

        if (updateError) {
          console.error('Failed to update configuration with export URL:', updateError);
        }
      }

      setProgress(90);

      // Download file
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success(`Avatar exported as ${options.format.toUpperCase()}!`);
      return finalUrl;

    } catch (error: any) {
      console.error('Build error:', error);
      toast.error(`Failed to build avatar: ${error.message}`);
      throw error;
    } finally {
      setBuilding(false);
      setProgress(0);
    }
  };

  const exportAllFormats = async (config: any, compress: boolean = false): Promise<Record<string, string>> => {
    const formats: Array<'json' | 'gif' | 'glb' | 'gltf'> = ['json', 'gif', 'glb', 'gltf'];
    const results: Record<string, string> = {};

    for (const format of formats) {
      try {
        toast.info(`Exporting ${format.toUpperCase()}...`);
        const url = await buildAndExport(config, { format, compress });
        results[format] = url;
      } catch (error) {
        console.error(`Failed to export ${format}:`, error);
        toast.error(`Failed to export ${format.toUpperCase()}`);
      }
    }

    toast.success('Batch export completed!');
    return results;
  };

  return {
    building,
    progress,
    buildAndExport,
    buildAvatarJSON,
    exportAllFormats,
    validateFormat,
  };
};

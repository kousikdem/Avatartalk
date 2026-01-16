import React, { useState, useEffect } from 'react';
import demoAvatar3D from '@/assets/demo-avatar-3d.png';
import { removeBackground, loadImage } from '@/lib/imageProcessing';

interface RealisticDemoAvatar3DProps {
  className?: string;
  isTalking?: boolean;
}

const RealisticDemoAvatar3D: React.FC<RealisticDemoAvatar3DProps> = ({ 
  className = '',
  isTalking = true 
}) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        // Fetch the image and convert to blob
        const response = await fetch(demoAvatar3D);
        const blob = await response.blob();
        
        // Load as HTMLImageElement
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create object URL for the processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(url);
      } catch (error) {
        console.error('Error processing avatar image:', error);
        // Fallback to original image
        setProcessedImageUrl(demoAvatar3D);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup
    return () => {
      if (processedImageUrl && processedImageUrl !== demoAvatar3D) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, []);

  return (
    <div className={`w-full h-56 relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
         style={{
           background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--accent) / 0.15) 50%, hsl(var(--secondary) / 0.1) 100%)',
         }}>
      {/* Avatar Image */}
      <div className="relative flex items-center justify-center h-full w-full">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Loading avatar...</span>
          </div>
        ) : (
          <img 
            src={processedImageUrl || demoAvatar3D} 
            alt="Demo Avatar"
            className="h-full w-auto max-w-full object-contain"
            style={{
              filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2))',
            }}
          />
        )}
        
        {/* Subtle talking animation overlay when talking */}
        {isTalking && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-full animate-pulse" 
                 style={{ animationDuration: '0.3s' }} />
          </div>
        )}
      </div>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-accent/10 rounded-2xl" />
      </div>
    </div>
  );
};

export default RealisticDemoAvatar3D;

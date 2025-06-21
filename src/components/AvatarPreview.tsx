
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface AvatarPreviewProps {
  isLarge?: boolean;
  showControls?: boolean;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({ isLarge = false, showControls = false }) => {
  const [isTalking, setIsTalking] = React.useState(false);

  return (
    <Card className={`${isLarge ? 'w-full max-w-md' : 'w-64'} bg-gray-800/50 border-gray-700 overflow-hidden backdrop-blur-sm`}>
      <div className="relative">
        <div className={`${isLarge ? 'h-80' : 'h-48'} bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center`}>
          {/* Avatar placeholder - in real app this would be the 3D avatar */}
          <div className={`${isLarge ? 'w-48 h-48' : 'w-32 h-32'} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden`}>
            <img 
              src="/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
            {/* Talking indicator */}
            {isTalking && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse"></div>
            )}
          </div>
        </div>
        
        {showControls && (
          <div className="absolute bottom-4 right-4">
            <Button
              size="sm"
              variant={isTalking ? "destructive" : "default"}
              className="rounded-full w-10 h-10 p-0"
              onClick={() => setIsTalking(!isTalking)}
            >
              {isTalking ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AvatarPreview;

import React, { useRef, useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarVoiceChatProps {
  roomId?: string;
  isInitiator?: boolean;
  onSignal?: (signal: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * AvatarVoiceChat Component
 * Real-time voice/video communication using WebRTC
 * Replaces ElevenLabs TTS with peer-to-peer audio
 */
export const AvatarVoiceChat: React.FC<AvatarVoiceChatProps> = ({
  roomId,
  isInitiator = false,
  onSignal,
  onConnect,
  onDisconnect,
}) => {
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isVideoEnabled,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useWebRTC({
    enableAudio: true,
    enableVideo: false, // Audio-only by default for avatar
  });

  // Attach local stream to audio element
  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.muted = true; // Mute local audio to prevent echo
    }
  }, [localStream]);

  // Attach remote stream to audio element
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(err => {
        console.error('Failed to play remote audio:', err);
      });
    }
  }, [remoteStream]);

  // Handle connection status changes
  useEffect(() => {
    if (isConnected) {
      toast.success('Voice chat connected');
      onConnect?.();
    } else if (!isConnected && remoteStream) {
      toast.info('Voice chat disconnected');
      onDisconnect?.();
    }
  }, [isConnected, remoteStream, onConnect, onDisconnect]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(`Voice chat error: ${error}`);
    }
  }, [error]);

  const handleStartCall = async () => {
    try {
      await startCall(isInitiator);
      toast.success('Starting voice chat...');
    } catch (err) {
      console.error('Failed to start call:', err);
      toast.error('Failed to start voice chat');
    }
  };

  const handleEndCall = () => {
    endCall();
    toast.info('Voice chat ended');
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Avatar Voice Chat {roomId && `(Room: ${roomId})`}
        </h3>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>

      {/* Hidden audio elements */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      {/* Connection status */}
      <div className="text-sm text-muted-foreground">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isConnected ? (
          <Button onClick={handleStartCall} className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Start Voice Chat
          </Button>
        ) : (
          <>
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              onClick={toggleMute}
              className="flex-1"
            >
              {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>

            <Button
              variant={isVideoEnabled ? 'secondary' : 'destructive'}
              onClick={toggleVideo}
              className="flex-1"
            >
              {isVideoEnabled ? <Video className="w-4 h-4 mr-2" /> : <VideoOff className="w-4 h-4 mr-2" />}
              {isVideoEnabled ? 'Video On' : 'Video Off'}
            </Button>

            <Button variant="destructive" onClick={handleEndCall} className="flex-1">
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!isConnected && (
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-semibold mb-1">WebRTC Voice Chat</p>
          <p>Click "Start Voice Chat" to begin real-time audio communication.</p>
          <p className="mt-1">This uses peer-to-peer WebRTC instead of ElevenLabs.</p>
        </div>
      )}
    </Card>
  );
};

export default AvatarVoiceChat;

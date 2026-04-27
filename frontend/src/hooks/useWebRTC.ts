import { useState, useEffect, useRef, useCallback } from 'react';
import SimplePeer from 'simple-peer';

interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  enableAudio?: boolean;
  enableVideo?: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peer: SimplePeer.Instance | null;
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  error: string | null;
  startCall: (isInitiator: boolean, signalData?: any) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  sendSignal: (data: any) => void;
  receiveSignal: (signal: any) => void;
}

/**
 * WebRTC Hook for AvatarTalk Voice/Video Communication
 * Replaces ElevenLabs with real-time peer-to-peer communication
 */
export const useWebRTC = (config: WebRTCConfig = {}): UseWebRTCReturn => {
  const {
    iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    enableAudio = true,
    enableVideo = false,
  } = config;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(enableVideo);
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<SimplePeer.Instance | null>(null);

  // Get user media (audio/video)
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: enableAudio,
        video: enableVideo,
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access media devices';
      setError(errorMessage);
      console.error('getUserMedia error:', err);
      return null;
    }
  }, [enableAudio, enableVideo]);

  // Start call (as initiator or receiver)
  const startCall = useCallback(async (isInitiator: boolean, signalData?: any) => {
    try {
      const stream = await getUserMedia();
      if (!stream) return;

      const peerInstance = new SimplePeer({
        initiator: isInitiator,
        stream: stream,
        trickle: false,
        config: {
          iceServers: iceServers,
        },
      });

      // Handle peer events
      peerInstance.on('signal', (data) => {
        console.log('WebRTC signal generated:', data);
        // This signal needs to be sent to the other peer via your signaling server
        // You can use Supabase Realtime or WebSocket for signaling
      });

      peerInstance.on('stream', (remoteStreamData) => {
        console.log('Received remote stream');
        setRemoteStream(remoteStreamData);
      });

      peerInstance.on('connect', () => {
        console.log('WebRTC peer connected');
        setIsConnected(true);
        setError(null);
      });

      peerInstance.on('error', (err) => {
        console.error('WebRTC peer error:', err);
        setError(err.message);
        setIsConnected(false);
      });

      peerInstance.on('close', () => {
        console.log('WebRTC peer connection closed');
        setIsConnected(false);
      });

      // If receiving a call, process the signal
      if (!isInitiator && signalData) {
        peerInstance.signal(signalData);
      }

      setPeer(peerInstance);
      peerRef.current = peerInstance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start call';
      setError(errorMessage);
      console.error('startCall error:', err);
    }
  }, [getUserMedia, iceServers]);

  // End call and cleanup
  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
      setPeer(null);
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);
    setIsConnected(false);
    setError(null);
  }, [localStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Send signal to remote peer
  const sendSignal = useCallback((data: any) => {
    if (peerRef.current) {
      peerRef.current.signal(data);
    }
  }, []);

  // Receive signal from remote peer
  const receiveSignal = useCallback((signal: any) => {
    if (peerRef.current) {
      peerRef.current.signal(signal);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    peer,
    isConnected,
    isMuted,
    isVideoEnabled,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    sendSignal,
    receiveSignal,
  };
};

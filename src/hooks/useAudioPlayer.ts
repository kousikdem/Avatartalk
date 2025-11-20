import { useState, useRef, useCallback } from 'react';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);

  const playAudio = useCallback(async (base64Audio: string) => {
    // Add to queue
    audioQueueRef.current.push(base64Audio);

    // If already playing, let the queue process
    if (isPlaying) {
      return;
    }

    // Start playing queue
    await processQueue();
  }, [isPlaying]);

  const processQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const base64Audio = audioQueueRef.current.shift()!;

    try {
      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        processQueue(); // Play next in queue
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        processQueue(); // Continue with next
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      processQueue(); // Continue with next
    }
  };

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioQueueRef.current = [];
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    playAudio,
    stopAudio,
  };
};

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Volume2, VolumeX, Send, Smile, Loader2 } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  lastAIMessage?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  lastAIMessage
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  
  // Voice input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: voiceInputSupported
  } = useVoiceInput();

  // Voice output hook
  const {
    synthesizeSpeech,
    stopSpeech,
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    isSupported: voiceOutputSupported
  } = useCoquiTTS();

  // Update message when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setMessage(message + transcript);
      resetTranscript();
    }
  }, [transcript, message, setMessage, resetTranscript]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening({ continuous: false, interimResults: true });
    }
  };

  const handleVoiceOutput = async () => {
    if (isTTSPlaying) {
      stopSpeech();
    } else if (lastAIMessage) {
      await synthesizeSpeech(lastAIMessage, {
        voice: 'alloy',
        speed: 1.0
      });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (message.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="bg-slate-800/60 rounded-2xl border border-slate-600/50 px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
        <Input
          value={message + (isListening ? ` ${interimTranscript}` : '')}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="border-0 bg-transparent text-white placeholder:text-slate-400 flex-1 focus-visible:ring-0 p-0"
          disabled={disabled}
        />
        
        {/* Emoji Button - Yellow/Orange Gradient */}
        <Button 
          size="sm" 
          variant="ghost" 
          type="button"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          className="h-8 w-8 p-0 rounded-full flex-shrink-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500 hover:from-yellow-500 hover:via-orange-500 hover:to-amber-600 shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-110"
        >
          <Smile className="w-4 h-4 text-white" />
        </Button>
        
        {/* Voice Input Button - Red/Pink Gradient */}
        {voiceInputSupported && (
          <Button 
            size="sm" 
            variant="ghost" 
            type="button"
            onClick={handleVoiceInput}
            className={`h-8 w-8 p-0 rounded-full flex-shrink-0 transition-all duration-300 hover:scale-110 ${
              isListening 
                ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/50 animate-pulse' 
                : 'bg-gradient-to-br from-red-400 via-pink-500 to-rose-500 hover:from-red-500 hover:via-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30'
            }`}
            disabled={isTTSLoading || disabled}
          >
            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
          </Button>
        )}
        
        {/* Voice Output Button - Blue/Purple Gradient */}
        {voiceOutputSupported && lastAIMessage && (
          <Button 
            size="sm" 
            variant="ghost" 
            type="button"
            onClick={handleVoiceOutput}
            className={`h-8 w-8 p-0 rounded-full flex-shrink-0 transition-all duration-300 hover:scale-110 ${
              isTTSPlaying 
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-violet-600 shadow-lg shadow-purple-500/50 animate-pulse' 
                : 'bg-gradient-to-br from-blue-400 via-purple-500 to-violet-500 hover:from-blue-500 hover:via-purple-600 hover:to-violet-600 shadow-lg shadow-purple-500/30'
            }`}
            disabled={isTTSLoading || disabled}
          >
            {isTTSLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : isTTSPlaying ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </Button>
        )}
        
        {/* Send Button - Green/Teal Gradient */}
        <Button 
          size="sm" 
          variant="ghost" 
          type="submit"
          className={`h-8 w-8 p-0 rounded-full flex-shrink-0 transition-all duration-300 hover:scale-110 ${
            message.trim() && !disabled
              ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30'
              : 'bg-slate-700/50 opacity-50'
          }`}
          disabled={!message.trim() || disabled}
        >
          <Send className="w-4 h-4 text-white" />
        </Button>
      </div>

      <EmojiPicker 
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </form>
  );
};

export default MessageInput;

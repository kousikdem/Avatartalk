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
      <div className="bg-slate-800/50 dark:bg-slate-800/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-slate-600/50 dark:border-slate-600/50 border-gray-300 px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
        <Input
          value={message + (isListening ? ` ${interimTranscript}` : '')}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="border-0 bg-transparent text-white dark:text-white text-gray-900 placeholder:text-slate-400 dark:placeholder:text-slate-400 placeholder:text-gray-500 flex-1 focus-visible:ring-0 p-0"
          disabled={disabled}
        />
        
        {/* Emoji Button with Gradient */}
        <Button 
          size="sm" 
          variant="ghost" 
          type="button"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          className="h-8 w-8 p-0 rounded-full flex-shrink-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 hover:from-yellow-500 hover:via-orange-500 hover:to-pink-500 shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
        >
          <Smile className="w-4 h-4 text-white" />
        </Button>
        
        {/* Voice Input Button with Gradient */}
        {voiceInputSupported && (
          <Button 
            size="sm" 
            variant="ghost" 
            type="button"
            onClick={handleVoiceInput}
            className={`h-8 w-8 p-0 rounded-full flex-shrink-0 shadow-lg transition-all duration-300 ${
              isListening 
                ? 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600 animate-pulse shadow-red-500/50' 
                : 'bg-gradient-to-br from-red-400 via-pink-500 to-rose-500 hover:from-red-500 hover:via-pink-600 hover:to-rose-600 hover:shadow-pink-500/30'
            }`}
            disabled={isTTSLoading || disabled}
          >
            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
          </Button>
        )}
        
        {/* Voice Output Button with Gradient */}
        {voiceOutputSupported && lastAIMessage && (
          <Button 
            size="sm" 
            variant="ghost" 
            type="button"
            onClick={handleVoiceOutput}
            className={`h-8 w-8 p-0 rounded-full flex-shrink-0 shadow-lg transition-all duration-300 ${
              isTTSPlaying 
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-violet-600 animate-pulse shadow-purple-500/50' 
                : 'bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-500 hover:from-blue-500 hover:via-purple-600 hover:to-indigo-600 hover:shadow-purple-500/30'
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
        
        {/* Send Button with Gradient */}
        <Button 
          size="sm" 
          variant="ghost" 
          type="submit"
          className="h-8 w-8 p-0 rounded-full flex-shrink-0 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 hover:from-emerald-500 hover:via-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

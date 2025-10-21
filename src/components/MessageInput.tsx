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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-600/50 px-4 py-3 flex items-center gap-3">
        <Input
          value={message + (isListening ? ` ${interimTranscript}` : '')}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="border-0 bg-transparent text-white placeholder:text-slate-400 flex-1 focus-visible:ring-0 p-0"
          disabled={disabled}
        />
        
        <Button 
          size="sm" 
          variant="ghost" 
          type="button"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full flex-shrink-0"
        >
          <Smile className="w-4 h-4 text-slate-400" />
        </Button>
        
        {voiceInputSupported && (
          <Button 
            size="sm" 
            variant="ghost" 
            type="button"
            onClick={handleVoiceInput}
            className={`h-8 w-8 p-0 hover:bg-slate-700 rounded-full flex-shrink-0 ${
              isListening ? 'bg-red-600/20 text-red-400' : ''
            }`}
            disabled={isTTSLoading || disabled}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-400" />}
          </Button>
        )}
        
        {voiceOutputSupported && lastAIMessage && (
          <Button 
            size="sm" 
            variant="ghost" 
            type="button"
            onClick={handleVoiceOutput}
            className={`h-8 w-8 p-0 hover:bg-slate-700 rounded-full flex-shrink-0 ${
              isTTSPlaying ? 'text-blue-400' : 'text-slate-400'
            }`}
            disabled={isTTSLoading || disabled}
          >
            {isTTSLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isTTSPlaying ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        )}
        
        <Button 
          size="sm" 
          variant="ghost" 
          type="submit"
          className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full flex-shrink-0"
          disabled={!message.trim() || disabled}
        >
          <Send className="w-4 h-4 text-slate-400" />
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

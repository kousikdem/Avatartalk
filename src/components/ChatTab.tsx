import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Volume2, VolumeX, Send, Smile, Facebook, X, Instagram, Youtube, Linkedin, Loader2 } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { LinkCard } from './LinkCard';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface ChatMessage {
  message: string;
  timestamp: Date;
  type: 'user' | 'avatar';
}

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  pinterest?: string;
  website?: string;
}

interface ChatTabProps {
  conversations: ChatMessage[];
  onSendMessage: () => void;
  message: string;
  setMessage: (message: string) => void;
  isEmojiPickerOpen: boolean;
  setIsEmojiPickerOpen: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
  socialLinks: SocialLinks | null;
}

interface ChatTabProps {
  conversations: ChatMessage[];
  onSendMessage: () => void;
  message: string;
  setMessage: (message: string) => void;
  isEmojiPickerOpen: boolean;
  setIsEmojiPickerOpen: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
  socialLinks: SocialLinks | null;
  profilePicUrl?: string;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  conversations,
  onSendMessage,
  message,
  setMessage,
  isEmojiPickerOpen,
  setIsEmojiPickerOpen,
  onEmojiSelect,
  socialLinks,
  profilePicUrl
}) => {
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
    } else {
      const lastMessage = conversations[conversations.length - 1];
      if (lastMessage && lastMessage.type === 'avatar') {
        await synthesizeSpeech(lastMessage.message, {
          voice: 'alloy',
          speed: 1.0
        });
      }
    }
  };
  return (
    <div className="space-y-4">
      {/* Chat Messages */}
      <div className="bg-slate-800/30 border border-slate-600/50 rounded-lg p-4 max-h-64 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${conv.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {conv.type === 'avatar' && profilePicUrl && (
                  <img
                    src={profilePicUrl}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    conv.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <p className="text-sm">{conv.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {conv.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {/* AI suggested links */}
            {conversations.length > 2 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] space-y-2">
                  <p className="text-xs text-slate-400 mb-2">Suggested links:</p>
                  <LinkCard url="https://example.com/product" title="Example Product" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">Start a conversation with the AI avatar</p>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="relative">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-600/50 px-4 py-3 flex items-center gap-3">
          <Input
            value={message + (isListening ? ` ${interimTranscript}` : '')}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="border-0 bg-transparent text-white placeholder:text-slate-400 flex-1 focus-visible:ring-0 p-0"
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          />
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full"
          >
            <Smile className="w-4 h-4 text-slate-400" />
          </Button>
          {voiceInputSupported && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleVoiceInput}
              className={`h-8 w-8 p-0 hover:bg-slate-700 rounded-full ${
                isListening ? 'bg-red-600/20 text-red-400' : ''
              }`}
              disabled={isTTSLoading}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-400" />}
            </Button>
          )}
          {voiceOutputSupported && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleVoiceOutput}
              className={`h-8 w-8 p-0 hover:bg-slate-700 rounded-full ${
                isTTSPlaying ? 'text-blue-400' : 'text-slate-400'
              }`}
              disabled={isTTSLoading}
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
            onClick={onSendMessage}
            className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full"
          >
            <Send className="w-4 h-4 text-slate-400" />
          </Button>
        </div>


        <EmojiPicker 
          isOpen={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
          onEmojiSelect={onEmojiSelect}
        />
      </div>
    </div>
  );
};

export default ChatTab;
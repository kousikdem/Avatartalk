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
      <div className="gradient-card backdrop-blur-sm p-4 max-h-64 overflow-y-auto">
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
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-muted/80 to-muted text-foreground'
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
                  <p className="text-xs text-muted-foreground mb-2">Suggested links:</p>
                  <LinkCard url="https://example.com/product" title="Example Product" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Start a conversation with the AI avatar</p>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="relative">
        <div className="gradient-card backdrop-blur-sm px-4 py-3 flex items-center gap-3">
          <Input
            value={message + (isListening ? ` ${interimTranscript}` : '')}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground flex-1 focus-visible:ring-0 p-0"
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          />
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className="h-8 w-8 p-0 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-full border-0"
          >
            <Smile className="w-4 h-4" />
          </Button>
          {voiceInputSupported && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleVoiceInput}
              className={`h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full border-0 ${
                isListening ? 'animate-pulse' : ''
              }`}
              disabled={isTTSLoading}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          {voiceOutputSupported && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleVoiceOutput}
              className={`h-8 w-8 p-0 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-full border-0 ${
                isTTSPlaying ? 'animate-pulse' : ''
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
            className="h-8 w-8 p-0 hover:bg-primary/20 rounded-full text-primary"
          >
            <Send className="w-4 h-4" />
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
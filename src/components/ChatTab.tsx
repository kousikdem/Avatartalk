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
      <div className="bg-slate-800/30 dark:bg-slate-800/30 bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-slate-600/50 dark:border-slate-600/50 border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto backdrop-blur-sm">
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
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 text-white'
                      : 'bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-800 from-gray-100 to-gray-200 text-slate-200 dark:text-slate-200 text-gray-800'
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
                  <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-600 mb-2">Suggested links:</p>
                  <LinkCard url="https://example.com/product" title="Example Product" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 dark:text-slate-400 text-gray-600">Start a conversation with the AI avatar</p>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="relative">
        <div className="bg-slate-800/50 dark:bg-slate-800/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-slate-600/50 dark:border-slate-600/50 border-gray-300 px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
          <Input
            value={message + (isListening ? ` ${interimTranscript}` : '')}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="border-0 bg-transparent text-white dark:text-white text-gray-900 placeholder:text-slate-400 dark:placeholder:text-slate-400 placeholder:text-gray-500 flex-1 focus-visible:ring-0 p-0"
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          />
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className="h-8 w-8 p-0 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-blue-100 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
          >
            <Smile className="w-4 h-4 text-slate-400 dark:text-slate-400 text-gray-700" />
          </Button>
          {voiceInputSupported && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleVoiceInput}
              className={`h-8 w-8 p-0 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-blue-100 rounded-full bg-gradient-to-r from-red-400/20 to-pink-400/20 ${
                isListening ? 'bg-red-600/20 text-red-400' : ''
              }`}
              disabled={isTTSLoading}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-400 dark:text-slate-400 text-gray-700" />}
            </Button>
          )}
          {voiceOutputSupported && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleVoiceOutput}
              className={`h-8 w-8 p-0 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-blue-100 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 ${
                isTTSPlaying ? 'text-blue-400' : 'text-slate-400 dark:text-slate-400 text-gray-700'
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
            className="h-8 w-8 p-0 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-blue-100 rounded-full"
          >
            <Send className="w-4 h-4 text-slate-400 dark:text-slate-400 text-gray-700" />
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
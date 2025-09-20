import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Volume2, VolumeX, Send, Smile, Facebook, X, Instagram, Youtube, Linkedin, Loader2 } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { LinkCard } from './LinkCard';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  message: string;
  timestamp: Date;
  type: 'user' | 'avatar';
  profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
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
  currentUser?: any;
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
  currentUser
}) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  // Fetch current user profile for chat display
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', currentUser.id)
            .single();
          
          if (data && !error) {
            setCurrentUserProfile(data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser?.id]);
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
                className={`flex items-start gap-3 ${conv.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {conv.type === 'avatar' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src="/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
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
                {conv.type === 'user' && currentUserProfile && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={currentUserProfile.avatar_url} />
                    <AvatarFallback>
                      {(currentUserProfile.display_name || currentUserProfile.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
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

        {/* Social Media Icons Row */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => socialLinks?.facebook ? window.open(socialLinks.facebook, '_blank') : window.open('https://facebook.com', '_blank')}
          >
            <Facebook className="w-4 h-4 text-slate-400" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => socialLinks?.twitter ? window.open(socialLinks.twitter, '_blank') : window.open('https://x.com', '_blank')}
          >
            <X className="w-4 h-4 text-slate-400" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => socialLinks?.instagram ? window.open(socialLinks.instagram, '_blank') : window.open('https://instagram.com', '_blank')}
          >
            <Instagram className="w-4 h-4 text-slate-400" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => socialLinks?.youtube ? window.open(socialLinks.youtube, '_blank') : window.open('https://youtube.com', '_blank')}
          >
            <Youtube className="w-4 h-4 text-slate-400" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => socialLinks?.linkedin ? window.open(socialLinks.linkedin, '_blank') : window.open('https://linkedin.com', '_blank')}
          >
            <Linkedin className="w-4 h-4 text-slate-400" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => socialLinks?.pinterest ? window.open(socialLinks.pinterest, '_blank') : window.open('https://pinterest.com', '_blank')}
          >
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.803 1.604.803 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.003-4.625 4.137 0 .695.366 1.56.951 1.836.096-.084.14-.221.105-.343-.084-.307-.273-1.072-.273-1.224 0-.12.061-.232.199-.232.113 0 .168.069.168.162 0 .479-.304 1.124-.304 1.913 0 1.186.909 2.142 2.343 2.142 1.086 0 1.684-.638 1.684-1.524 0-.585-.34-1.264-.34-1.264-.229-.479-.229-1.072 0-1.551.229-.479.799-.479 1.028 0 .229.479.229 1.072 0 1.551 0 0-.34.679-.34 1.264 0 .886.598 1.524 1.684 1.524 1.434 0 2.343-.956 2.343-2.142 0-.789-.304-1.434-.304-1.913 0-.093.055-.162.168-.162.138 0 .199.112.199.232 0 .152-.189.917-.273 1.224-.035.122.009.259.105.343.585-.276.951-1.141.951-1.836 0-2.134-1.604-4.137-4.625-4.137-2.428 0-4.316 1.73-4.316 4.042 0 2.413 1.522 4.354 3.633 4.354.709 0 1.375-.367 1.604-.803l.437 1.664c.157.608.584 1.37.87 1.835A11.936 11.936 0 0 1 12 19z"/>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => window.open('https://reddit.com', '_blank')}
          >
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full hover:bg-slate-700 p-0"
            onClick={() => window.open('https://discord.com', '_blank')}
          >
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
            </svg>
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
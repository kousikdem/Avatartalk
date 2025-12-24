import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import VisitorAuth from './VisitorAuth';
import MainAuth from './MainAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFollows } from '@/hooks/useFollows';
import { usePersonalizedAI } from '@/hooks/usePersonalizedAI';
import { usePosts } from '@/hooks/usePosts';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useDefaultAvatar } from '@/hooks/useDefaultAvatar';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { useAIChatHistory } from '@/hooks/useAIChatHistory';
import { useProfileEngagement } from '@/hooks/useProfileEngagement';
import FuturisticAvatar3D from './FuturisticAvatar3D';
import ChangeableAvatarPreview from './ChangeableAvatarPreview';
import SocialFeed from './SocialFeed';
import FollowButton from './FollowButton';
import SubscribeButton from './SubscribeButton';
import SubscriberBadge from './SubscriberBadge';
import LoyaltyBadge from './LoyaltyBadge';
import EnhancedShareModal from './EnhancedShareModal';
import SocialLinksMenu from './SocialLinksMenu';
import SocialLinksPopup from './SocialLinksPopup';
import EnhancedPostCardWithLocks from './EnhancedPostCardWithLocks';
import EmojiPicker from './EmojiPicker';
import MessageInput from './MessageInput';
import { CompactProductCard } from './CompactProductCard';
import VirtualCollaborationCard from './VirtualCollaborationCard';
import TokenGiftModal from './TokenGiftModal';
import {
  MessageCircle,
  Share2,
  Heart,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Smile,
  Users,
  ArrowDown,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Globe,
  User,
  Moon,
  Sun,
  Github,
  Twitch,
  Music,
  FileText,
  BadgeCheck,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  profile_pic_url?: string;
  profession: string;
  followers_count?: number;
  following_count?: number;
}

interface AvatarConfiguration {
  id: string;
  user_id: string;
  avatar_name: string;
  gender: string;
  age_category: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  eye_color: string;
  height: number;
  current_pose: string;
  current_expression: string;
}

interface UserStats {
  total_conversations: number;
  followers_count: number;
  engagement_score: number;
}

interface Post {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url?: string;
  is_free: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'avatar';
  senderName?: string;
  senderAvatar?: string;
  isVoiceMessage?: boolean;
  voiceTranscript?: string;
  richData?: {
    buttons?: Array<{
      text: string;
      url: string;
    }>;
    links?: Array<{
      url: string;
      title: string;
      preview: string;
    }>;
    documents?: Array<{
      filename: string;
      type: string;
      preview: string;
    }>;
  };
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTalking, setIsTalking] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [topChatMessage, setTopChatMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);
  const [isMainAuthOpen, setIsMainAuthOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [visitorProfile, setVisitorProfile] = useState<any>(null);
  const [postsTabMessage, setPostsTabMessage] = useState('');
  const [productsTabMessage, setProductsTabMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [aiTrainingSettings, setAiTrainingSettings] = useState<any>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const { toast } = useToast();

  const {
    followers,
    following,
    isFollowing,
    followUser,
    unfollowUser,
    loading: followsLoading,
    refetch: refetchFollows
  } = useFollows(currentUser?.id); // Use current user's ID, not profile being viewed

  const { trainings, currentTraining } = usePersonalizedAI();
  const { posts: userPosts, isLoading: postsLoading, fetchPosts } = usePosts(profile?.id);
  
  // Check if current user is subscribed to this profile
  const { isActiveSubscriber, badgeConfig } = useActiveSubscription(currentUser?.id, profile?.id);
  const { 
    defaultConfig, 
    saveAsDefault, 
    linkWithProfile, 
    createDefaultForNewUsers,
    loading: defaultAvatarLoading 
  } = useDefaultAvatar();
  
  // Voice functionality
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const { 
    synthesizeSpeech, 
    startRecording, 
    stopRecording, 
    isLoading, 
    isRecording, 
    isPlaying, 
    stopSpeech 
  } = useCoquiTTS();
  
  // Import voice chat hook
  const { 
    isProcessing: isVoiceProcessing,
    isPlayingAudio,
    processVoiceChat,
    playAudioResponse,
    stopAudio
  } = useVoiceChat();

  // Chat history persistence
  const { 
    chatHistory, 
    loading: chatHistoryLoading, 
    saveMessage: saveChatMessage,
    sessionId 
  } = useAIChatHistory(profile?.id || null, currentUser?.id || null);

  // Profile engagement stats (real-time)
  const { 
    engagement, 
    loading: engagementLoading,
    incrementConversation 
  } = useProfileEngagement(profile?.id || null);

  // Voice model state - preload on profile load
  const [voiceModelReady, setVoiceModelReady] = useState(false);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  const [lastVisitTimestamp, setLastVisitTimestamp] = useState<number | null>(null);
  const REWELCOME_THRESHOLD_MS = 29 * 60 * 1000; // 29 minutes in milliseconds

  // Fetch AI training settings for welcome message
  useEffect(() => {
    const fetchAISettings = async () => {
      if (!profile?.id) return;
      
      try {
        const { data } = await supabase
          .from('ai_training_settings')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();
        
        if (data) {
          setAiTrainingSettings(data);
        }
      } catch (error) {
        console.error('Error fetching AI settings:', error);
      }
    };
    
    fetchAISettings();
  }, [profile?.id]);

  // Get visitor's display name for greeting
  const getVisitorName = (): string => {
    if (visitorProfile?.display_name) return visitorProfile.display_name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Guest';
  };

  // Build personalized welcome/greeting message
  const buildGreetingMessage = (isReturningVisitor: boolean = false): string => {
    const visitorName = getVisitorName();
    const profileOwnerName = profile?.display_name || profile?.username || 'I';
    
    if (aiTrainingSettings?.welcome_message_enabled && aiTrainingSettings?.welcome_message_text) {
      // Replace variables in custom welcome message
      let welcomeText = aiTrainingSettings.welcome_message_text;
      welcomeText = welcomeText.replace(/{visitor_name}/gi, visitorName);
      welcomeText = welcomeText.replace(/{username}/gi, profile?.username || '');
      welcomeText = welcomeText.replace(/{display_name}/gi, profileOwnerName);
      return welcomeText;
    }
    
    // Default greeting with visitor name
    if (isReturningVisitor) {
      return `Welcome back, ${visitorName}! I'm ${profileOwnerName}. How can I help you today?`;
    }
    return `Hi ${visitorName}! I'm ${profileOwnerName}. How can I help you today?`;
  };

  // Check if visitor should be re-welcomed (after 29+ min away)
  const shouldRewelcome = (): boolean => {
    const storageKey = `profile_visit_${profile?.id}`;
    const lastVisit = localStorage.getItem(storageKey);
    
    if (lastVisit) {
      const timeSinceLastVisit = Date.now() - parseInt(lastVisit, 10);
      return timeSinceLastVisit >= REWELCOME_THRESHOLD_MS;
    }
    return false; // First visit - will use initial welcome
  };

  // Update last visit timestamp
  const updateLastVisitTimestamp = () => {
    if (profile?.id) {
      const storageKey = `profile_visit_${profile.id}`;
      localStorage.setItem(storageKey, Date.now().toString());
    }
  };

  // Initialize and load chat messages from database
  useEffect(() => {
    if (profile && !chatHistoryLoading) {
      const isReturning = shouldRewelcome();
      
      // Always prepend welcome message first, then chat history
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        content: buildGreetingMessage(isReturning),
        timestamp: new Date().toISOString(),
        sender: 'avatar',
        senderName: profile.display_name || profile.username,
        senderAvatar: profile.profile_pic_url || profile.avatar_url
      };
      
      if (chatHistory.length > 0) {
        // Load previous chat history with profile info, prepend welcome
        const messagesWithProfile: ChatMessage[] = chatHistory.map(msg => ({
          ...msg,
          senderName: msg.sender === 'avatar' 
            ? (profile.display_name || profile.username) 
            : getVisitorName(),
          senderAvatar: msg.sender === 'avatar' 
            ? (profile.profile_pic_url || profile.avatar_url)
            : currentUser?.user_metadata?.avatar_url
        }));
        setChatMessages([welcomeMessage, ...messagesWithProfile]);
      } else {
        // Just welcome message for new conversations
        setChatMessages([welcomeMessage]);
      }
      
      // Update last visit timestamp
      updateLastVisitTimestamp();
    }
  }, [profile, chatHistory, chatHistoryLoading, currentUser, aiTrainingSettings, visitorProfile]);

  // Play voice greeting (called from Talk to Me button or on 29min re-welcome)
  const playVoiceGreeting = async (message?: string) => {
    const greetingText = message || buildGreetingMessage(shouldRewelcome());
    
    try {
      setIsTalking(true);
      await synthesizeSpeech(greetingText, {
        voice: 'neural',
        speed: 1.0,
        language: 'en-US'
      });
    } catch (error) {
      console.error('Voice greeting error:', error);
    } finally {
      setIsTalking(false);
    }
  };

  // Handle "Talk to Me" button click - switch to chat tab and greet with voice
  const handleTalkToMeClick = async () => {
    // Switch to chat tab
    setActiveTab('chat');
    
    // Create personalized greeting
    const visitorName = getVisitorName();
    const profileOwnerName = profile?.display_name || profile?.username || 'I';
    const greetingMessage = `Hi ${visitorName}! I'm ${profileOwnerName}. How can I help you today?`;
    
    // Add greeting to chat if not already present
    const hasRecentGreeting = chatMessages.some(
      m => m.sender === 'avatar' && 
           m.content.toLowerCase().includes('how can i help') &&
           Date.now() - new Date(m.timestamp).getTime() < 30000 // Within last 30 seconds
    );
    
    if (!hasRecentGreeting) {
      const newGreeting: ChatMessage = {
        id: 'greeting-' + Date.now(),
        content: greetingMessage,
        timestamp: new Date().toISOString(),
        sender: 'avatar',
        senderName: profile?.display_name || profile?.username,
        senderAvatar: profile?.profile_pic_url || profile?.avatar_url
      };
      setChatMessages(prev => [...prev, newGreeting]);
      
      // Play voice greeting
      await playVoiceGreeting(greetingMessage);
    } else {
      // Just play the existing welcome message
      const lastAvatarMsg = chatMessages.filter(m => m.sender === 'avatar').pop();
      if (lastAvatarMsg) {
        await playVoiceGreeting(lastAvatarMsg.content);
      }
    }
    
    setHasPlayedWelcome(true);
  };

  // Check for 29-minute re-welcome on profile load
  useEffect(() => {
    if (profile && !loading && activeTab === 'chat') {
      const isReturning = shouldRewelcome();
      
      if (isReturning && !hasPlayedWelcome) {
        // Delay the voice greeting slightly for better UX
        const timer = setTimeout(async () => {
          const welcomeMsg = buildGreetingMessage(true);
          
          // Add re-welcome message to chat
          const rewelcomeMessage: ChatMessage = {
            id: 'rewelcome-' + Date.now(),
            content: welcomeMsg,
            timestamp: new Date().toISOString(),
            sender: 'avatar',
            senderName: profile.display_name || profile.username,
            senderAvatar: profile.profile_pic_url || profile.avatar_url
          };
          setChatMessages(prev => [...prev, rewelcomeMessage]);
          
          // Play voice welcome
          await playVoiceGreeting(welcomeMsg);
          setHasPlayedWelcome(true);
          updateLastVisitTimestamp();
        }, 1500);
        
        return () => clearTimeout(timer);
      }
      
      setVoiceModelReady(true);
    }
  }, [profile, loading, activeTab, hasPlayedWelcome]);

  const profileData = useMemo(() => ({
    displayName: profile?.display_name || profile?.username || 'Unknown User',
    username: profile?.username || '',
    bio: profile?.bio || "Exploring the boundaries of AI conversation. Let's create something amazing!",
    avatarInitial: (profile?.display_name?.[0] || profile?.username?.[0] || 'U').toUpperCase()
  }), [profile]);

  // Check if this is the user's own profile
  const isOwnProfile = currentUser?.id === profile?.id;

  // Real-time follower count updates from database
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('profile-follows-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`
        },
        () => {
          // Profile will be refetched when it changes
          refetchFollows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, refetchFollows]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
      
      // Create default avatar for new users
      if (data.user) {
        await createDefaultForNewUsers();
      }
    };
    getCurrentUser();

    // Listen for visitor auth requests
    const handleVisitorAuth = () => {
      setIsVisitorAuthOpen(true);
    };

    window.addEventListener('show-visitor-auth', handleVisitorAuth);
    return () => window.removeEventListener('show-visitor-auth', handleVisitorAuth);
  }, []);

  useEffect(() => {
    if (username) {
      fetchProfile();
      
      // Show auth popup for unauthenticated users
      const checkAndShowVisitorAuth = async () => {
        const { data } = await supabase.auth.getUser();
        
        // Show popup for users who aren't authenticated
        if (!data.user) {
          setTimeout(() => {
            setIsVisitorAuthOpen(true);
          }, 1000);
        }
      };
      
      checkAndShowVisitorAuth();
    }
  }, [username]);

  // Load posts when profile is loaded - with error handling
  useEffect(() => {
    if (profile?.id) {
      const loadPosts = async () => {
        try {
          await fetchPosts();
        } catch (error) {
          console.error('Error loading posts:', error);
          toast({
            title: "Posts Load Error",
            description: "Failed to load posts. Please refresh the page.",
            variant: "destructive",
          });
        }
      };
      loadPosts();
    }
  }, [profile?.id]);

  // Realtime subscriptions for profile data
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`profile-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${profile.id}`
        },
        () => {
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${profile.id}`
        },
        async () => {
          const { data } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', profile.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(6);
          if (data) setProducts(data);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`
        },
        async () => {
          const { data } = await supabase
            .rpc('get_public_profile', { profile_id: profile.id });
          if (data && data.length > 0) setProfile(data[0]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows'
        },
        () => {
          refetchFollows();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${profile.id}`
        },
        async () => {
          const { data } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', profile.id)
            .maybeSingle();
          if (data) setUserStats(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchPosts, refetchFollows]);

  const fetchProfile = async () => {
    try {
      // Parallel fetch: get profile ID and current user simultaneously
      const [profileIdResult, userResult] = await Promise.all([
        supabase.from('profiles').select('id').eq('username', username).maybeSingle(),
        supabase.auth.getUser()
      ]);
        
      if (profileIdResult.error) throw profileIdResult.error;
      if (!profileIdResult.data) throw new Error('Profile not found');
      
      const profileId = profileIdResult.data.id;
      
      // Parallel fetch: profile data and all related data at once
      const [profileResult, statsResult, productsResult, eventsResult, avatarResult, socialLinksResult] = await Promise.all([
        supabase.rpc('get_public_profile', { profile_id: profileId }),
        supabase.from('user_stats').select('*').eq('user_id', profileId).maybeSingle(),
        supabase.from('products').select('*').eq('user_id', profileId).eq('status', 'published').order('created_at', { ascending: false }).limit(6),
        supabase.from('events').select('*').eq('user_id', profileId).in('status', ['published', 'upcoming']).order('created_at', { ascending: false }).limit(6),
        supabase.from('avatar_configurations').select('*').eq('user_id', profileId).eq('is_active', true).maybeSingle(),
        supabase.from('social_links').select('*').eq('user_id', profileId).maybeSingle()
      ]);
        
      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data || profileResult.data.length === 0) throw new Error('Profile not found');
      
      const profileData = profileResult.data[0];

      // Set all state at once to minimize re-renders
      setProfile(profileData);
      setUserStats(statsResult.data);
      setProducts(productsResult.data || []);
      setEvents(eventsResult.data || []);
      setAvatarConfig(avatarResult.data);
      setSocialLinks(socialLinksResult.data);
      setLoading(false);

      // Track profile visit (fire and forget - don't await)
      const currentUserId = userResult.data.user?.id;
      if (profileData.id !== currentUserId) {
        supabase.from('profile_visitors').insert({
          visitor_id: currentUserId || null,
          visited_profile_id: profileData.id,
        });
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !currentUser) return;
    
    try {
      if (isFollowing(profile.id)) {
        await unfollowUser(profile.id);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profile.display_name || profile.username}`,
        });
      } else {
        await followUser(profile.id);
        toast({
          title: "Following",
          description: `You are now following ${profile.display_name || profile.username}`,
        });
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!profile) return;
    
    // Check if this is voice input (transcript contains base64 audio)
    const isVoiceMessage = transcript && transcript.length > 100 && !chatMessage.trim();
    
    let messageContent = '';
    let audioData = '';
    
    if (isVoiceMessage) {
      // Voice input - process with backend
      audioData = transcript;
      console.log('🎙️ Processing voice message...');
      
      setIsTyping(true);
      
      try {
        const result = await processVoiceChat(audioData, {
          profileId: profile.id,
          userId: currentUser?.id,
          conversationHistory: chatMessages
        });
        
        if (!result) {
          throw new Error('Failed to process voice message');
        }
        
        messageContent = result.transcription;
        
        // Add user message with transcription
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: messageContent,
          timestamp: new Date().toISOString(),
          sender: 'user',
          senderName: currentUser?.email?.split('@')[0] || 'Guest',
          senderAvatar: currentUser?.user_metadata?.avatar_url,
          isVoiceMessage: true,
          voiceTranscript: messageContent
        };
        
        setChatMessages(prev => [...prev, userMessage]);
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: result.textResponse,
          timestamp: new Date().toISOString(),
          sender: 'avatar',
          senderName: profile.display_name || profile.username || 'AI',
          senderAvatar: profile.avatar_url || profile.profile_pic_url,
          isVoiceMessage: false
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Play audio response
        if (result.audioResponse) {
          await playAudioResponse(result.audioResponse);
        }
        
        resetTranscript();
        setIsTyping(false);
        return;
        
      } catch (error) {
        console.error('Voice processing error:', error);
        toast({
          title: "Voice Error",
          description: "Failed to process voice message. Please try again.",
          variant: "destructive",
        });
        setIsTyping(false);
        resetTranscript();
        return;
      }
    }
    
    // Text input
    messageContent = chatMessage.trim();
    
    if (!messageContent) return;
    
    // Check if unregistered user has exceeded free chat limit (1 message)
    if (!currentUser) {
      const storageKey = `unregistered_chat_count_${profile.id}`;
      const chatCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
      
      if (chatCount >= 1) {
        // Trigger voice notification
        try {
          const speechSynthesis = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance("Please sign in or create an account to continue chatting. You've used your free message.");
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Speech synthesis error:', e);
        }
        
        toast({
          title: "Sign In Required",
          description: "Please sign in or create an account to continue chatting. You've used your free message.",
          variant: "destructive",
        });
        
        // Show auth modal
        setIsMainAuthOpen(true);
        setChatMessage('');
        return;
      }
      
      // Increment chat count for unregistered users
      localStorage.setItem(storageKey, (chatCount + 1).toString());
    }
    
    // Block AI origin related questions
    const aiOriginKeywords = [
      'qwen', 'faster whisper', 'chattts', 'which model', 'what model',
      'based on my training', 'ai training', 'training data',
      'machine learning', 'neural network', 'algorithm',
      'artificial intelligence', 'ai model', 'language model',
      'llm', 'chatgpt', 'gpt', 'openai', 'anthropic', 'claude'
    ];
    
    const containsAIOrigin = aiOriginKeywords.some(keyword => 
      messageContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (containsAIOrigin) {
      toast({
        title: "Topic Not Available",
        description: "I prefer to focus on more personal conversations and helpful topics.",
        variant: "destructive",
      });
      setChatMessage('');
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      timestamp: new Date().toISOString(),
      sender: 'user',
      senderName: getVisitorName(),
      senderAvatar: currentUser?.user_metadata?.avatar_url,
      isVoiceMessage: false
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsTyping(true);
    
    // Save user message to database (if authenticated)
    if (currentUser) {
      await saveChatMessage(messageContent, 'user');
    }
    
    try {
      // Generate personalized AI response
      const response = await supabase.functions.invoke('personalized-ai-response', {
        body: {
          userMessage: messageContent,
          profileId: profile.id,
          userId: currentUser?.id || null,
          visitorName: getVisitorName()
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { response: aiResponse, richData } = response.data;

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        timestamp: new Date().toISOString(),
        sender: 'avatar',
        senderName: profile.display_name || profile.username || 'AI',
        senderAvatar: profile.avatar_url || profile.profile_pic_url,
        isVoiceMessage: false,
        richData: richData || undefined
      };

      setChatMessages(prev => [...prev, aiMessage]);
      
      // Save AI response to database
      await saveChatMessage(aiResponse, 'avatar', richData);
      
      // Increment engagement count for real-time update
      incrementConversation();
      
      // Play voice response using Web Speech API (voice + text simultaneously)
      if (aiResponse) {
        try {
          setIsTalking(true);
          await synthesizeSpeech(aiResponse, {
            voice: 'neural',
            speed: 1.0,
            language: 'en-US'
          });
        } catch (voiceError) {
          console.error('Voice synthesis error:', voiceError);
        } finally {
          setIsTalking(false);
        }
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Add fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        sender: 'avatar',
        senderName: profile.display_name || profile.username || 'AI',
        senderAvatar: profile.avatar_url || profile.profile_pic_url,
        isVoiceMessage: false
      };

      setChatMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: "Response Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const shareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Profile link copied to clipboard",
    });
  };

  // Voice input effects - update chat message with transcript (only for text)
  useEffect(() => {
    // Only update chat message if transcript is text (not base64 audio)
    if (transcript && transcript.trim() && transcript.length < 100) {
      setChatMessage(transcript);
    }
  }, [transcript]);

  const handleVoiceToggle = async () => {
    if (isListening) {
      // Stop recording and submit
      try {
        await stopListening();
        
        // Wait a bit for processing
        setTimeout(() => {
          if (transcript) {
            handleChatSubmit();
          }
        }, 500);
        
        toast({
          title: "Voice Recording Stopped",
          description: "Processing your message...",
        });
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast({
          title: "Recording Error",
          description: "Failed to stop voice recording",
          variant: "destructive",
        });
      }
    } else {
      // Start recording
      setChatMessage('');
      resetTranscript();
      
      try {
        await startListening({ 
          language: 'en-US',
          continuous: false
        });
        
        toast({
          title: "Voice Recording Started",
          description: "Speak your message clearly...",
        });
      } catch (error) {
        console.error('Voice input error:', error);
        toast({
          title: "Voice Input Error",
          description: "Failed to start voice recording",
          variant: "destructive",
        });
      }
    }
  };

  const handleVoiceOutput = async () => {
    if (isPlaying) {
      stopSpeech();
      toast({
        title: "Voice Output Stopped",
        description: "Audio playback stopped",
      });
    } else {
      const lastAiMessage = chatMessages.filter(msg => msg.sender === 'avatar').pop();
      if (lastAiMessage) {
        try {
          await synthesizeSpeech(lastAiMessage.content, {
            voice: 'neural',
            speed: 1.0,
            language: 'en-US'
          });
          
          toast({
            title: "Playing Llama 3 AI Response",
            description: "Voice output with Avatartalk personalized tone",
          });
        } catch (error) {
          console.error('Voice output error:', error);
          toast({
            title: "Voice Output Error",
            description: "Failed to play audio",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "No Message",
          description: "No AI message to play",
          variant: "destructive",
        });
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setChatMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleSaveAsDefault = async () => {
    if (!profile || !avatarConfig || !currentUser) return;
    
    try {
      // Use the default avatar hook to save as default
      const success = await saveAsDefault(avatarConfig.id);
      if (success) {
        // Also link with profile for immediate display update
        await linkWithProfile(avatarConfig.id);
      }
    } catch (error) {
      console.error('Error setting default avatar:', error);
      toast({
        title: "Error",
        description: "Failed to set default avatar",
        variant: "destructive",
      });
    }
  };

  // Show loading text briefly
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <p className="text-white/80 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-slate-400">The requested profile could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bgClass = isDarkTheme 
    ? "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" 
    : "bg-gradient-to-br from-white via-blue-50 to-purple-50";
  
  const cardClass = isDarkTheme
    ? "bg-slate-900/95 border-slate-700/30"
    : "bg-white/95 border-gray-200";
  
  const textPrimaryClass = isDarkTheme ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDarkTheme ? "text-slate-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-2`}>
      <motion.div
        className="w-full max-w-lg mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={`${cardClass} backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/50 min-h-[90vh] flex flex-col`}>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Profile Header - Top Left Corner with Visitor Profile and Theme Toggle on Right */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg">
                    <div className={`w-full h-full rounded-full ${isDarkTheme ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center overflow-hidden`}>
                       {profile?.profile_pic_url || profile?.avatar_url ? (
                         <img 
                           src={profile.profile_pic_url || profile.avatar_url} 
                           alt={profileData.displayName}
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <span className={`text-lg font-bold ${textPrimaryClass}`}>
                           {profileData.avatarInitial}
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-sm" />
                  {/* Subscriber Badge - shown when current user is subscribed to this profile */}
                  {isActiveSubscriber && (
                    <div className="absolute -top-1 -left-1">
                      <SubscriberBadge 
                        text={badgeConfig.text} 
                        color={badgeConfig.color}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-xl font-bold ${textPrimaryClass} leading-tight mb-0.5 truncate`}>
                    {profileData.displayName}
                  </h2>
                  <p className={`${textSecondaryClass} text-sm`}>@{profileData.username}</p>
                </div>
              </div>
              
              {/* Right Side: Theme Toggle and Visitor Profile */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  className={`${isDarkTheme ? 'text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-700/50' : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'} p-2 rounded-full transition-all duration-200`}
                >
                  {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                {/* Visitor/User Profile Button - Navigate to Dashboard */}
                {currentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/settings/dashboard', '_blank')}
                    className={`p-0 rounded-full ${isDarkTheme ? 'bg-slate-800/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200`}
                    title="Go to Dashboard"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                      <div className={`w-full h-full rounded-full ${isDarkTheme ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center overflow-hidden`}>
                        {currentUser?.user_metadata?.avatar_url ? (
                          <img 
                            src={currentUser.user_metadata.avatar_url} 
                            alt="Your Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            </div>

            <div className="px-6 pb-4">
              <p className={`${textSecondaryClass} text-sm leading-relaxed`}>
                {profileData.bio}
              </p>
            </div>

            {/* Changeable 3D Avatar Preview */}
            <div className="px-6 pb-6">
              <ChangeableAvatarPreview
                userId={profile?.id}
                isLarge={true}
                showControls={currentUser?.id === profile?.id}
                isInteractive={true}
                isTalking={isTalking}
                onAvatarClick={currentUser?.id === profile?.id ? () => window.location.href = '/avatar' : undefined}
                onTalkClick={handleTalkToMeClick}
                showGiftButton={currentUser?.id !== profile?.id}
                onGiftClick={() => {
                  if (!currentUser) {
                    setIsMainAuthOpen(true);
                    return;
                  }
                  setIsGiftModalOpen(true);
                }}
              />
            </div>

            {/* Action Buttons - Subscribe (left wider) and Follow (right) - Enhanced design */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-5 gap-2">
                {/* Left Side - Subscribe Button (wider - 3 columns) */}
                {profile?.id && profile?.id !== currentUser?.id && (
                  <div className="col-span-3" data-subscribe-button-wrapper>
                    <SubscribeButton
                      targetUserId={profile.id}
                      targetUsername={profile.username}
                      currentUserId={currentUser?.id}
                      className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    />
                  </div>
                )}
                
                {/* Right Side - Enhanced Follow Button (2 columns) */}
                {profile?.id && profile?.id !== currentUser?.id && (
                  <div className="col-span-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-full"
                    >
                      <FollowButton
                        targetUserId={profile.id}
                        targetUsername={profile.username}
                        currentUserId={currentUser?.id || null}
                        variant="compact"
                        className="w-full h-full py-3 text-sm font-semibold bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      />
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats - Three Column Layout with New User Badge */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-2">
                <div className={`text-center rounded-xl py-2 backdrop-blur-sm border relative ${isDarkTheme ? 'bg-slate-800/30 border-slate-700/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}`}>
                  <div className={`text-lg font-bold mb-0.5 ${textPrimaryClass}`}>
                    {engagement.totalConversations}
                  </div>
                  <div className={`text-xs font-medium ${textSecondaryClass}`}>Conversations</div>
                </div>
                <div className={`text-center rounded-xl py-2 backdrop-blur-sm border relative ${isDarkTheme ? 'bg-slate-800/30 border-slate-700/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}`}>
                  <div className={`text-lg font-bold mb-0.5 ${textPrimaryClass}`}>
                    {engagement.followersCount >= 1000 ? `${(engagement.followersCount/1000).toFixed(1)}K` : engagement.followersCount}
                  </div>
                  <div className={`text-xs font-medium ${textSecondaryClass}`}>Followers</div>
                  {engagement.isNewUser && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                      <BadgeCheck className="w-2.5 h-2.5" />
                      NEW
                    </div>
                  )}
                </div>
                <div className={`text-center rounded-xl py-2 backdrop-blur-sm border relative ${isDarkTheme ? 'bg-slate-800/30 border-slate-700/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}`}>
                  <div className="flex items-center justify-center">
                    <LoyaltyBadge score={engagement.loyaltyScore} size="md" showScore={true} showTierName={true} />
                  </div>
                  <div className={`text-xs font-medium mt-1 ${textSecondaryClass}`}>Loyalty</div>
                </div>
              </div>
            </div>

            {/* Content Tabs - Flexible to take remaining space */}
            <div className="px-6 pb-2 flex-1 flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <TabsList className={`grid w-full grid-cols-3 bg-transparent border-b rounded-none p-0 h-auto flex-shrink-0 ${isDarkTheme ? 'border-slate-700/30' : 'border-gray-300'}`}>
                  <TabsTrigger 
                    value="posts" 
                    className={`rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent py-3 font-medium text-base transition-all duration-200 ${isDarkTheme ? 'text-slate-400 data-[state=active]:text-white hover:text-slate-200' : 'text-gray-600 data-[state=active]:text-gray-900 hover:text-gray-800'}`}
                  >
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat"
                    className={`rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent py-3 font-medium text-base transition-all duration-200 ${isDarkTheme ? 'text-slate-400 data-[state=active]:text-white hover:text-slate-200' : 'text-gray-600 data-[state=active]:text-gray-900 hover:text-gray-800'}`}
                  >
                    Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="products"
                    className={`rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent py-3 font-medium text-base transition-all duration-200 ${isDarkTheme ? 'text-slate-400 data-[state=active]:text-white hover:text-slate-200' : 'text-gray-600 data-[state=active]:text-gray-900 hover:text-gray-800'}`}
                  >
                    Product
                  </TabsTrigger>
                </TabsList>

                {/* Posts Tab - Scrollable content */}
                <TabsContent value="posts" className="mt-6 flex-1 overflow-hidden flex flex-col">
                  <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent max-h-[400px]">
                    <AnimatePresence>
                    {userPosts.length > 0 ? (
                      userPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <EnhancedPostCardWithLocks
                            post={{
                              ...post,
                              profile: {
                                username: profile.username,
                                display_name: profile.display_name,
                                avatar_url: profile.avatar_url || profile.profile_pic_url
                              }
                            }}
                            currentUserId={currentUser?.id}
                            showComments={true}
                            isSubscriber={isActiveSubscriber}
                            showLinkClicks={isOwnProfile}
                            profileUsername={profile.username}
                            onSubscribeClick={() => {
                              // Trigger subscribe button click
                              const subscribeBtn = document.querySelector('[data-subscribe-button]') as HTMLButtonElement;
                              if (subscribeBtn) subscribeBtn.click();
                            }}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                          <CardContent className="p-8 text-center">
                            <Sparkles className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                            <p className="text-slate-400 text-sm">No posts yet. Check back soon for updates!</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat" className="mt-6 flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent max-h-[400px]">
                    <div className="space-y-4">
                     {chatMessages.map((message) => (
                       <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'avatar' ? 'flex-row-reverse' : ''}`}>
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                           <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                             {message.sender === 'avatar' ? (
                               message.senderAvatar ? (
                                 <img 
                                   src={message.senderAvatar} 
                                   alt={message.senderName}
                                   className="w-full h-full object-cover"
                                 />
                               ) : (
                                 <span className="text-xs font-bold text-white">
                                   {(message.senderName?.[0] || 'A').toUpperCase()}
                                 </span>
                               )
                             ) : (
                               currentUser?.user_metadata?.avatar_url ? (
                                 <img 
                                   src={currentUser.user_metadata.avatar_url} 
                                   alt={message.senderName}
                                   className="w-full h-full object-cover"
                                 />
                               ) : (
                                 <span className="text-xs font-bold text-white">
                                   {(message.senderName?.[0] || 'U').toUpperCase()}
                                 </span>
                               )
                             )}
                           </div>
                         </div>
                        <div className={`flex-1 ${message.sender === 'avatar' ? 'flex justify-end' : ''}`}>
                          <div className={message.sender === 'avatar' ? '' : 'max-w-xs'}>
                             <div className={`px-4 py-3 rounded-2xl ${
                              message.sender === 'avatar' 
                                ? 'bg-slate-700/50 border border-slate-600/30 rounded-tr-md max-w-xs' 
                                : 'bg-blue-600/20 border border-blue-500/30 rounded-tl-md'
                            }`}>
                              {message.isVoiceMessage && (
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-600/20">
                                  <Volume2 className="w-3 h-3 text-purple-400" />
                                  <span className="text-xs text-purple-400 font-medium">Voice Message</span>
                                </div>
                              )}
                             <p className={`text-sm ${
                                message.sender === 'avatar' ? 'text-slate-200' : 'text-blue-100'
                              }`}>
                                {message.content}
                              </p>
                              
                              {/* Rich Data: Buttons, Links, Documents */}
                              {message.sender === 'avatar' && message.richData && (
                                <div className="mt-3 space-y-2">
                                  {message.richData.buttons && message.richData.buttons.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {message.richData.buttons.map((button, idx) => (
                                        <Button
                                          key={idx}
                                          variant="outline"
                                          size="sm"
                                          className="gap-2"
                                          onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
                                        >
                                          {button.text}
                                          <ChevronRight className="h-3 w-3" />
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {message.richData.links && message.richData.links.length > 0 && (
                                    <div className="space-y-2">
                                      {message.richData.links.map((link, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors"
                                          onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                                        >
                                          <div className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0 text-blue-400" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate text-slate-200">{link.title}</p>
                                              {link.preview && (
                                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                                  {link.preview}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {message.richData.documents && message.richData.documents.length > 0 && (
                                    <div className="space-y-2">
                                      {message.richData.documents.map((doc, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                                          <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-green-400" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate text-slate-200">{doc.filename}</p>
                                              <p className="text-xs text-slate-400 uppercase">{doc.type}</p>
                                              {doc.preview && (
                                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                                  {doc.preview}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className={`text-xs text-slate-500 mt-1 ${
                              message.sender === 'avatar' ? 'text-right' : ''
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(isTalking || isTyping) && (
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                          <div className="w-full h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                             {profile?.profile_pic_url || profile?.avatar_url ? (
                               <img 
                                 src={profile.profile_pic_url || profile.avatar_url} 
                                 alt={profileData.displayName}
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <span className="text-xs font-bold text-white">
                                 {profileData.avatarInitial}
                               </span>
                             )}
                          </div>
                        </div>
                        <div className="flex-1 flex justify-end">
                          <div>
                            <div className="bg-slate-700/50 border border-slate-600/30 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                                 <span className="text-xs text-slate-400">
                                   {isTyping ? "AI is generating response..." : "AI is thinking..."}
                                 </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </TabsContent>

                {/* Products & Events Tab */}
                <TabsContent value="products" className="mt-6 flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent max-h-[400px]">
                    <div className="space-y-4">
                      <AnimatePresence>
                    {(products.length > 0 || events.length > 0) ? (
                      <div className="space-y-4">
                        {/* Products Section */}
                        {products.length > 0 && (
                          <div className="space-y-4">
                            <h3 className={`font-semibold text-lg mb-3 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Products</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {products.map((product, index) => (
                                <motion.div
                                  key={product.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <CompactProductCard
                                    product={product as any}
                                    sellerName={profile?.display_name}
                                    showBuyButton={true}
                                    currency="INR"
                                    exchangeRate={1}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Virtual Collaboration Section */}
                        {events.length > 0 && (
                          <div className="space-y-4 mt-6">
                            <h3 className={`font-semibold text-lg mb-3 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                              Virtual Collaboration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {events.map((event, index) => (
                                <motion.div
                                  key={event.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: (products.length + index) * 0.1 }}
                                >
                                  <VirtualCollaborationCard
                                    product={{
                                      id: event.id,
                                      user_id: event.user_id,
                                      title: event.title,
                                      description: event.description || '',
                                      product_type: event.event_type || 'webinar',
                                      price: 0,
                                      currency: 'INR',
                                      duration_mins: Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000),
                                      capacity: 100,
                                      provider: event.location?.includes('Zoom') ? 'zoom' : event.location?.includes('Manual') ? 'manual' : 'google_meet',
                                      status: 'published',
                                      event_date: event.start_time,
                                      thumbnail_url: event.thumbnail_url,
                                      join_url: event.location?.startsWith('http') ? event.location : undefined,
                                      created_at: event.created_at
                                    }}
                                    sellerName={profile?.display_name || profile?.username}
                                    sellerAvatar={profile?.profile_pic_url || profile?.avatar_url}
                                    currentUserId={currentUser?.id}
                                    isDarkTheme={isDarkTheme}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                          <CardContent className="p-8 text-center">
                            <Globe className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                            <p className="text-slate-400 text-sm">No products or virtual collaborations available yet.</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                      </AnimatePresence>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Message Input Section - Sticky to bottom */}
            <div className="px-6 pt-2 pb-1 border-t border-slate-700/30 flex-shrink-0">
              <MessageInput
                message={
                  // Determine which message to show based on active tab - we'll need to track this
                  chatMessage
                }
                setMessage={setChatMessage}
                onSend={handleChatSubmit}
                placeholder="Type your message..."
                disabled={isLoading || !currentUser}
                lastAIMessage={chatMessages.filter(msg => msg.sender === 'avatar').pop()?.content}
              />
            </div>


            {/* Social Links Section - Sticky to bottom with minimal spacing */}
            <div className="px-6 py-1 border-t border-slate-700/30 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                
                {/* Left Side - All available social links inline */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                  {socialLinks?.twitter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://twitter.com/${socialLinks.twitter}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-sky-400/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {socialLinks?.linkedin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://linkedin.com/in/${socialLinks.linkedin}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-blue-600/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {socialLinks?.youtube && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://youtube.com/@${socialLinks.youtube}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-red-500/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Youtube className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {socialLinks?.instagram && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://instagram.com/${socialLinks.instagram}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-pink-500/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Instagram className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {socialLinks?.facebook && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://facebook.com/${socialLinks.facebook}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-blue-500/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {socialLinks?.github && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://github.com/${socialLinks.github}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-gray-500/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Github className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {socialLinks?.twitch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://twitch.tv/${socialLinks.twitch}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-purple-500/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Twitch className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {socialLinks?.tiktok && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://tiktok.com/@${socialLinks.tiktok}`, '_blank')}
                      className="p-2 bg-gradient-to-br from-gray-900 via-black to-black hover:from-gray-800 hover:via-gray-900 hover:to-black text-white rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] shadow-lg hover:shadow-gray-900/30 flex-shrink-0 border-0 hover:scale-110"
                    >
                      <Music className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Right Side - Three Dots Popup and Share Button - Fixed */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <SocialLinksPopup
                    socialLinks={socialLinks}
                    onShare={() => setIsShareModalOpen(true)}
                  />
                  
                  {/* Enhanced Share Button with Zoom Animation */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 flex items-center gap-1.5 font-medium border-0 text-sm animate-pulse-zoom"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* AvatarTalk.Co Branding - Sticky to bottom */}
            <div className="px-6 py-1 border-t border-slate-700/30 flex-shrink-0 bg-slate-900/50">
              <div className="text-center">
                <a 
                  href="https://avatartalk.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-400 transition-colors duration-200 font-medium inline-block"
                >
                  Powered by <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-bold">AvatarTalk.Co</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Enhanced Share Modal */}
      <EnhancedShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={window.location.href}
        title={`Check out ${profileData.displayName}'s profile`}
        description={profileData.bio}
        type="profile"
      />
      
      {/* Visitor Authentication Modal */}
      <VisitorAuth
        isOpen={isVisitorAuthOpen}
        onClose={() => setIsVisitorAuthOpen(false)}
      />
      
      {/* Main Authentication Modal */}
      <MainAuth
        isOpen={isMainAuthOpen}
        onClose={() => setIsMainAuthOpen(false)}
      />
      
      {/* Token Gift Modal */}
      {profile && (
        <TokenGiftModal
          open={isGiftModalOpen}
          onOpenChange={setIsGiftModalOpen}
          receiverId={profile.id}
          receiverName={profile.display_name || profile.username}
          senderId={currentUser?.id}
        />
      )}
    </div>
  );
};

export default ProfilePage;
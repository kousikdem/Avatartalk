import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, Bot } from 'lucide-react';
import { useChatConversations, useChatMessages } from '@/hooks/useChatConversations';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  otherUserId?: string;
  onBack?: () => void;
  isVisitorChat?: boolean;
  profileOwnerId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ otherUserId, onBack, isVisitorChat, profileOwnerId }) => {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, loading: conversationsLoading, getOrCreateConversation } = useChatConversations();
  const { messages, loading: messagesLoading, sendMessage } = useChatMessages(selectedConversationId);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (otherUserId && currentUserId) {
      handleSelectUser(otherUserId);
    }
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setSelectedUser(profile);
    const convId = await getOrCreateConversation(userId);
    setSelectedConversationId(convId);
  };

  const handleSelectConversation = async (conv: any) => {
    const otherUserId = conv.user_id === currentUserId ? conv.other_user_id : conv.user_id;
    setSelectedUser(conv.other_user);
    setSelectedConversationId(conv.id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !selectedUser) return;

    try {
      await sendMessage(selectedUser.id, messageInput);
      setMessageInput('');

      // If this is a visitor chat, trigger AI response
      if (isVisitorChat && profileOwnerId) {
        try {
          const { data: aiResponse } = await supabase.functions.invoke('personalized-ai-response', {
            body: {
              userMessage: messageInput,
              profileId: profileOwnerId,
              userId: currentUserId
            }
          });
          
          if (aiResponse?.response) {
            // Wait a moment then send AI response
            setTimeout(async () => {
              await sendMessage(selectedUser.id, aiResponse.response);
            }, 1000);
          }
        } catch (aiError) {
          console.error('Error getting AI response:', aiError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            Conversations
            {isVisitorChat && (
              <Badge variant="secondary" className="text-xs ml-auto">
                <Bot className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => {
                const otherUser = conv.other_user;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 border-b hover:bg-accent cursor-pointer transition-colors ${
                      selectedConversationId === conv.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={otherUser?.profile_pic_url} />
                        <AvatarFallback>
                          {otherUser?.display_name?.[0] || otherUser?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {otherUser?.display_name || otherUser?.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="md:col-span-2">
        <CardHeader>
          {selectedUser ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedUser.profile_pic_url} />
                <AvatarFallback>
                  {selectedUser.display_name?.[0] || selectedUser.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <CardTitle>
                {selectedUser.display_name || selectedUser.username || 'Unknown User'}
              </CardTitle>
            </div>
          ) : (
            <CardTitle>Select a conversation</CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          {!selectedConversationId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 pr-4 mb-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-accent text-accent-foreground'
                            }`}
                          >
                            <p className="break-words">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={!selectedConversationId}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !selectedConversationId}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;

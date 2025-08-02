
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Mic, Send, Play, Pause } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  type: 'text' | 'voice';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  sender: 'user' | 'ai';
  isPlaying?: boolean;
}

const ChatTab = () => {
  const { profileData } = useUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Mock initial messages to show functionality
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        type: 'text',
        content: 'Hello! I\'m your AI companion. How can I help you today?',
        timestamp: new Date(Date.now() - 300000),
        sender: 'ai'
      },
      {
        id: '2',
        type: 'voice',
        content: 'Voice message from AI',
        audioUrl: '#',
        timestamp: new Date(Date.now() - 180000),
        sender: 'ai'
      }
    ];
    setMessages(initialMessages);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'text',
      content: newMessage,
      timestamp: new Date(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: `I understand you said: "${newMessage}". How can I help you further?`,
        timestamp: new Date(),
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleTalkToMe = () => {
    if (!isConnected) {
      setIsConnected(true);
      setIsRecording(true);
      
      // Simulate voice connection
      setTimeout(() => {
        setIsRecording(false);
        const voiceMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'voice',
          content: 'Voice conversation started',
          audioUrl: '#',
          timestamp: new Date(),
          sender: 'user'
        };
        setMessages(prev => [...prev, voiceMessage]);

        // AI voice response
        setTimeout(() => {
          const aiVoiceResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'voice',
            content: 'AI voice response',
            audioUrl: '#',
            timestamp: new Date(),
            sender: 'ai'
          };
          setMessages(prev => [...prev, aiVoiceResponse]);
        }, 1500);
      }, 3000);
    } else {
      setIsConnected(false);
      setIsRecording(false);
    }
  };

  const playVoiceMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isPlaying: !msg.isPlaying }
          : { ...msg, isPlaying: false }
      )
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profileData?.profile_pic_url} />
              <AvatarFallback>
                {profileData?.display_name?.substring(0, 2) || 'AI'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                Chat with {profileData?.display_name || 'AI Assistant'}
              </h2>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Offline'}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleTalkToMe}
            variant={isConnected ? "destructive" : "default"}
            className="flex items-center space-x-2"
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            <span>{isConnected ? 'Disconnect' : 'Talk to me'}</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border'
              }`}
            >
              {message.type === 'text' ? (
                <p className="text-sm">{message.content}</p>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => playVoiceMessage(message.id)}
                    className={`p-1 ${
                      message.sender === 'user' ? 'text-white hover:bg-blue-700' : ''
                    }`}
                  >
                    {message.isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <span className="text-sm">Voice message</span>
                </div>
              )}
              
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;

import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

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
    buttons?: Array<{ text: string; url: string }>;
    links?: Array<{ url: string; title: string; preview: string }>;
    documents?: Array<{ filename: string; type: string; preview: string }>;
  };
}

interface TwoSideChatMessageProps {
  message: ChatMessage;
  isDarkTheme?: boolean;
  currentUserAvatar?: string;
}

export const TwoSideChatMessage = ({ 
  message, 
  isDarkTheme = true,
  currentUserAvatar
}: TwoSideChatMessageProps) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
        <div className={`w-full h-full rounded-full ${isDarkTheme ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center overflow-hidden`}>
          {message.senderAvatar ? (
            <img 
              src={message.senderAvatar} 
              alt={message.senderName || 'User'}
              className="w-full h-full object-cover"
            />
          ) : isUser && currentUserAvatar ? (
            <img 
              src={currentUserAvatar} 
              alt="You"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-xs font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              {(message.senderName?.[0] || (isUser ? 'U' : 'A')).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender Name */}
        <p className={`text-xs mb-1 ${isUser ? 'text-right' : 'text-left'} ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
          {message.senderName || (isUser ? 'You' : 'AI')}
        </p>
        
        {/* Message Bubble */}
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md' 
            : isDarkTheme 
              ? 'bg-slate-700/70 border border-slate-600/30 text-slate-200 rounded-bl-md'
              : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-md'
        }`}>
          {/* Voice Message Indicator */}
          {message.isVoiceMessage && (
            <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
              isUser ? 'border-blue-500/30' : isDarkTheme ? 'border-slate-600/30' : 'border-gray-300'
            }`}>
              <Volume2 className={`w-3 h-3 ${isUser ? 'text-blue-200' : 'text-purple-400'}`} />
              <span className={`text-xs font-medium ${isUser ? 'text-blue-200' : 'text-purple-400'}`}>
                Voice Message
              </span>
            </div>
          )}
          
          {/* Message Text */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          
          {/* Rich Data */}
          {!isUser && message.richData && (
            <div className="mt-3 space-y-2">
              {/* Buttons */}
              {message.richData.buttons && message.richData.buttons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.richData.buttons.map((button, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs bg-slate-800/50 border-slate-600 hover:bg-slate-700"
                      onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
                    >
                      {button.text}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Links */}
              {message.richData.links && message.richData.links.length > 0 && (
                <div className="space-y-2">
                  {message.richData.links.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-colors"
                      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                    >
                      <p className="text-xs font-medium text-slate-200 truncate">{link.title}</p>
                      {link.preview && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{link.preview}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Documents */}
              {message.richData.documents && message.richData.documents.length > 0 && (
                <div className="space-y-2">
                  {message.richData.documents.map((doc, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-200 truncate">{doc.filename}</p>
                        <p className="text-xs text-slate-500 uppercase">{doc.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'} ${isDarkTheme ? 'text-slate-500' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  );
};

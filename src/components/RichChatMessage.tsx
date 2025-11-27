import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RichChatMessageProps {
  message: string;
  timestamp: Date;
  type: 'user' | 'avatar';
  profilePicUrl?: string;
  displayName?: string;
  richData?: {
    button?: {
      text: string;
      url: string;
    };
  };
}

export const RichChatMessage: React.FC<RichChatMessageProps> = ({
  message,
  timestamp,
  type,
  profilePicUrl,
  displayName,
  richData
}) => {
  const isUser = type === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={profilePicUrl} />
        <AvatarFallback>
          {displayName?.[0] || (isUser ? 'U' : 'AI')}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        </div>
        
        {richData?.button && !isUser && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gap-2"
            onClick={() => window.open(richData.button!.url, '_blank', 'noopener,noreferrer')}
          >
            {richData.button.text}
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
        
        <span className="text-xs text-muted-foreground mt-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

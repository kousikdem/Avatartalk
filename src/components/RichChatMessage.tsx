import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, FileText, Link2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RichChatMessageProps {
  message: string;
  timestamp: Date;
  type: 'user' | 'avatar';
  profilePicUrl?: string;
  displayName?: string;
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
        
        {!isUser && richData && (
          <div className="mt-2 space-y-2 max-w-full">
            {richData.buttons && richData.buttons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {richData.buttons.map((button, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
                  >
                    {button.text}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            )}
            
            {richData.links && richData.links.length > 0 && (
              <div className="space-y-2">
                {richData.links.map((link, idx) => (
                  <Card 
                    key={idx}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  >
                    <div className="flex items-start gap-2">
                      <Link2 className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{link.title}</p>
                        {link.preview && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {link.preview}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {richData.documents && richData.documents.length > 0 && (
              <div className="space-y-2">
                {richData.documents.map((doc, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground uppercase">{doc.type}</p>
                        {doc.preview && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {doc.preview}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        <span className="text-xs text-muted-foreground mt-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

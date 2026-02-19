import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, FileText, Link2, List, Grid3X3, MessageSquare, HelpCircle, ArrowRight, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LinkPreviewModal } from './LinkPreviewModal';

interface RichChatMessageProps {
  message: string;
  timestamp: Date;
  type: 'user' | 'avatar';
  profilePicUrl?: string;
  displayName?: string;
  profileUsername?: string;
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
    followUp?: {
      id: string;
      question: string;
      choices: string[];
    };
    relatedQuestions?: Array<{
      question: string;
      answer?: string;
    }>;
    lists?: Array<{
      title: string;
      items: string[];
    }>;
    cards?: Array<{
      title: string;
      description: string;
      icon?: string;
      action?: { text: string; url: string };
    }>;
  };
  onQuestionClick?: (question: string) => void;
}

export const RichChatMessage: React.FC<RichChatMessageProps> = ({
  message,
  timestamp,
  type,
  profilePicUrl,
  displayName,
  profileUsername,
  richData,
  onQuestionClick
}) => {
  const isUser = type === 'user';
  const [previewUrl, setPreviewUrl] = useState<{ url: string; title: string } | null>(null);
  const navigate = useNavigate();

  const handleLinkClick = (url: string, title?: string) => {
    // Always open external links in new tab for security
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatMessage = (text: string) => {
    // Convert markdown-like formatting to HTML-friendly structure
    const lines = text.split('\n');
    const formatted: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;

    lines.forEach((line, idx) => {
      // Check for list items (- or * or numbered)
      const listMatch = line.match(/^[\s]*[-*•]\s+(.+)$/);
      const numberedMatch = line.match(/^[\s]*(\d+)[.)]\s+(.+)$/);

      if (listMatch || numberedMatch) {
        if (!inList) inList = true;
        listItems.push(listMatch ? listMatch[1] : numberedMatch![2]);
      } else {
        // Flush list if we were in one
        if (inList && listItems.length > 0) {
          formatted.push(
            <ul key={`list-${idx}`} className="list-disc list-inside my-2 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-sm">{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }

        // Check for headers
        const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          const className = level === 1 ? 'text-base font-bold mt-3 mb-1' : 
                           level === 2 ? 'text-sm font-semibold mt-2 mb-1' : 
                           'text-sm font-medium mt-2 mb-1';
          formatted.push(<p key={idx} className={className}>{text}</p>);
        } else if (line.trim()) {
          formatted.push(<p key={idx} className="text-sm">{line}</p>);
        } else if (idx < lines.length - 1) {
          formatted.push(<br key={idx} />);
        }
      }
    });

    // Flush remaining list
    if (listItems.length > 0) {
      formatted.push(
        <ul key="list-final" className="list-disc list-inside my-2 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm">{item}</li>
          ))}
        </ul>
      );
    }

    return formatted;
  };

  return (
    <>
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={profilePicUrl} />
          <AvatarFallback>
            {displayName?.[0] || (isUser ? 'U' : 'AI')}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground border'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {formatMessage(message)}
            </div>
          </div>
          
          {!isUser && richData && (
            <div className="mt-3 space-y-3 w-full">
              {/* Action Buttons - Q&A Links */}
              {richData.buttons && richData.buttons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {richData.buttons.map((button, idx) => (
                    <Button
                      key={idx}
                      variant="default"
                      size="sm"
                      className="gap-2 shadow-sm hover:shadow-md transition-all"
                      onClick={() => handleLinkClick(button.url, button.text)}
                    >
                      {button.text}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              )}

              {/* Related Questions as Clickable Buttons */}
              {richData.relatedQuestions && richData.relatedQuestions.length > 0 && (
                <Card className="border-dashed">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                      <HelpCircle className="h-3 w-3" />
                      Related Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <div className="flex flex-wrap gap-2">
                      {richData.relatedQuestions.map((rq, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1 h-auto py-1.5"
                          onClick={() => onQuestionClick?.(rq.question)}
                        >
                          <MessageSquare className="h-3 w-3" />
                          {rq.question}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lists */}
              {richData.lists && richData.lists.length > 0 && (
                <div className="space-y-2">
                  {richData.lists.map((list, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <CardHeader className="py-2 px-3 bg-muted/50">
                        <CardTitle className="text-xs font-medium flex items-center gap-2">
                          <List className="h-3 w-3 text-primary" />
                          {list.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <ul className="space-y-1">
                          {list.items.map((item, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Info Cards */}
              {richData.cards && richData.cards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {richData.cards.map((card, idx) => (
                    <Card 
                      key={idx} 
                      className={`overflow-hidden ${card.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                      onClick={() => card.action && handleLinkClick(card.action.url, card.action.text)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Grid3X3 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{card.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {card.description}
                            </p>
                            {card.action && (
                              <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1 gap-1">
                                {card.action.text}
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Link Previews */}
              {richData.links && richData.links.length > 0 && (
                <div className="space-y-2">
                  {richData.links.map((link, idx) => (
                    <Card 
                      key={idx}
                      className="p-3 cursor-pointer hover:bg-accent hover:shadow-sm transition-all"
                      onClick={() => handleLinkClick(link.url, link.title)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Link2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{link.title}</p>
                          {link.preview && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {link.preview}
                            </p>
                          )}
                          <Badge variant="secondary" className="text-[10px] mt-1.5 gap-1">
                            <ExternalLink className="h-2.5 w-2.5" />
                            Open Link
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Document References */}
              {richData.documents && richData.documents.length > 0 && (
                <div className="space-y-2">
                  {richData.documents.map((doc, idx) => (
                    <Card key={idx} className="p-3 border-dashed">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.filename}</p>
                          <Badge variant="outline" className="text-[10px] uppercase mt-1">{doc.type}</Badge>
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

              {/* Follow-up Question */}
              {richData.followUp && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-primary mb-2 flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      Follow-up Question
                    </p>
                    <p className="text-sm font-medium mb-2">{richData.followUp.question}</p>
                    {richData.followUp.choices && richData.followUp.choices.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {richData.followUp.choices.map((choice, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onQuestionClick?.(choice)}
                          >
                            {choice}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Back to Profile Button for External Links */}
              {profileUsername && (richData.buttons?.length || richData.links?.length) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground gap-1"
                  onClick={() => navigate(`/${profileUsername}`)}
                >
                  <User className="h-3 w-3" />
                  Back to {displayName || profileUsername}'s Profile
                </Button>
              )}
            </div>
          )}
          
          <span className="text-xs text-muted-foreground mt-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Link Preview Modal */}
      {previewUrl && (
        <LinkPreviewModal
          isOpen={!!previewUrl}
          onClose={() => setPreviewUrl(null)}
          url={previewUrl.url}
          title={previewUrl.title}
          profileUsername={profileUsername}
        />
      )}
    </>
  );
};

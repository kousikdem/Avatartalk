import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface LinkPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  profileUsername?: string;
}

export const LinkPreviewModal: React.FC<LinkPreviewModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  profileUsername
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBackToProfile = () => {
    if (profileUsername) {
      navigate(`/${profileUsername}`);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBackToProfile} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
            <DialogTitle className="text-sm font-medium truncate max-w-md">
              {title || url}
            </DialogTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleOpenExternal} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
        </DialogHeader>
        
        <div className="flex-1 relative bg-muted/20">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {hasError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                This link cannot be previewed here for security reasons.
              </p>
              <Button onClick={handleOpenExternal} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          ) : (
            <iframe
              src={url}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title={title || 'Link Preview'}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

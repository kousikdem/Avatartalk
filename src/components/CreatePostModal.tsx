
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Image, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Zap,
  Paperclip,
  Smile,
  Hash,
  Globe,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [integrationApp, setIntegrationApp] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showPricingOptions, setShowPricingOptions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const { createPost, uploadFile } = usePosts();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setPostType(type === 'image' ? 'image' : type === 'video' ? 'video' : 'document');
      toast({
        title: "Files Selected",
        description: `${files.length} file(s) selected for upload`,
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setPostType('text');
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim() && selectedFiles.length === 0 && !linkUrl.trim()) {
      toast({
        title: "Error",
        description: "Please add content, upload a file, or add a link",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      let mediaUrl = '';
      let mediaType = '';
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0]; // For now, handle one file
        mediaUrl = await uploadFile(file);
        mediaType = file.type;
      }

      // Prepare post data
      const postData = {
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        post_type: postType,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
        link_url: linkUrl.trim() || undefined,
        integration_data: integrationApp ? { app: integrationApp } : undefined,
        is_paid: isPaid,
        price: isPaid && price ? parseFloat(price) : undefined,
        metadata: {},
      };

      await createPost(postData);

      // Reset form
      setTitle('');
      setContent('');
      setPostType('text');
      setSelectedFiles([]);
      setLinkUrl('');
      setIntegrationApp('');
      setIsPaid(false);
      setPrice('');
      setShowLinkInput(false);
      setShowPricingOptions(false);
      
      onClose();
    } catch (error) {
      // Error already handled in usePosts hook
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card max-h-[90vh] overflow-hidden flex flex-col border shadow-2xl">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Create Post
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>Public</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isCreating}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-6 space-y-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Input
                placeholder="Add a compelling title... (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold border-none shadow-none p-0 placeholder:text-muted-foreground focus-visible:ring-0 bg-transparent"
              />
              <Separator className="opacity-30" />
            </div>

            {/* Content Editor */}
            <Textarea
              placeholder="What's on your mind? Share your thoughts, experiences, or ask questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] border-none shadow-none p-0 resize-none text-base placeholder:text-muted-foreground focus-visible:ring-0 bg-transparent"
            />

            {/* Link Input */}
            {showLinkInput && (
              <div className="bg-muted/30 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Add Link</span>
                </div>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mb-2"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }}
                  className="text-xs"
                >
                  Remove Link
                </Button>
              </div>
            )}

            {/* File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Attached Files</div>
                <div className="grid grid-cols-1 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 flex items-center gap-2 border border-primary/20">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4 text-primary" />
                      ) : file.type.startsWith('video/') ? (
                        <Video className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integration Selection */}
            {integrationApp && (
              <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-4 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Integration: {integrationApp}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIntegrationApp('')}
                  className="text-xs"
                >
                  Remove Integration
                </Button>
              </div>
            )}

            {/* Pricing Options */}
            {showPricingOptions && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">💰 Monetization</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowPricingOptions(false);
                      setIsPaid(false);
                      setPrice('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="paid-post"
                      checked={isPaid}
                      onCheckedChange={setIsPaid}
                    />
                    <Label htmlFor="paid-post">Paid Content</Label>
                  </div>
                  {isPaid && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="price" className="text-sm">$</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="9.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-20 h-8"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <Separator />

        {/* Bottom Action Bar */}
        <div className="p-4 bg-gradient-to-r from-muted/50 to-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Media Upload Buttons */}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="h-9 w-9 p-0 hover:bg-primary/10 group"
                disabled={isCreating}
              >
                <Image className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors" />
              </Button>

              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('video-upload')?.click()}
                className="h-9 w-9 p-0 hover:bg-primary/10 group"
                disabled={isCreating}
              >
                <Video className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </Button>

              <input
                id="document-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => handleFileUpload(e, 'document')}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('document-upload')?.click()}
                className="h-9 w-9 p-0 hover:bg-primary/10 group"
                disabled={isCreating}
              >
                <Paperclip className="h-4 w-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="h-9 w-9 p-0 hover:bg-primary/10 group"
                disabled={isCreating}
              >
                <LinkIcon className="h-4 w-4 text-orange-600 group-hover:text-orange-700 transition-colors" />
              </Button>

              {/* Integration Select */}
              <Select value={integrationApp} onValueChange={setIntegrationApp} disabled={isCreating}>
                <SelectTrigger className="h-9 w-9 p-0 border-none shadow-none hover:bg-primary/10 group">
                  <Zap className="h-4 w-4 text-yellow-600 group-hover:text-yellow-700 transition-colors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6 mx-2" />

              {/* Additional Options */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPricingOptions(!showPricingOptions)}
                className="h-9 px-3 text-sm hover:bg-primary/10"
                disabled={isCreating}
              >
                💰
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm hover:bg-primary/10"
                disabled={isCreating}
              >
                <Smile className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm hover:bg-primary/10"
                disabled={isCreating}
              >
                <Hash className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} size="sm" disabled={isCreating}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                size="sm"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreatePostModal;

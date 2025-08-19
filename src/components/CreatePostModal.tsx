
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
  Upload,
  Paperclip,
  MapPin,
  Smile,
  Hash,
  Calendar,
  Globe,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [integrationApp, setIntegrationApp] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showPricingOptions, setShowPricingOptions] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      toast({
        title: "Files Selected",
        description: `${files.length} file(s) selected for upload`,
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
    if (!content.trim() && selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please add content or upload a file",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the post data to your backend
    toast({
      title: "Post Created!",
      description: "Your post has been published successfully",
    });

    // Reset form
    setContent('');
    setTitle('');
    setSelectedFiles([]);
    setLinkUrl('');
    setIntegrationApp('');
    setIsPaid(false);
    setPrice('');
    setShowLinkInput(false);
    setShowPricingOptions(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-card max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Create Post</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>Public</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-6 space-y-4">
            {/* Title Input */}
            <Input
              placeholder="Add a compelling title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-none shadow-none p-0 placeholder:text-muted-foreground focus-visible:ring-0"
            />

            {/* Content Editor */}
            <Textarea
              placeholder="What's on your mind? Share your thoughts, experiences, or anything interesting..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] border-none shadow-none p-0 resize-none text-base placeholder:text-muted-foreground focus-visible:ring-0"
            />

            {/* Link Input (conditionally shown) */}
            {showLinkInput && (
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Add Link</span>
                </div>
                <Input
                  placeholder="Paste or type a link..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mb-2"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLinkInput(false)}
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
                <div className="grid grid-cols-2 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
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
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" />
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
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Monetization</span>
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
        <div className="p-4 bg-muted/30">
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
                className="h-9 w-9 p-0 hover:bg-accent"
              >
                <Image className="h-4 w-4 text-green-600" />
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
                className="h-9 w-9 p-0 hover:bg-accent"
              >
                <Video className="h-4 w-4 text-blue-600" />
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
                className="h-9 w-9 p-0 hover:bg-accent"
              >
                <Paperclip className="h-4 w-4 text-purple-600" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="h-9 w-9 p-0 hover:bg-accent"
              >
                <LinkIcon className="h-4 w-4 text-orange-600" />
              </Button>

              {/* Integration Select */}
              <Select value={integrationApp} onValueChange={setIntegrationApp}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-accent"
                  asChild
                >
                  <SelectTrigger className="border-none shadow-none">
                    <Zap className="h-4 w-4 text-yellow-600" />
                  </SelectTrigger>
                </Button>
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
                className="h-9 px-3 text-sm hover:bg-accent"
              >
                💰
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm hover:bg-accent"
              >
                <Smile className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm hover:bg-accent"
              >
                <Hash className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                size="sm"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreatePostModal;

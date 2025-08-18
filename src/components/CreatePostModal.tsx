
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
import { Badge } from '@/components/ui/badge';
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
  Users,
  Plus,
  DollarSign
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card shadow-2xl max-h-[95vh] overflow-hidden flex flex-col border-0 rounded-2xl">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                JD
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold">Create Post</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-6 space-y-6">
            {/* Enhanced Title Input */}
            <div className="space-y-2">
              <Input
                placeholder="Write a captivating title that grabs attention..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none shadow-none p-0 placeholder:text-muted-foreground/70 focus-visible:ring-0 bg-transparent"
              />
              <div className="h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>
            </div>

            {/* Enhanced Content Editor */}
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts, experiences, or insights... Make it engaging and authentic!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[240px] border-none shadow-none p-0 resize-none text-lg leading-relaxed placeholder:text-muted-foreground/70 focus-visible:ring-0 bg-transparent"
              />
            </div>

            {/* Enhanced Link Preview */}
            {showLinkInput && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Add Link</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowLinkInput(false)}
                    className="ml-auto h-8 w-8 p-0 hover:bg-blue-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-white/50 dark:bg-gray-900/50 border-blue-200/50 dark:border-blue-800/50"
                />
              </div>
            )}

            {/* Enhanced File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Attached Files ({selectedFiles.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Integration Display */}
            {integrationApp && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-semibold text-yellow-900 dark:text-yellow-100">Connected: {integrationApp}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIntegrationApp('')}
                    className="ml-auto h-8 w-8 p-0 hover:bg-yellow-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Enhanced Pricing Options */}
            {showPricingOptions && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-semibold text-green-900 dark:text-green-100">Monetization</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowPricingOptions(false);
                      setIsPaid(false);
                      setPrice('');
                    }}
                    className="h-8 w-8 p-0 hover:bg-green-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="paid-post"
                      checked={isPaid}
                      onCheckedChange={setIsPaid}
                    />
                    <Label htmlFor="paid-post" className="font-medium">Paid Content</Label>
                  </div>
                  {isPaid && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="price" className="text-sm font-medium">$</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="9.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-24 h-9 bg-white/50 dark:bg-gray-900/50"
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

        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Enhanced Bottom Action Bar */}
        <div className="p-6 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30">
          <div className="flex items-center justify-between">
            {/* Media Options */}
            <div className="flex items-center gap-2">
              {/* Photo Upload */}
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
                className="h-11 px-4 hover:bg-green-500/10 hover:text-green-600 transition-all duration-200 group"
              >
                <Image className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">Photo</span>
              </Button>

              {/* Video Upload */}
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
                className="h-11 px-4 hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200 group"
              >
                <Video className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">Video</span>
              </Button>

              {/* Document Upload */}
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
                className="h-11 px-4 hover:bg-purple-500/10 hover:text-purple-600 transition-all duration-200 group"
              >
                <Paperclip className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">File</span>
              </Button>

              {/* Link */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="h-11 px-4 hover:bg-orange-500/10 hover:text-orange-600 transition-all duration-200 group"
              >
                <LinkIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">Link</span>
              </Button>

              {/* Integration */}
              <Select value={integrationApp} onValueChange={setIntegrationApp}>
                <SelectTrigger className="h-11 px-4 border-none bg-transparent hover:bg-yellow-500/10 hover:text-yellow-600 transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">Apps</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="spotify">🎵 Spotify</SelectItem>
                  <SelectItem value="youtube">📺 YouTube</SelectItem>
                  <SelectItem value="github">💻 GitHub</SelectItem>
                  <SelectItem value="twitter">🐦 Twitter</SelectItem>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-8 mx-3" />

              {/* Monetization */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPricingOptions(!showPricingOptions)}
                className="h-11 px-4 hover:bg-green-500/10 hover:text-green-600 transition-all duration-200 group"
              >
                <DollarSign className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">Monetize</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="h-11 px-6 border-2 hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePost}
                className="h-11 px-8 bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                disabled={!content.trim() && selectedFiles.length === 0}
              >
                <Plus className="h-5 w-5 mr-2" />
                Publish Post
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreatePostModal;

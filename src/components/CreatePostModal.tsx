
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Image, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Zap,
  Upload,
  Paperclip
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'document' | 'link' | 'integration'>('text');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [integrationApp, setIntegrationApp] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createPost } = usePosts(currentUser?.id);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} selected for upload`,
      });
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim() && !selectedFile && !linkUrl.trim()) {
      toast({
        title: "Error",
        description: "Please add content, upload a file, or provide a link",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please sign in to create posts",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let mediaUrl = '';
      let mediaType = '';

      // Handle file upload to Supabase storage if file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        mediaType = selectedFile.type;
      }

      // For link posts, use the link URL as media
      if (postType === 'link' && linkUrl.trim()) {
        mediaUrl = linkUrl;
        mediaType = 'link';
      }

      // Create post data
      const postData = {
        user_id: currentUser.id,
        content: content.trim(),
        post_type: postType,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        is_paid: isPaid,
        price: isPaid ? parseFloat(price) || 0 : null,
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        metadata: {
          title: title.trim() || null,
          integration_app: integrationApp || null,
        }
      };

      await createPost(postData);

      // Reset form
      setContent('');
      setTitle('');
      setSelectedFile(null);
      setLinkUrl('');
      setIntegrationApp('');
      setIsPaid(false);
      setPrice('');
      setPostType('text');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Post</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Title Input */}
          <div className="mb-4">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] mt-1"
            />
          </div>

          {/* Link URL Input (conditionally shown) */}
          {postType === 'link' && (
            <div className="mb-4">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {/* Integration App Selection (conditionally shown) */}
          {postType === 'integration' && (
            <div className="mb-4">
              <Label htmlFor="integration-app">Select App</Label>
              <Select value={integrationApp} onValueChange={setIntegrationApp}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an app to integrate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* File Upload Section (conditionally shown) */}
          {(postType === 'image' || postType === 'video' || postType === 'document') && (
            <div className="mb-4">
              <Label htmlFor={`${postType}-upload`}>Upload {postType.charAt(0).toUpperCase() + postType.slice(1)}</Label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <input
                  id={`${postType}-upload`}
                  type="file"
                  accept={
                    postType === 'image' ? 'image/*' :
                    postType === 'video' ? 'video/*' :
                    '.pdf,.doc,.docx,.txt'
                  }
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById(`${postType}-upload`)?.click()}
                >
                  Choose {postType.charAt(0).toUpperCase() + postType.slice(1)}
                </Button>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Section with Post Type Buttons and Paid Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {/* Post Type Buttons - Left Side */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={postType === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPostType('text')}
                className="flex items-center gap-1 px-3 py-2"
              >
                <FileText className="w-4 h-4" />
                <span className="sr-only">Text</span>
              </Button>
              <Button
                type="button"
                variant={postType === 'image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPostType('image')}
                className="flex items-center gap-1 px-3 py-2"
              >
                <Image className="w-4 h-4" />
                <span className="sr-only">Image</span>
              </Button>
              <Button
                type="button"
                variant={postType === 'video' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPostType('video')}
                className="flex items-center gap-1 px-3 py-2"
              >
                <Video className="w-4 h-4" />
                <span className="sr-only">Video</span>
              </Button>
              <Button
                type="button"
                variant={postType === 'document' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPostType('document')}
                className="flex items-center gap-1 px-3 py-2"
              >
                <Paperclip className="w-4 h-4" />
                <span className="sr-only">Document</span>
              </Button>
              <Button
                type="button"
                variant={postType === 'link' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPostType('link')}
                className="flex items-center gap-1 px-3 py-2"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="sr-only">Link</span>
              </Button>
              <Button
                type="button"
                variant={postType === 'integration' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPostType('integration')}
                className="flex items-center gap-1 px-3 py-2"
              >
                <Zap className="w-4 h-4" />
                <span className="sr-only">Integration</span>
              </Button>
            </div>

            {/* Free/Paid Toggle - Right Side */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="paid-post"
                  checked={isPaid}
                  onCheckedChange={setIsPaid}
                />
                <Label htmlFor="paid-post" className="text-sm font-medium">
                  {isPaid ? 'Paid' : 'Free'}
                </Label>
              </div>
              {isPaid && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="price" className="text-sm">$</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-20 h-8"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostModal;


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
  const { toast } = useToast();

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

  const handleCreatePost = () => {
    if (!content.trim() && !selectedFile) {
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
    setSelectedFile(null);
    setLinkUrl('');
    setIntegrationApp('');
    setIsPaid(false);
    setPrice('');
    onClose();
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
          {/* Post Type Selection */}
          <Tabs value={postType} onValueChange={(value: any) => setPostType(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video
              </TabsTrigger>
            </TabsList>
            
            {/* Additional tabs in a second row */}
            <TabsList className="grid w-full grid-cols-3 mt-2">
              <TabsTrigger value="document" className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Document
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Link
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Integration
              </TabsTrigger>
            </TabsList>

            {/* Title Input */}
            <div className="mt-4">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Content based on post type */}
            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Choose Image
                  </Button>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="image-caption">Caption</Label>
                <Textarea
                  id="image-caption"
                  placeholder="Add a caption..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <div>
                <Label htmlFor="video-upload">Upload Video</Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    Choose Video
                  </Button>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="video-description">Description</Label>
                <Textarea
                  id="video-description"
                  placeholder="Describe your video..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="document" className="space-y-4">
              <div>
                <Label htmlFor="doc-upload">Upload Document</Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <input
                    id="doc-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('doc-upload')?.click()}
                  >
                    Choose Document
                  </Button>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="doc-description">Description</Label>
                <Textarea
                  id="doc-description"
                  placeholder="Describe your document..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="link-description">Description</Label>
                <Textarea
                  id="link-description"
                  placeholder="Tell us about this link..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <div>
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
              <div>
                <Label htmlFor="integration-description">Description</Label>
                <Textarea
                  id="integration-description"
                  placeholder="Describe this integration..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Paid/Free Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="paid-post"
                checked={isPaid}
                onCheckedChange={setIsPaid}
              />
              <Label htmlFor="paid-post">Paid Post</Label>
            </div>
            {isPaid && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-20"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Create Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostModal;

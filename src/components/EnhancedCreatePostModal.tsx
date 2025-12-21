import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Upload,
  Plus,
  Trash2,
  BarChart3,
  ExternalLink,
  Lock,
  Users,
  Crown,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedCreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

type PostType = 'text' | 'image' | 'video' | 'document' | 'link' | 'poll' | 'link_with_button';
type AccessType = 'free' | 'paid' | 'subscriber_only';
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

interface PollOption {
  id: string;
  text: string;
}

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

const EnhancedCreatePostModal: React.FC<EnhancedCreatePostModalProps> = ({ 
  isOpen, 
  onClose,
  onPostCreated 
}) => {
  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [accessType, setAccessType] = useState<AccessType>('free');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkThumbnailUrl, setLinkThumbnailUrl] = useState('');
  const [linkButtonText, setLinkButtonText] = useState('');
  const [linkButtonUrl, setLinkButtonUrl] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { plans, loading: plansLoading } = useSubscriptionPlans(currentUser?.id);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} ready for upload`,
      });
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, { id: Date.now().toString(), text: '' }]);
    }
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(opt => opt.id !== id));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const resetForm = () => {
    setPostType('text');
    setTitle('');
    setContent('');
    setAccessType('free');
    setPrice('');
    setCurrency('INR');
    setSelectedPlanId('');
    setSelectedFile(null);
    setFilePreview(null);
    setLinkUrl('');
    setLinkThumbnailUrl('');
    setLinkButtonText('');
    setLinkButtonUrl('');
    setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
  };

  const handleCreatePost = async () => {
    if (!content.trim() && postType === 'text') {
      toast({
        title: "Error",
        description: "Please add content to your post",
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

    if (accessType === 'paid' && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Error",
        description: "Please set a valid price for paid content",
        variant: "destructive",
      });
      return;
    }

    if (accessType === 'subscriber_only' && !selectedPlanId && plans.length > 0) {
      toast({
        title: "Error",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        toast({
          title: "Error",
          description: "Please add at least 2 poll options",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      let mediaUrl = '';
      let mediaType = '';

      // Handle file upload
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        mediaType = selectedFile.type;
      }

      // For link posts
      if ((postType === 'link' || postType === 'link_with_button') && linkUrl.trim()) {
        mediaUrl = linkUrl;
        mediaType = 'link';
      }

      // Prepare poll data
      const pollData = postType === 'poll' ? {
        options: pollOptions.filter(opt => opt.text.trim()).map(opt => ({
          id: opt.id,
          text: opt.text.trim(),
          votes: 0
        }))
      } : null;

      // Create post data
      const postData = {
        user_id: currentUser.id,
        title: title.trim() || null,
        content: content.trim(),
        post_type: postType,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        is_paid: accessType === 'paid',
        price: accessType === 'paid' ? parseFloat(price) : null,
        currency: accessType === 'paid' ? currency : 'INR',
        is_subscriber_only: accessType === 'subscriber_only',
        subscription_plan_id: accessType === 'subscriber_only' && selectedPlanId ? selectedPlanId : null,
        poll_options: pollData,
        poll_votes: postType === 'poll' ? {} : null,
        link_thumbnail_url: linkThumbnailUrl || null,
        link_button_text: linkButtonText || null,
        link_button_url: linkButtonUrl || null,
        link_clicks: 0,
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        metadata: {}
      };

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      resetForm();
      onPostCreated?.();
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

  const getCurrencySymbol = () => CURRENCIES.find(c => c.value === currency)?.symbol || '₹';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-background border-border shadow-2xl max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Create New Post</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Share content with your audience</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
              {/* Post Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Content Type</Label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {[
                    { type: 'text', icon: FileText, label: 'Text' },
                    { type: 'image', icon: ImageIcon, label: 'Image' },
                    { type: 'video', icon: Video, label: 'Video' },
                    { type: 'document', icon: FileText, label: 'Document' },
                    { type: 'link', icon: LinkIcon, label: 'Link' },
                    { type: 'poll', icon: BarChart3, label: 'Poll' },
                    { type: 'link_with_button', icon: ExternalLink, label: 'Link+CTA' },
                  ].map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant={postType === type ? "default" : "outline"}
                      size="sm"
                      className={`flex flex-col h-16 gap-1 ${
                        postType === type 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setPostType(type as PostType)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                  Title <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Give your post a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/50 border-border focus:ring-primary"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-semibold text-foreground">Content</Label>
                <Textarea
                  id="content"
                  placeholder={postType === 'poll' ? "Ask a question..." : "What would you like to share?"}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] bg-muted/50 border-border focus:ring-primary resize-none"
                />
              </div>

              {/* Media Upload (for image, video, document) */}
              {['image', 'video', 'document'].includes(postType) && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Upload {postType.charAt(0).toUpperCase() + postType.slice(1)}
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30 hover:bg-muted/50 transition-colors">
                    {filePreview ? (
                      <div className="space-y-3">
                        {postType === 'image' && (
                          <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        )}
                        {postType === 'video' && (
                          <video src={filePreview} className="max-h-48 mx-auto rounded-lg" controls />
                        )}
                        {postType === 'document' && (
                          <div className="flex items-center justify-center gap-2 text-foreground">
                            <FileText className="w-8 h-8" />
                            <span>{selectedFile?.name}</span>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreview(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <input
                          id="file-upload"
                          type="file"
                          accept={
                            postType === 'image' ? 'image/*' : 
                            postType === 'video' ? 'video/*' : 
                            '.pdf,.doc,.docx,.txt,.xls,.xlsx'
                          }
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Choose {postType.charAt(0).toUpperCase() + postType.slice(1)}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {postType === 'image' && 'PNG, JPG, GIF up to 10MB'}
                          {postType === 'video' && 'MP4, MOV, AVI up to 100MB'}
                          {postType === 'document' && 'PDF, DOC, XLS up to 25MB'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Link Input */}
              {postType === 'link' && (
                <div className="space-y-2">
                  <Label htmlFor="link-url" className="text-sm font-semibold text-foreground">Link URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="bg-muted/50 border-border"
                  />
                </div>
              )}

              {/* Link with Button/Thumbnail */}
              {postType === 'link_with_button' && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="space-y-2">
                    <Label htmlFor="link-url-btn" className="text-sm font-semibold text-foreground">Link URL</Label>
                    <Input
                      id="link-url-btn"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-url" className="text-sm font-semibold text-foreground">
                      Thumbnail URL <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="thumbnail-url"
                      placeholder="https://example.com/image.jpg"
                      value={linkThumbnailUrl}
                      onChange={(e) => setLinkThumbnailUrl(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="button-text" className="text-sm font-semibold text-foreground">Button Text</Label>
                      <Input
                        id="button-text"
                        placeholder="Learn More"
                        value={linkButtonText}
                        onChange={(e) => setLinkButtonText(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="button-url" className="text-sm font-semibold text-foreground">Button URL</Label>
                      <Input
                        id="button-url"
                        placeholder="https://example.com/cta"
                        value={linkButtonUrl}
                        onChange={(e) => setLinkButtonUrl(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Poll Options */}
              {postType === 'poll' && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Poll Options</Label>
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option.text}
                          onChange={(e) => updatePollOption(option.id, e.target.value)}
                          className="flex-1 bg-muted/50 border-border"
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePollOption(option.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollOptions.length < 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPollOption}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
              )}

              <Separator />

              {/* Access Type Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-foreground">Access Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'free', icon: Users, label: 'Free', desc: 'Available to everyone' },
                    { type: 'paid', icon: Lock, label: 'Paid', desc: 'Unlock with payment' },
                    { type: 'subscriber_only', icon: Crown, label: 'Subscribers', desc: 'Exclusive content' },
                  ].map(({ type, icon: Icon, label, desc }) => (
                    <button
                      key={type}
                      onClick={() => setAccessType(type as AccessType)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        accessType === type 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50 bg-muted/30'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${accessType === type ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-semibold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Content Options */}
              {accessType === 'paid' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-muted/30 rounded-xl border border-border space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Pricing</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm text-foreground">Currency</Label>
                      <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(curr => (
                            <SelectItem key={curr.value} value={curr.value}>
                              {curr.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm text-foreground">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {getCurrencySymbol()}
                        </span>
                        <Input
                          id="price"
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="pl-8 bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users will need to pay to unlock this content. Payment is processed via Razorpay.
                  </p>
                </motion.div>
              )}

              {/* Subscriber Only Options */}
              {accessType === 'subscriber_only' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-muted/30 rounded-xl border border-border space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Subscription Plan</span>
                  </div>
                  {plans.length > 0 ? (
                    <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select a subscription plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            <div className="flex items-center gap-2">
                              <span>{plan.title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: plan.currency,
                                  minimumFractionDigits: 0
                                }).format(plan.price_amount / 100)}/{plan.billing_cycle}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border">
                      You haven't created any subscription plans yet. Go to Settings to create plans.
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Only users subscribed to the selected plan can view this content.
                  </p>
                </motion.div>
              )}
            </CardContent>

            {/* Footer Actions */}
            <div className="border-t border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {accessType !== 'free' && (
                    <Badge variant="outline" className="gap-1">
                      {accessType === 'paid' ? <Lock className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                      {accessType === 'paid' ? 'Paid Content' : 'Subscribers Only'}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-primary-foreground min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      'Create Post'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedCreatePostModal;

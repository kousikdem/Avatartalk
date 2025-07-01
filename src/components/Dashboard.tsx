
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Facebook, Instagram, Twitter, Linkedin, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedDashboard from './EnhancedDashboard';

const Dashboard = () => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('/placeholder.svg');
  const [displayName, setDisplayName] = useState('John Doe');
  const [username, setUsername] = useState('johndoe');
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        toast({
          title: "Profile Image Updated",
          description: "Your profile image has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const profileUrl = `${window.location.origin}/${username}`;

  const shareToSocial = (platform: string) => {
    const text = "Check out my profile on AvatarTalk.bio!";
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(text);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      instagram: `https://www.instagram.com`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link Copied",
      description: "Profile link copied to clipboard!",
    });
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-bold">
                  {displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Upload profile picture"
              />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-600">@{username}</p>
              <p className="text-sm text-gray-500">Digital Creator & Tech Enthusiast</p>
            </div>
          </div>

          <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Your Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={profileUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyToClipboard} size="sm">
                    <Link className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('facebook')}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('twitter')}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    X
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('instagram')}
                    className="flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('linkedin')}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('pinterest')}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm0 19c-.68 0-1.35-.09-1.99-.27.28-.44.78-1.28.78-1.28s.2.38.62.38c2.97 0 5.02-2.77 5.02-6.12 0-2.65-2.23-4.63-5.19-4.63-3.72 0-6.49 2.67-6.49 6.16 0 1.51.57 2.86 1.8 3.36.2.08.38 0 .44-.22.04-.16.14-.56.18-.73.06-.23.03-.31-.11-.51-.31-.43-.51-.99-.51-1.78 0-2.3 1.72-4.36 4.47-4.36 2.44 0 3.78 1.49 3.78 3.48 0 2.61-1.16 4.81-2.88 4.81-1.03 0-1.8-.85-1.55-1.89.3-1.24 1.04-2.58 1.04-3.47 0-.8-.43-1.47-1.32-1.47-1.05 0-1.89.86-1.89 2.01 0 .73.25 1.23.25 1.23l-1.02 4.33c-.3 1.29-.05 2.87-.02 3.03.02.09.12.11.17.04.07-.1.98-1.22 1.34-2.47.1-.35.56-2.18.56-2.18.28.53 1.1 1 1.97 1 2.6 0 4.36-2.37 4.36-5.54C17.15 5.5 14.95 3.5 12 3.5z"/>
                    </svg>
                    Pinterest
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <EnhancedDashboard />
    </div>
  );
};

export default Dashboard;

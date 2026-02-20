import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Briefcase, GraduationCap, Baby } from 'lucide-react';
import { avatarPresets } from '@/data/avatarPresets';

interface ReadyMadeAvatarGalleryProps {
  onAvatarSelected: (config: any) => void;
}

const ReadyMadeAvatarGallery: React.FC<ReadyMadeAvatarGalleryProps> = ({ onAvatarSelected }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const maleAvatars = avatarPresets.filter(p => p.gender === 'male');
  const femaleAvatars = avatarPresets.filter(p => p.gender === 'female');
  const professionalAvatars = avatarPresets.filter(p => 
    p.description.includes('professional') || 
    p.description.includes('business') ||
    p.name.includes('Professional')
  );

  const renderAvatarGrid = (avatars: typeof avatarPresets) => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onAvatarSelected(avatar.config)}
            className="group relative rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all hover:scale-105"
          >
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              {avatar.thumbnail ? (
                <img 
                  src={avatar.thumbnail} 
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl">
                  {avatar.gender === 'male' ? '👨' : '👩'}
                </div>
              )}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-white font-semibold text-sm mb-1">
                  {avatar.name}
                </div>
                <div className="text-white/80 text-xs line-clamp-2">
                  {avatar.description}
                </div>
              </div>
            </div>

            <Badge className="absolute top-2 right-2 text-xs">
              {avatar.gender}
            </Badge>
          </button>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Ready-Made Avatar Gallery
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a pre-configured avatar and customize it further
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              <Users className="w-4 h-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="male">
              👨 Male
            </TabsTrigger>
            <TabsTrigger value="female">
              👩 Female
            </TabsTrigger>
            <TabsTrigger value="professional">
              <Briefcase className="w-4 h-4 mr-2" />
              Pro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {renderAvatarGrid(avatarPresets)}
          </TabsContent>

          <TabsContent value="male">
            {renderAvatarGrid(maleAvatars)}
          </TabsContent>

          <TabsContent value="female">
            {renderAvatarGrid(femaleAvatars)}
          </TabsContent>

          <TabsContent value="professional">
            {renderAvatarGrid(professionalAvatars)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReadyMadeAvatarGallery;

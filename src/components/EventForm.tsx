
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image, Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
}

const EventForm: React.FC<EventFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_time: '',
    end_time: '',
    location: '',
    attendees: '',
    thumbnail: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const { createEvent, uploadThumbnail } = useEvents();
  const { toast } = useToast();

  const eventTypes = [
    'meeting',
    'conference',
    'workshop',
    'webinar',
    'collaboration',
    'other'
  ];

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create events",
          variant: "destructive",
        });
        return;
      }

      let thumbnailUrl = '';
      if (formData.thumbnail) {
        thumbnailUrl = await uploadThumbnail(formData.thumbnail, user.id);
      }

      const attendeesList = formData.attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const eventData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        attendees: attendeesList,
        status: 'upcoming',
        thumbnail_url: thumbnailUrl
      };

      await createEvent(eventData);
      onSave(eventData);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        event_type: 'meeting',
        start_time: '',
        end_time: '',
        location: '',
        attendees: '',
        thumbnail: null
      });
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-sm border-green-200/60">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-green-700 to-emerald-700 bg-clip-text text-transparent">
            Add New Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-blue-200/60">
            <CardHeader>
              <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 bg-white/80 border-slate-200/60"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_type" className="text-sm font-medium text-slate-700">
                    Event Type
                  </Label>
                  <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                    <SelectTrigger className="mt-1 bg-white/80 border-slate-200/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter location or meeting link"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 bg-white/80 border-slate-200/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time" className="text-sm font-medium text-slate-700">
                    Start Date & Time *
                  </Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="mt-1 bg-white/80 border-slate-200/60"
                  />
                </div>

                <div>
                  <Label htmlFor="end_time" className="text-sm font-medium text-slate-700">
                    End Date & Time *
                  </Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="mt-1 bg-white/80 border-slate-200/60"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 min-h-[100px] bg-white/80 border-slate-200/60"
                />
              </div>

              <div>
                <Label htmlFor="attendees" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Attendees (Email addresses, comma-separated)
                </Label>
                <Input
                  id="attendees"
                  placeholder="user1@example.com, user2@example.com"
                  value={formData.attendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
                  className="mt-1 bg-white/80 border-slate-200/60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail Upload */}
          <Card className="bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/20 border-emerald-200/60">
            <CardHeader>
              <CardTitle className="text-lg bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent">Event Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors bg-gradient-to-br from-emerald-50/50 to-cyan-50/50">
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                  <label htmlFor="thumbnail" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Click to upload event thumbnail</p>
                    <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>

                {formData.thumbnail && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
                    <Image className="w-5 h-5 text-emerald-600" />
                    <span className="flex-1 text-sm text-slate-700">{formData.thumbnail.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                      className="hover:bg-gradient-to-r hover:from-red-100/80 hover:to-pink-100/80"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-gradient-to-r from-white to-slate-50/60 hover:from-slate-50 hover:to-slate-100 border-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {isUploading ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;

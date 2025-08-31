
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, MapPin, Users, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
}

const EventForm: React.FC<EventFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    date: undefined as Date | undefined,
    startTime: '',
    endTime: '',
    location: '',
    participants: [] as string[],
    newParticipant: ''
  });

  const eventTypes = [
    { value: 'virtual_meeting', label: 'Virtual Meeting' },
    { value: 'collaboration', label: 'Collaboration Session' },
    { value: 'event', label: 'Event/Workshop' },
    { value: 'meeting', label: 'Regular Meeting' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      return;
    }

    const startDateTime = new Date(formData.date);
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(formData.date);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);

    const eventData = {
      title: formData.title,
      event_type: formData.type,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: formData.location,
      attendees: formData.participants,
      status: 'confirmed'
    };

    onSave(eventData);
    
    // Reset form
    setFormData({
      title: '',
      type: '',
      description: '',
      date: undefined,
      startTime: '',
      endTime: '',
      location: '',
      participants: [],
      newParticipant: ''
    });
  };

  const addParticipant = () => {
    if (formData.newParticipant.trim() && !formData.participants.includes(formData.newParticipant.trim())) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, prev.newParticipant.trim()],
        newParticipant: ''
      }));
    }
  };

  const removeParticipant = (email: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== email)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addParticipant();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                  Event Type *
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startTime" className="text-sm font-medium text-slate-700">
                    Start Time *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm font-medium text-slate-700">
                    End Time *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                  Location / Meeting Link
                </Label>
                <Input
                  id="location"
                  placeholder="Meeting room or virtual link"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Participants / Invites
                </Label>
                <div className="mt-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
                      value={formData.newParticipant}
                      onChange={(e) => setFormData(prev => ({ ...prev, newParticipant: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addParticipant}
                      size="sm"
                      className="px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.participants.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.participants.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => removeParticipant(email)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Event description and agenda..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;

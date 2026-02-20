
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  location: string | null;
  thumbnail_url: string | null;
  attendees: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const transformEvent = (event: any): Event => ({
    ...event,
    attendees: Array.isArray(event.attendees) ? event.attendees.filter((item: any) => typeof item === 'string') : []
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      const transformedEvents: Event[] = (data || []).map(transformEvent);
      setEvents(transformedEvents);
    } catch (error: any) {
      toast.error('Failed to fetch events: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadThumbnail = async (file: File, userId: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast.error('Failed to upload thumbnail: ' + error.message);
      throw error;
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert([{ ...eventData, user_id: user.id, attendees: eventData.attendees }])
        .select()
        .single();

      if (error) throw error;

      const transformedEvent: Event = transformEvent(data);
      setEvents(prev => [...prev, transformedEvent]);
      toast.success('Event created successfully!');
      return transformedEvent;
    } catch (error: any) {
      toast.error('Failed to create event: ' + error.message);
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedEvent: Event = transformEvent(data);
      setEvents(prev => prev.map(event => event.id === id ? transformedEvent : event));
      toast.success('Event updated successfully!');
      return transformedEvent;
    } catch (error: any) {
      toast.error('Failed to update event: ' + error.message);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Event deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete event: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    uploadThumbnail,
    refetch: fetchEvents
  };
};

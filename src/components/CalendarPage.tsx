
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Video, Phone, Calendar as CalendarComponent, Grid, List } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import EventForm from '@/components/EventForm';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees: string[];
  status: string;
}

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const { events, loading, createEvent } = useCalendarEvents();

  // Enhanced mock events with collaborations and virtual meetings
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'AI Avatar Demo Session',
      description: 'Live demonstration of new avatar features',
      event_type: 'virtual_meeting',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      location: 'Virtual Meeting Room',
      attendees: ['john@example.com', 'jane@example.com', 'client@techcorp.com'],
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Product Strategy Collaboration',
      description: 'Quarterly planning session with stakeholders',
      event_type: 'collaboration',
      start_time: new Date(Date.now() + 86400000).toISOString(),
      end_time: new Date(Date.now() + 86400000 + 7200000).toISOString(),
      location: 'Conference Room A',
      attendees: ['team@avatartalk.bio', 'partners@example.com'],
      status: 'pending'
    },
    {
      id: '3',
      title: 'Voice Training Workshop',
      description: 'Interactive workshop for voice customization',
      event_type: 'event',
      start_time: new Date(Date.now() + 172800000).toISOString(),
      end_time: new Date(Date.now() + 172800000 + 5400000).toISOString(),
      location: 'Virtual Workshop Space',
      attendees: ['participants@workshop.com'],
      status: 'confirmed'
    }
  ];

  const allEvents = [...events, ...mockEvents];

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'virtual_meeting':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'collaboration':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'event':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'meeting':
        return 'bg-slate-50 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'virtual_meeting':
        return Video;
      case 'collaboration':
        return Users;
      case 'event':
        return CalendarIcon;
      case 'meeting':
        return Phone;
      default:
        return CalendarIcon;
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // Open event details modal
  };

  const handleCreateEvent = (eventData: any) => {
    console.log('Creating event:', eventData);
    setIsEventFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Calendar & Events
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage meetings, events, and collaborations
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-lg p-1">
              <Button
                variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('monthly')}
                className="h-8 px-3"
              >
                Monthly
              </Button>
              <Button
                variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('weekly')}
                className="h-8 px-3"
              >
                Weekly
              </Button>
            </div>
            
            <Button 
              onClick={() => setIsEventFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-slate-600" />
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-lg border border-slate-200/60 bg-white/40 p-3 pointer-events-auto"
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasEvents: {
                    backgroundColor: 'rgb(219 234 254)',
                    color: 'rgb(30 64 175)',
                    fontWeight: 'bold',
                    borderRadius: '6px'
                  }
                }}
              />
              
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/60">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {allEvents.filter(e => e.event_type === 'virtual_meeting').length}
                  </div>
                  <div className="text-sm text-slate-600">Virtual Meetings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {allEvents.filter(e => e.event_type === 'collaboration').length}
                  </div>
                  <div className="text-sm text-slate-600">Collaborations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {allEvents.filter(e => e.event_type === 'event').length}
                  </div>
                  <div className="text-sm text-slate-600">Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'MMM dd, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No events scheduled</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEventFormOpen(true)}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              ) : (
                selectedDateEvents.map((event) => {
                  const EventIcon = getEventIcon(event.event_type);
                  return (
                    <div 
                      key={event.id} 
                      className="border border-slate-200/60 rounded-lg p-4 bg-white/80 hover:bg-white/90 transition-all duration-300 cursor-pointer group hover:shadow-md"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <EventIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                        </div>
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        
                        {event.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {event.attendees.length} participant{event.attendees.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Overview */}
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarComponent className="w-5 h-5 text-slate-600" />
              Upcoming Events & Collaborations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEvents.slice(0, 6).map((event) => {
                const EventIcon = getEventIcon(event.event_type);
                return (
                  <div 
                    key={event.id} 
                    className="border border-slate-200/60 rounded-lg p-4 bg-white/80 hover:bg-white/90 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <EventIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <h3 className="font-medium text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{format(new Date(event.start_time), 'MMM dd, HH:mm')}</p>
                      {event.location && (
                        <p className="truncate">{event.location}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        {event.attendees.length} participants
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event Form Modal */}
        <EventForm
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          onSave={handleCreateEvent}
        />
      </div>
    </div>
  );
};

export default CalendarPage;

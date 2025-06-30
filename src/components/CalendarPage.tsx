
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Video, Phone } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

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
  const { events, loading, createEvent } = useCalendarEvents();

  // Mock events for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      event_type: 'meeting',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      location: 'Conference Room A',
      attendees: ['john@example.com', 'jane@example.com'],
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Client Consultation',
      description: 'AI avatar consultation',
      event_type: 'appointment',
      start_time: new Date(Date.now() + 86400000).toISOString(),
      end_time: new Date(Date.now() + 86400000 + 1800000).toISOString(),
      location: 'Virtual Meeting',
      attendees: ['client@example.com'],
      status: 'pending'
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
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'appointment':
        return 'bg-green-100 text-green-800';
      case 'call':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return Users;
      case 'appointment':
        return CalendarIcon;
      case 'call':
        return Phone;
      default:
        return CalendarIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage your meetings and appointments</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
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
                className="rounded-md border"
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasEvents: {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                Events for {format(selectedDate, 'MMM dd, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No events scheduled</p>
              ) : (
                selectedDateEvents.map((event) => {
                  const EventIcon = getEventIcon(event.event_type);
                  return (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {event.event_type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                        
                        {event.attendees.length > 0 && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEvents.slice(0, 6).map((event) => {
                const EventIcon = getEventIcon(event.event_type);
                return (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <EventIcon className="w-5 h-5 text-gray-600" />
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {format(new Date(event.start_time), 'MMM dd, HH:mm')}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;

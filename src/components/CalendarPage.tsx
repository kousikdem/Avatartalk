
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Plus,
  Filter,
  Search,
  MapPin,
  Phone,
  Trash2,
  Edit3
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: 'meeting' | 'appointment' | 'call' | 'video';
  date: Date;
  time: string;
  duration: string;
  attendees?: string[];
  location?: string;
  description?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Product Strategy Meeting',
      type: 'meeting',
      date: new Date(),
      time: '10:00 AM',
      duration: '1h',
      attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      location: 'Conference Room A',
      description: 'Quarterly product roadmap discussion',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Client Consultation',
      type: 'appointment',
      date: new Date(),
      time: '2:30 PM',
      duration: '45m',
      attendees: ['Sarah Wilson'],
      location: 'Office 201',
      description: 'Initial consultation for new project',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Team Stand-up',
      type: 'video',
      date: new Date(),
      time: '9:00 AM',
      duration: '30m',
      attendees: ['Development Team'],
      location: 'Zoom Meeting',
      description: 'Daily team sync and updates',
      status: 'completed'
    }
  ]);

  const getEventTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'appointment': return <CalendarIcon className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const todaysEvents = events.filter(event => 
    event.date.toDateString() === new Date().toDateString()
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Calendar
              </h1>
              <p className="text-gray-600 mt-2">Manage your meetings and appointments</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button className="gradient-button">
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? "default" : "outline"}
                className={view === viewType ? 'gradient-button' : 'border-gray-300'}
                onClick={() => setView(viewType)}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-gray-200"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Events */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white border-2 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-green-500" />
                    Today's Schedule
                  </span>
                  <Badge variant="outline" className="border-green-400 text-green-600 bg-green-50">
                    {todaysEvents.length} events
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No events scheduled for today</p>
                  </div>
                ) : (
                  todaysEvents.map((event) => (
                    <div key={event.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.type)}
                          <h3 className="font-semibold text-gray-800">{event.title}</h3>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time} ({event.duration})</span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.attendees && (
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees.join(', ')}</span>
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="text-gray-600 mt-2">{event.description}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button size="sm" variant="outline" className="border-gray-300">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-500">Meetings</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-green-500">Appointments</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">24h</div>
                    <div className="text-sm text-purple-500">Total Time</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">95%</div>
                    <div className="text-sm text-orange-500">Attendance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;

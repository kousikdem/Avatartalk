import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Video, Clock, User } from 'lucide-react';
import { VirtualBooking, VirtualProduct } from '@/hooks/useVirtualProducts';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface VirtualCollaborationCalendarProps {
  bookings: VirtualBooking[];
  products: VirtualProduct[];
  onSelectBooking: (booking: VirtualBooking) => void;
}

const VirtualCollaborationCalendar: React.FC<VirtualCollaborationCalendarProps> = ({
  bookings,
  products,
  onSelectBooking
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      if (!booking.scheduled_start) return false;
      return isSameDay(new Date(booking.scheduled_start), date);
    });
  };

  const daysWithBookings = bookings
    .filter(b => b.scheduled_start)
    .map(b => new Date(b.scheduled_start!));

  const selectedDateBookings = getBookingsForDate(selectedDate);

  const getProductTitle = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.title || 'Unknown Product';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800',
      'no_show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border-purple-200/60">
      <CardHeader>
        <CardTitle className="text-lg bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" />
          Meeting Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                hasBookings: daysWithBookings
              }}
              modifiersClassNames={{
                hasBookings: 'bg-purple-100 text-purple-900 font-bold'
              }}
            />
          </div>

          {/* Bookings for selected date */}
          <div>
            <h3 className="font-medium text-slate-900 mb-4">
              Meetings on {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {selectedDateBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Video className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No meetings scheduled</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => onSelectBooking(booking)}
                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-slate-900 truncate">
                        {getProductTitle(booking.virtual_product_id)}
                      </h4>
                      <Badge className={getStatusColor(booking.booking_status)}>
                        {booking.booking_status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.scheduled_start 
                          ? format(new Date(booking.scheduled_start), 'h:mm a')
                          : 'TBD'
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>

                    {booking.join_url && booking.payment_status === 'paid' && (
                      <Button
                        size="sm"
                        className="mt-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(booking.join_url!, '_blank');
                        }}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualCollaborationCalendar;

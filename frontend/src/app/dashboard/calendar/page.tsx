'use client';
import BookingCalendar from '@/components/calendar/BookingCalendar';

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">📅 Book a Session</h1>
      <BookingCalendar />
    </div>
  );
}

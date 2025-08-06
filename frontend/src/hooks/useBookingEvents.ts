'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { SessionDTO, ClassDTO, BookingEvent } from '@/types/calendar';

const fetcher = <T>(url: string) => api.get<T>(url).then(res => res.data);

/**
 * Custom hook to fetch & map session + class DTOs into FullCalendar events.
 */
export function useBookingEvents() {
  const { data: sessions, error: sessErr } = useSWR<SessionDTO[]>(
    '/sessions',
    fetcher
  );
  const { data: classes, error: classErr } = useSWR<ClassDTO[]>(
    '/classes',
    fetcher
  );

  const events = useMemo<BookingEvent[]>(() => {
    if (!sessions || !classes) return [];

    const sessionEvents = sessions.map<BookingEvent>(s => ({
      id: String(s.id),
      title: s.max_participants > 1 ? 'Small-Group Slot' : '1:1 Slot',
      start: s.start_time,
      end: s.end_time,
      color: s.max_participants > 1 ? '#10b981' : '#3b82f6',
      extendedProps: {
        id: s.id,
        price: s.price_per_seat,
        max: s.max_participants,
        booked: s.current_bookings,
        kind: s.max_participants > 1 ? 'smallGroup' : 'oneOnOne',
      },
    }));

    const classEvents = classes.map<BookingEvent>(c => ({
      id: `class-${c.id}`,
      title: c.title,
      daysOfWeek: [c.day_of_week],
      startTime: c.start_time,
      endTime: c.end_time,
      backgroundColor: '#f59e0b',
      textColor: '#000',
      extendedProps: {
        id: c.id,
        price: c.price_per_seat,
        max: c.max_participants,
        booked: c.current_bookings,
        kind: 'class',
      },
    }));

    return [...sessionEvents, ...classEvents];
  }, [sessions, classes]);

  return {
    events,
    isLoading: !sessions || !classes,
    error: sessErr || classErr,
    reload: useCallback(() => {
      // revalidate both endpoints
      // @ts-ignore
      sessions && sessions.length && useSWR('/sessions').mutate();
      // @ts-ignore
      classes && classes.length && useSWR('/classes').mutate();
    }, [sessions, classes]),
  };
}

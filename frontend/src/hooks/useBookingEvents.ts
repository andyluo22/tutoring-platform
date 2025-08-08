/* tutoring-platform/frontend/src/hooks/useBookingEvents.ts */
'use client';

import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import api from '@/lib/api';
import type { SessionDTO, ClassDTO, BookingEvent } from '@/types/calendar';

const fetcher = <T,>(url: string) => api.get<T>(url).then(res => res.data);

export function useBookingEvents() {
  const { mutate } = useSWRConfig();

  const { data: sessions, error: sessErr } = useSWR<SessionDTO[]>('/sessions', fetcher);
  const { data: classes,  error: classErr } = useSWR<ClassDTO[]>('/classes',   fetcher);

  const events = useMemo<BookingEvent[]>(() => {
    const evs: BookingEvent[] = [];

    // Sessions = concrete events with full ISO start/end
    sessions?.forEach((s) => {
      evs.push({
        id:    String(s.id),
        title: s.max_participants > 1 ? 'Small Group' : '1:1',
        start: s.start_time, // should be ISO string with timezone
        end:   s.end_time,   // same as above
        color: s.max_participants > 1 ? '#10b981' : '#3b82f6',
        extendedProps: {
          id:     s.id,
          price:  s.price_per_seat,
          max:    s.max_participants,
          booked: s.current_bookings ?? 0,
          kind:   s.max_participants > 1 ? 'smallGroup' : 'oneOnOne',
        },
      });
    });

    // Classes = weekly recurring using daysOfWeek + startTime/endTime
    classes?.forEach((c) => {
      evs.push({
        id:           `class-${c.id}`,
        title:        c.title,
        daysOfWeek:   [Number(c.day_of_week)], // 0=Sun … 6=Sat
        startTime:    c.start_time, // "HH:mm:ss"
        endTime:      c.end_time,   // "HH:mm:ss"
        backgroundColor: '#f59e0b',
        textColor:       '#000',
        extendedProps: {
          id:     c.id,
          price:  c.price_per_seat,
          max:    c.max_participants,
          booked: c.current_bookings ?? 0,
          kind:   'class',
        },
      });
    });

    return evs;
  }, [sessions, classes]);

  const reload = useCallback(() => {
    mutate('/sessions');
    mutate('/classes');
  }, [mutate]);

  return {
    events,
    isLoading: sessions === undefined || classes === undefined,
    error:     sessErr || classErr,
    reload,
  };
}

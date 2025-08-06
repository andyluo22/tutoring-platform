// =====================================================
// File: frontend/src/types/calendar.d.ts
// =====================================================
export interface SessionDTO {
  id: number;
  start_time: string;
  end_time: string;
  price_per_seat: number;
  max_participants: number;
  current_bookings: number;
}

export interface ClassDTO {
  id: string;
  title: string;
  day_of_week: number; // 0=Sunday…6=Saturday
  start_time: string; // "HH:mm:ss"
  end_time: string; // "HH:mm:ss"
  price_per_seat: number;
  max_participants: number;
  current_bookings: number;
}

export type BookingKind = 'oneOnOne' | 'smallGroup' | 'class';

export interface BookingEvent {
  id: string;
  title: string;
  start?: string;
  end?: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
  extendedProps: {
    id: number | string;
    price: number;
    max: number;
    booked: number;
    kind: BookingKind;
  };
}

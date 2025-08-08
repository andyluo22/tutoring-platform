/* tutoring-platform/frontend/src/components/calendar/BookingCalendar.tsx */
'use client';

import React, { useMemo, useState, useCallback, useRef } from 'react';
import FullCalendar, {
  DateSelectArg,
  DateClickArg,
  EventClickArg,
  EventChangeArg,
  EventContentArg,
  EventInput,
} from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin  from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '@/lib/api';
import { useBookingEvents } from '@/hooks/useBookingEvents';
import type { BookingEvent } from '@/types/calendar';

const PRICE_PER_HOUR_CENTS = 3000;   // UI hint; backend is source of truth
const PENDING_ID = '__pending__';
const ALLOWED_DURATIONS = [60, 90, 120]; // minutes — no 30m option

export default function BookingCalendar() {
  const { events: bookingEvents, isLoading, error, reload } = useBookingEvents();

  const calRef = useRef<any>(null); // FullCalendar ref

  const [pending, setPending] = useState<EventInput | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [durationMin, setDurationMin] = useState<number>(90); // default 90m

  const allEvents = useMemo<EventInput[]>(
    () => (pending ? [...bookingEvents, pending] : bookingEvents),
    [bookingEvents, pending]
  );

  // ── helpers ────────────────────────────────────────────────────────────────
  const minsBetween = (a: Date, b: Date) =>
    Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));

  const inWorkHours = (start: Date, end: Date) => {
    // allow 06:00–21:00 inclusive
    const startH = start.getHours() + start.getMinutes() / 60;
    const endH   = end.getHours()   + end.getMinutes()   / 60;
    return startH >= 6 && endH <= 21;
  };

  const isAllowedDuration = (mins: number) => ALLOWED_DURATIONS.includes(mins);

  const withDuration = (start: Date, minutes: number) =>
    new Date(start.getTime() + minutes * 60000);

  const createPending = useCallback((startISO: string, endISO: string) => {
    setPending({
      id: PENDING_ID,
      title: 'Selected',
      start: startISO,
      end: endISO,
      classNames: ['pending-event'], // styled below
      editable: true,
      durationEditable: true,
    });
  }, []);

  // ── selection ──────────────────────────────────────────────────────────────
  const handleSelect = useCallback((sel: DateSelectArg) => {
    const api = calRef.current?.getApi?.();
    const start = sel.start;
    const end   = sel.end;
    const mins  = minsBetween(start, end);

    if (!inWorkHours(start, end)) {
      api?.unselect?.();
      return;
    }

    const picked = isAllowedDuration(mins) ? mins : durationMin;
    const adjustedEnd = withDuration(start, picked);

    // hide the blue selection mirror so only the pending block remains
    api?.unselect?.();
    createPending(start.toISOString(), adjustedEnd.toISOString());
  }, [createPending, durationMin]);

  const handleDateClick = useCallback((info: DateClickArg) => {
    const start = info.date;
    const end   = withDuration(start, durationMin);
    if (!inWorkHours(start, end)) return;
    createPending(start.toISOString(), end.toISOString());
  }, [createPending, durationMin]);

  // keep pending in sync while drag/resize, but block disallowed durations
  const handleEventChange = useCallback((arg: EventChangeArg) => {
    if (arg.event.id !== PENDING_ID) return;
    const start = arg.event.start!;
    const end   = arg.event.end!;
    const mins  = minsBetween(start, end);
    if (!inWorkHours(start, end) || !isAllowedDuration(mins)) {
      const fixedEnd = withDuration(start, durationMin);
      arg.revert();
      createPending(start.toISOString(), fixedEnd.toISOString());
      return;
    }
    createPending(start.toISOString(), end.toISOString());
  }, [createPending, durationMin]);

  // also prevent illegal drops/resizes before they happen
  const eventAllow = useCallback(
    (dropInfo: { start: Date; end: Date }, dragged: any) => {
      if (dragged.id !== PENDING_ID) return true;
      const mins = minsBetween(dropInfo.start, dropInfo.end);
      return inWorkHours(dropInfo.start, dropInfo.end) && isAllowedDuration(mins);
    },
    []
  );

  // ── clicking real events ───────────────────────────────────────────────────
  const handleEventClick = useCallback(async (arg: EventClickArg) => {
    if (arg.event.id === PENDING_ID) return;
    const props = arg.event.extendedProps as BookingEvent['extendedProps'];

    if (props.booked >= props.max) return window.alert('This session is full.');
    if (!window.confirm(`Book this ${props.kind} for $${(props.price/100).toFixed(2)}?`)) return;

    try {
      if (props.price === 0) {
        await api.post('/bookings', {
          user_id: 1, // TODO: replace with real auth user
          session_id: arg.event.id,
          call_type: props.kind === 'class' ? 'zoom' : 'discord',
        });
        reload();
        window.alert('Booked!');
      } else {
        const { data } = await api.post<{ stripe_checkout_url: string }>('/class/book', {
          student_id: 1,
          session_id: arg.event.id,
        });
        window.location.assign(data.stripe_checkout_url);
      }
    } catch (e: any) {
      window.alert(`Booking failed: ${e?.response?.data?.detail || e.message}`);
    }
  }, [reload]);

  const clearPending = useCallback(() => setPending(null), []);

  const confirmPending = useCallback(async () => {
    if (!pending?.start || !pending?.end) return;
    setSubmitting(true);
    try {
      const { data } = await api.post<{ url: string }>('/create-checkout-session', {
        start: pending.start,
        end: pending.end,
      });
      window.location.assign(data.url);
    } catch (e: any) {
      window.alert(`Payment error: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [pending]);

  // ── render booked/pending events ───────────────────────────────────────────
  const renderEvent = useCallback((arg: EventContentArg) => {
    const isPending = arg.event.id === PENDING_ID;
    const p = arg.event.extendedProps as any;
    const label = isPending
      ? 'Selected'
      : p?.kind === 'class'
      ? 'Class'
      : p?.kind === 'smallGroup'
      ? 'Small Group'
      : '1:1';

    return (
      <div className="fc-event-inner space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
              ${isPending ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            {label}
          </span>
        </div>
        {/* our own time text (visible for pending too) */}
        {!!arg.timeText && (
          <div className={isPending ? 'text-[12px] font-medium text-blue-900' : 'text-[11px] opacity-70'}>
            {arg.timeText}
          </div>
        )}
        {!isPending && p?.booked !== undefined && p?.max !== undefined && (
          <div className="text-[10px] opacity-60">{p.booked}/{p.max}</div>
        )}
      </div>
    );
  }, []);

  // ── price preview for pending ──────────────────────────────────────────────
  const pricePreview = useMemo(() => {
    if (!pending?.start || !pending?.end) return null;
    const mins = minsBetween(new Date(pending.start as string), new Date(pending.end as string));
    const cents = Math.round((PRICE_PER_HOUR_CENTS * mins) / 60);
    return { mins, dollars: (cents / 100).toFixed(2) };
  }, [pending]);

  if (isLoading) return <div>Loading calendar…</div>;
  if (error) return <div className="text-red-500">Failed to load calendar.</div>;

  return (
    <div className="p-4">
      {/* Styling & layout (tall rows, darker pending, visible drag highlight) */}
      <style jsx global>{`
        .fc .fc-timegrid-slot,
        .fc .fc-timegrid-slot-lane { min-height: 86px !important; }
        .fc .fc-timegrid-event .fc-event-main { padding: 6px 8px; }

        /* drag selection mirror color */
        .fc .fc-highlight {
          background: rgba(37, 99, 235, 0.22) !important;
        }

        .pending-event {
          background: rgba(37, 99, 235, 0.22) !important; /* blue-600 @ ~22% */
          border: 2px dashed #2563eb !important;          /* blue-600 */
          color: #1e3a8a !important;                      /* blue-800 text */
        }
        .pending-event .fc-event-main,
        .pending-event .fc-event-title,
        .pending-event .fc-event-time {
          color: #1e3a8a !important;
          text-shadow: none !important;
        }
        .pending-event .fc-event-time { display: none !important; } /* hide FC's default time */
      `}</style>

      {/* Duration controls (no 30m) */}
      <div className="mx-auto max-w-6xl mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Duration:</span>
          {[60, 90, 120].map(m => (
            <button
              key={m}
              onClick={() => setDurationMin(m)}
              className={`px-3 py-1.5 rounded-xl border text-sm ${
                durationMin === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
        {pending && pricePreview && (
          <div className="text-sm text-gray-700">
            <span className="font-medium">{pricePreview.mins} min</span> • ${pricePreview.dollars}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="mx-auto max-w-6xl" style={{ height: '86vh' }}>
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          // Per-view header formats (prevents "Jan" on month view)
          views={{
            dayGridMonth: {
              dayHeaderFormat: { weekday: 'short' }, // Sun, Mon, ...
            },
            timeGridWeek: {
              dayHeaderFormat: { weekday: 'short', month: 'short', day: 'numeric' },
              slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true },
            },
            timeGridDay: {
              dayHeaderFormat: { weekday: 'short', month: 'short', day: 'numeric' },
              slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true },
            },
          }}
          nowIndicator
          stickyHeaderDates
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}

          // Real height for generous rows
          contentHeight={1300}
          expandRows

          // Selection flow (drag preview + pending)
          selectable
          selectMirror={true}
          selectMinDistance={6}
          unselectAuto={false}
          selectLongPressDelay={50}
          select={handleSelect}
          selectAllow={({ start, end }) =>
            inWorkHours(start, end) && isAllowedDuration(minsBetween(start, end))
          }
          dateClick={handleDateClick}

          // Events
          events={allEvents}
          eventContent={renderEvent}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          eventAllow={eventAllow}
          editable
          eventResizableFromStart

          // Time window + granularity
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="21:00:00"
          slotDuration="01:00:00"
          slotLabelInterval="01:00:00"
          snapDuration="00:30:00" // you can start on :00 or :30; 30m durations are blocked

          eventOverlap={false}
          height="100%"
        />
      </div>

      {/* Confirm bar */}
      {pending && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl">
          <div className="rounded-2xl border bg-white/95 shadow-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">
                {new Date(pending.start as string).toLocaleString()} &rarr;{' '}
                {new Date(pending.end as string).toLocaleString()}
              </div>
              {pricePreview && (
                <div className="text-gray-600">
                  {pricePreview.mins} min • ${pricePreview.dollars}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearPending}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={confirmPending}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? 'Starting checkout…' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




// 'use client';

// import React, { useMemo, useState, useCallback, useRef } from 'react';
// import FullCalendar, {
//   DateSelectArg,
//   DateClickArg,
//   EventClickArg,
//   EventChangeArg,
//   EventContentArg,
//   EventInput,
// } from '@fullcalendar/react';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import dayGridPlugin  from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import api from '@/lib/api';
// import { useBookingEvents } from '@/hooks/useBookingEvents';
// import type { BookingEvent } from '@/types/calendar';

// const PRICE_PER_HOUR_CENTS = 3000;   // UI hint; backend is source of truth
// const PENDING_ID = '__pending__';
// const ALLOWED_DURATIONS = [60, 90, 120]; // minutes — no 30m option

// export default function BookingCalendar() {
//   const { events: bookingEvents, isLoading, error, reload } = useBookingEvents();

//   const calRef = useRef<any>(null); // FullCalendar ref

//   const [pending, setPending] = useState<EventInput | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [durationMin, setDurationMin] = useState<number>(60); // default 60m

//   const allEvents = useMemo<EventInput[]>(
//     () => (pending ? [...bookingEvents, pending] : bookingEvents),
//     [bookingEvents, pending]
//   );

//   // ── helpers ────────────────────────────────────────────────────────────────
//   const minsBetween = (a: Date, b: Date) =>
//     Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));

//   const inWorkHours = (start: Date, end: Date) => {
//     // allow 06:00–21:00 inclusive
//     const startH = start.getHours() + start.getMinutes() / 60;
//     const endH   = end.getHours()   + end.getMinutes()   / 60;
//     return startH >= 6 && endH <= 21;
//   };

//   const isAllowedDuration = (mins: number) => ALLOWED_DURATIONS.includes(mins);

//   const withDuration = (start: Date, minutes: number) =>
//     new Date(start.getTime() + minutes * 60000);

//   const createPending = useCallback((startISO: string, endISO: string) => {
//     setPending({
//       id: PENDING_ID,
//       title: 'Selected',
//       start: startISO,
//       end: endISO,
//       classNames: ['pending-event'], // styled below
//       editable: true,
//       durationEditable: true,
//     });
//   }, []);

//   // ── selection ──────────────────────────────────────────────────────────────
//   const handleSelect = useCallback((sel: DateSelectArg) => {
//     const api = calRef.current?.getApi?.();
//     // compute the intended duration from the drag; normalize to allowed durations
//     const start = sel.start;
//     const end   = sel.end;
//     const mins  = minsBetween(start, end);

//     if (!inWorkHours(start, end)) {
//       api?.unselect?.();
//       return;
//     }

//     const picked = isAllowedDuration(mins) ? mins : durationMin;
//     const adjustedEnd = withDuration(start, picked);

//     // hide the blue selection mirror first so it won't overlap the pending block
//     api?.unselect?.();
//     createPending(start.toISOString(), adjustedEnd.toISOString());
//   }, [createPending, durationMin]);

//   const handleDateClick = useCallback((info: DateClickArg) => {
//     const start = info.date;
//     const end   = withDuration(start, durationMin);
//     if (!inWorkHours(start, end)) return;
//     createPending(start.toISOString(), end.toISOString());
//   }, [createPending, durationMin]);

//   // keep pending in sync while drag/resize, but block disallowed durations
//   const handleEventChange = useCallback((arg: EventChangeArg) => {
//     if (arg.event.id !== PENDING_ID) return;
//     const start = arg.event.start!;
//     const end   = arg.event.end!;
//     const mins  = minsBetween(start, end);
//     if (!inWorkHours(start, end) || !isAllowedDuration(mins)) {
//       const fixedEnd = withDuration(start, durationMin);
//       arg.revert();
//       createPending(start.toISOString(), fixedEnd.toISOString());
//       return;
//     }
//     createPending(start.toISOString(), end.toISOString());
//   }, [createPending, durationMin]);

//   // also prevent illegal drops/resizes before they happen
//   const eventAllow = useCallback(
//     (dropInfo: { start: Date; end: Date }, dragged: any) => {
//       if (dragged.id !== PENDING_ID) return true;
//       const mins = minsBetween(dropInfo.start, dropInfo.end);
//       return inWorkHours(dropInfo.start, dropInfo.end) && isAllowedDuration(mins);
//     },
//     []
//   );

//   // ── clicking real events ───────────────────────────────────────────────────
//   const handleEventClick = useCallback(async (arg: EventClickArg) => {
//     if (arg.event.id === PENDING_ID) return;
//     const props = arg.event.extendedProps as BookingEvent['extendedProps'];

//     if (props.booked >= props.max) return window.alert('This session is full.');
//     if (!window.confirm(`Book this ${props.kind} for $${(props.price/100).toFixed(2)}?`)) return;

//     try {
//       if (props.price === 0) {
//         await api.post('/bookings', {
//           user_id: 1, // TODO: replace with real auth user
//           session_id: arg.event.id,
//           call_type: props.kind === 'class' ? 'zoom' : 'discord',
//         });
//         reload();
//         window.alert('Booked!');
//       } else {
//         const { data } = await api.post<{ stripe_checkout_url: string }>('/class/book', {
//           student_id: 1,
//           session_id: arg.event.id,
//         });
//         window.location.assign(data.stripe_checkout_url);
//       }
//     } catch (e: any) {
//       window.alert(`Booking failed: ${e?.response?.data?.detail || e.message}`);
//     }
//   }, [reload]);

//   const clearPending = useCallback(() => setPending(null), []);

//   const confirmPending = useCallback(async () => {
//     if (!pending?.start || !pending?.end) return;
//     setSubmitting(true);
//     try {
//       const { data } = await api.post<{ url: string }>('/create-checkout-session', {
//         start: pending.start,
//         end: pending.end,
//       });
//       window.location.assign(data.url);
//     } catch (e: any) {
//       window.alert(`Payment error: ${e?.response?.data?.detail || e.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   }, [pending]);

//   // ── render booked/pending events ───────────────────────────────────────────
//   const renderEvent = useCallback((arg: EventContentArg) => {
//     const isPending = arg.event.id === PENDING_ID;
//     const p = arg.event.extendedProps as any;
//     const label = isPending
//       ? 'Selected'
//       : p?.kind === 'class'
//       ? 'Class'
//       : p?.kind === 'smallGroup'
//       ? 'Small Group'
//       : '1:1';

//     return (
//       <div className="fc-event-inner space-y-1">
//         <div className="flex items-center justify-between gap-2">
//           <span
//             className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
//               ${isPending ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
//           >
//             {label}
//           </span>
//         </div>
//         {/* our own time text (visible for pending too) */}
//         {!!arg.timeText && (
//           <div className={isPending ? 'text-[12px] font-medium text-blue-900' : 'text-[11px] opacity-70'}>
//             {arg.timeText}
//           </div>
//         )}
//         {!isPending && p?.booked !== undefined && p?.max !== undefined && (
//           <div className="text-[10px] opacity-60">{p.booked}/{p.max}</div>
//         )}
//       </div>
//     );
//   }, []);

//   // ── price preview for pending ──────────────────────────────────────────────
//   const pricePreview = useMemo(() => {
//     if (!pending?.start || !pending?.end) return null;
//     const mins = minsBetween(new Date(pending.start as string), new Date(pending.end as string));
//     const cents = Math.round((PRICE_PER_HOUR_CENTS * mins) / 60);
//     return { mins, dollars: (cents / 100).toFixed(2) };
//   }, [pending]);

//   if (isLoading) return <div>Loading calendar…</div>;
//   if (error) return <div className="text-red-500">Failed to load calendar.</div>;

//   return (
//     <div className="p-4">
//       {/* Styling & layout (tall rows, darker pending, visible drag highlight) */}
//       <style jsx global>{`
//         .fc .fc-timegrid-slot,
//         .fc .fc-timegrid-slot-lane { min-height: 86px !important; }
//         .fc .fc-timegrid-event .fc-event-main { padding: 6px 8px; }

//         /* drag selection mirror color */
//         .fc .fc-highlight {
//           background: rgba(37, 99, 235, 0.22) !important;
//         }

//         .pending-event {
//           background: rgba(37, 99, 235, 0.22) !important; /* blue-600 @ ~22% */
//           border: 2px dashed #2563eb !important;          /* blue-600 */
//           color: #1e3a8a !important;                      /* blue-800 text */
//         }
//         .pending-event .fc-event-main,
//         .pending-event .fc-event-title,
//         .pending-event .fc-event-time {
//           color: #1e3a8a !important;
//           text-shadow: none !important;
//         }
//         .pending-event .fc-event-time { display: none !important; } /* hide FC's default time */
//       `}</style>

//       {/* Duration controls (no 30m) */}
//       <div className="mx-auto max-w-6xl mb-3 flex items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-600">Duration:</span>
//           {[60, 90, 120].map(m => (
//             <button
//               key={m}
//               onClick={() => setDurationMin(m)}
//               className={`px-3 py-1.5 rounded-xl border text-sm ${
//                 durationMin === m
//                   ? 'bg-blue-600 text-white border-blue-600'
//                   : 'bg-white hover:bg-gray-50'
//               }`}
//             >
//               {m}m
//             </button>
//           ))}
//         </div>
//         {pending && pricePreview && (
//           <div className="text-sm text-gray-700">
//             <span className="font-medium">{pricePreview.mins} min</span> • ${pricePreview.dollars}
//           </div>
//         )}
//       </div>

//       {/* Calendar */}
//       <div className="mx-auto max-w-6xl" style={{ height: '86vh' }}>
//         <FullCalendar
//           ref={calRef}
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           initialView="timeGridWeek"
//           headerToolbar={{
//             left: 'prev,next today',
//             center: 'title',
//             right: 'dayGridMonth,timeGridWeek,timeGridDay',
//           }}
//           nowIndicator
//           stickyHeaderDates
//           eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
//           dayHeaderFormat={{ weekday: 'short', month: 'short', day: 'numeric' }}
//           slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: true }}

//           // Real height for generous rows
//           contentHeight={1300}
//           expandRows

//           // Selection flow
//           selectable
//           selectMirror={true}        // <— show blue highlight while dragging
//           selectMinDistance={6}      // avoid accidental micro-selections
//           unselectAuto={false}
//           selectLongPressDelay={50}
//           select={handleSelect}
//           selectAllow={({ start, end }) =>
//             inWorkHours(start, end) && isAllowedDuration(minsBetween(start, end))
//           }
//           dateClick={handleDateClick}

//           // Events
//           events={allEvents}
//           eventContent={renderEvent}
//           eventClick={handleEventClick}
//           eventChange={handleEventChange}
//           eventAllow={eventAllow}
//           editable
//           eventResizableFromStart

//           // Time window + granularity
//           allDaySlot={false}
//           slotMinTime="06:00:00"
//           slotMaxTime="21:00:00"
//           slotDuration="01:00:00"
//           slotLabelInterval="01:00:00"
//           snapDuration="00:30:00" // you can still drag on :00 or :30, but 30m durations are blocked

//           eventOverlap={false}
//           height="100%"
//         />
//       </div>

//       {/* Confirm bar */}
//       {pending && (
//         <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl">
//           <div className="rounded-2xl border bg-white/95 shadow-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <div className="text-sm">
//               <div className="font-medium">
//                 {new Date(pending.start as string).toLocaleString()} &rarr;{' '}
//                 {new Date(pending.end as string).toLocaleString()}
//               </div>
//               {pricePreview && (
//                 <div className="text-gray-600">
//                   {pricePreview.mins} min • ${pricePreview.dollars}
//                 </div>
//               )}
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={clearPending}
//                 className="px-4 py-2 rounded-xl border hover:bg-gray-50"
//               >
//                 Clear
//               </button>
//               <button
//                 onClick={confirmPending}
//                 disabled={submitting}
//                 className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
//               >
//                 {submitting ? 'Starting checkout…' : 'Confirm & Pay'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




// 'use client';

// import React, { useMemo, useState, useCallback } from 'react';
// import FullCalendar, {
//   DateSelectArg,
//   DateClickArg,
//   EventClickArg,
//   EventChangeArg,
//   EventInput,
// } from '@fullcalendar/react';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import api from '@/lib/api';
// import { useBookingEvents } from '@/hooks/useBookingEvents';
// import type { BookingEvent } from '@/types/calendar';

// const PRICE_PER_HOUR_CENTS = 3000; // UI-only display; backend is source of truth
// const PENDING_ID = '__pending__';

// export default function BookingCalendar() {
//   const { events: bookingEvents, isLoading, error, reload } = useBookingEvents();

//   // a temporary event the user can drag/resize before paying
//   const [pending, setPending] = useState<EventInput | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const allEvents = useMemo<EventInput[]>(
//     () => (pending ? [...bookingEvents, pending] : bookingEvents),
//     [bookingEvents, pending]
//   );

//   // build a pending event from timestamps
//   const createPending = useCallback((startISO: string, endISO: string) => {
//     setPending({
//       id: PENDING_ID,
//       title: 'Selected time',
//       start: startISO,
//       end: endISO,
//       color: '#60a5fa', // blue
//       editable: true,   // allow drag / resize
//       durationEditable: true,
//     });
//   }, []);

//   // drag-select → set pending (don’t pay yet)
//   const handleSelect = useCallback((sel: DateSelectArg) => {
//     createPending(sel.startStr, sel.endStr);
//   }, [createPending]);

//   // single click → 1 hour default
//   const handleDateClick = useCallback((info: DateClickArg) => {
//     const start = info.date;
//     const end = new Date(start.getTime() + 60 * 60 * 1000);
//     createPending(start.toISOString(), end.toISOString());
//   }, [createPending]);

//   // keep pending state in sync when user drags/resizes it
//   const handleEventChange = useCallback((arg: EventChangeArg) => {
//     if (arg.event.id !== PENDING_ID) return;
//     createPending(arg.event.start!.toISOString(), arg.event.end!.toISOString());
//   }, [createPending]);

//   // clicking real events = your existing flow
//   const handleEventClick = useCallback(async (arg: EventClickArg) => {
//     if (arg.event.id === PENDING_ID) return; // ignore pending block
//     const props = arg.event.extendedProps as BookingEvent['extendedProps'];
//     if (props.booked >= props.max) return window.alert('This session is full.');
//     if (!window.confirm(`Book this ${props.kind} for $${(props.price/100).toFixed(2)}?`)) return;

//     try {
//       if (props.price === 0) {
//         await api.post('/bookings', {
//           user_id: 1, // TODO: replace with real auth user
//           session_id: arg.event.id,
//           call_type: props.kind === 'class' ? 'zoom' : 'discord',
//         });
//         reload();
//         window.alert('Booked!');
//       } else {
//         const { data } = await api.post<{ stripe_checkout_url: string }>('/class/book', {
//           student_id: 1,
//           session_id: arg.event.id,
//         });
//         window.location.assign(data.stripe_checkout_url);
//       }
//     } catch (e: any) {
//       window.alert(`Booking failed: ${e?.response?.data?.detail || e.message}`);
//     }
//   }, [reload]);

//   const clearPending = useCallback(() => setPending(null), []);

//   const confirmPending = useCallback(async () => {
//     if (!pending?.start || !pending?.end) return;
//     setSubmitting(true);
//     try {
//       const { data } = await api.post<{ url: string }>('/create-checkout-session', {
//         start: pending.start,
//         end: pending.end,
//       });
//       window.location.assign(data.url);
//     } catch (e: any) {
//       window.alert(`Payment error: ${e?.response?.data?.detail || e.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   }, [pending]);

//   // price preview
//   const pricePreview = useMemo(() => {
//     if (!pending?.start || !pending?.end) return null;
//     const ms = new Date(pending.end).getTime() - new Date(pending.start).getTime();
//     const mins = Math.max(0, Math.round(ms / 60000));
//     const cents = Math.round((PRICE_PER_HOUR_CENTS * mins) / 60);
//     return { mins, cents, dollars: (cents / 100).toFixed(2) };
//   }, [pending]);

//   if (isLoading) return <div>Loading calendar…</div>;
//   if (error) return <div className="text-red-500">Failed to load calendar.</div>;

//   return (
//     <div className="p-4">
//       {/* Make the grid tall and uniform */}
//       <style jsx global>{`
//         /* ensure plenty of vertical room; FC uses this to compute row heights */
//         .fc .fc-timegrid-slot-lane { min-height: 84px !important; }
//       `}</style>

//       <div className="mx-auto max-w-6xl" style={{ height: '84vh' }}>
//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           initialView="timeGridWeek"
//           headerToolbar={{
//             left: 'prev,next today',
//             center: 'title',
//             right: 'dayGridMonth,timeGridWeek,timeGridDay',
//           }}
//           // KEY: allocate enough content height so rows aren’t squished
//           contentHeight={1300}
//           expandRows
//           // selection UX
//           selectable
//           selectMirror
//           unselectAuto={false}
//           selectLongPressDelay={50}
//           select={handleSelect}
//           dateClick={handleDateClick}
//           // events
//           events={allEvents}
//           eventClick={handleEventClick}
//           eventChange={handleEventChange}   // drag/resize pending selection
//           editable={true}                   // needed for pending drag/resize
//           eventDurationEditable={true}
//           eventStartEditable={true}
//           // time window + granularity
//           allDaySlot={false}
//           slotMinTime="06:00:00"
//           slotMaxTime="21:00:00"
//           slotDuration="01:00:00"
//           slotLabelInterval="01:00:00"
//           snapDuration="00:30:00"           // resize/move in 30 min steps
//           // styling/size
//           height="100%"
//         />
//       </div>

//       {/* Pending selection footer */}
//       {pending && pricePreview && (
//         <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl">
//           <div className="rounded-2xl border bg-white/95 shadow-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <div className="text-sm">
//               <div className="font-medium">
//                 {new Date(pending.start as string).toLocaleString()} &rarr;{' '}
//                 {new Date(pending.end as string).toLocaleString()}
//               </div>
//               <div className="text-gray-600">
//                 {pricePreview.mins} min • ${pricePreview.dollars}
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={clearPending}
//                 className="px-4 py-2 rounded-xl border hover:bg-gray-50"
//               >
//                 Clear
//               </button>
//               <button
//                 onClick={confirmPending}
//                 disabled={submitting}
//                 className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
//               >
//                 {submitting ? 'Starting checkout…' : 'Confirm & Pay'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




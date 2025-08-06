'use client';

import { useState, useCallback } from 'react';
import FullCalendar, { EventClickArg } from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '@/lib/api';
import { useBookingEvents } from '@/hooks/useBookingEvents';
import type { BookingEvent } from '@/types/calendar';

export default function BookingCalendar() {
  const { events, isLoading, error, reload } = useBookingEvents();
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const onEventClick = useCallback(
    async (arg: EventClickArg) => {
      if (bookingInProgress) return;
      const { id, price, max, booked, kind } = arg.event
        .extendedProps as BookingEvent['extendedProps'];

      if (booked >= max) {
        window.alert('This slot is fully booked.');
        return;
      }

      if (!window.confirm(`Book this ${kind} slot for $${price}?`)) return;

      try {
        setBookingInProgress(true);
        await api.post('/bookings', {
          session_id: id,
          call_type: kind === 'class' ? 'zoom' : 'discord',
        });
        window.alert('Booking successful ✅');
        reload();
      } catch (err) {
        console.error(err);
        window.alert('Booking failed. Please try again later.');
      } finally {
        setBookingInProgress(false);
      }
    },
    [bookingInProgress, reload]
  );

  if (isLoading) return <div>Loading calendar...</div>;
  if (error)
    return <div className="text-red-500">Failed to load calendar.</div>;

  return (
    <FullCalendar
      plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      allDaySlot={false}
      slotMinTime="06:00:00"
      slotMaxTime="22:00:00"
      events={events}
      eventClick={onEventClick}
      height="auto"
      hiddenDays={[]}
    />
  );
}




// 'use client';

// import { useState, useCallback, useRef } from 'react';
// import FullCalendar, { EventClickArg, EventContentArg } from '@fullcalendar/react';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import api from '@/lib/api';
// import { useBookingEvents } from '@/hooks/useBookingEvents';
// import type { BookingEvent } from '@/types/calendar';

// /**
//  * Render each event as a Tailwind-styled card with Framer Motion hover animation.
//  */
// function renderEventContent(arg: EventContentArg) {
//   const { title, start } = arg.event;
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       whileHover={{ scale: 1.02 }}
//       transition={{ duration: 0.2 }}
//       className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
//     >
//       <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
//         {title}
//       </div>
//       <div className="text-xs text-gray-500 dark:text-gray-400">
//         {new Intl.DateTimeFormat('en-US', {
//           hour: 'numeric',
//           minute: 'numeric',
//         }).format(start!)}
//       </div>
//     </motion.div>
//   );
// }

// export default function BookingCalendar() {
//   const { events, isLoading, error, reload } = useBookingEvents();
//   const [bookingInProgress, setBookingInProgress] = useState(false);
//   const calendarRef = useRef<FullCalendar>(null);
//   const [currentView, setCurrentView] = useState<string>('timeGridWeek');

//   const onEventClick = useCallback(
//     async (arg: EventClickArg) => {
//       if (bookingInProgress) return;
//       const { id, price, max, booked, kind } = arg.event
//         .extendedProps as BookingEvent['extendedProps'];

//       if (booked >= max) {
//         window.alert('This slot is fully booked.');
//         return;
//       }

//       if (!window.confirm(`Book this ${kind} slot for $${price}?`)) return;

//       try {
//         setBookingInProgress(true);
//         await api.post('/bookings', {
//           session_id: id,
//           call_type: kind === 'class' ? 'zoom' : 'discord',
//         });
//         window.alert('Booking successful ✅');
//         reload();
//       } catch (err) {
//         console.error(err);
//         window.alert('Booking failed. Please try again later.');
//       } finally {
//         setBookingInProgress(false);
//       }
//     },
//     [bookingInProgress, reload]
//   );

//   if (isLoading) return <div>Loading calendar...</div>;
//   if (error) return <div className="text-red-500">Failed to load calendar.</div>;

//   return (
//     <>
//       {/* Custom toolbar */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex space-x-2">
//           <Button size="sm" onClick={() => calendarRef.current?.getApi().prev()}>
//             ← Prev
//           </Button>
//           <Button size="sm" onClick={() => calendarRef.current?.getApi().today()}>
//             Today
//           </Button>
//           <Button size="sm" onClick={() => calendarRef.current?.getApi().next()}>
//             Next →
//           </Button>
//         </div>
//         <h2 className="text-xl font-semibold">{calendarRef.current?.getApi().view.title}</h2>
//       </div>

//       {/* Animated view transition wrapper */}
//       <AnimatePresence exitBeforeEnter>
//         <motion.div
//           key={currentView}
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -50 }}
//           transition={{ duration: 0.3 }}
//         >
//           <FullCalendar
//             ref={calendarRef}
//             plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
//             initialView="timeGridWeek"
//             headerToolbar={false}
//             eventContent={renderEventContent}
//             allDaySlot={false}
//             slotMinTime="06:00:00"
//             slotMaxTime="22:00:00"
//             events={events}
//             eventClick={onEventClick}
//             height="auto"
//             hiddenDays={[]}
//             viewDidMount={(info) => setCurrentView(info.view.type)}
//           />
//         </motion.div>
//       </AnimatePresence>
//     </>
//   );
// }



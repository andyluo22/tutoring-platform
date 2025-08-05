// File: frontend/src/components/dashboard/SessionCard.tsx
'use client';
import { motion } from 'framer-motion';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Session {
  title: string;
  date: string;
  time: string;
  link: string;
}

export default function SessionCard({ session }: { session: Session }) {
  return (
    <motion.div
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {session.title}
        </h2>
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {session.date}
        </span>
      </div>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{session.time}</p>
      <Button asChild className="mt-4">
        <a href={session.link} target="_blank" rel="noopener noreferrer">
          Join Session
        </a>
      </Button>
    </motion.div>
  );
}

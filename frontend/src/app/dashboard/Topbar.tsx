// File: frontend/src/components/dashboard/Topbar.tsx
'use client';
import { useAuth } from '@clerk/nextjs';
import { BellIcon, MenuIcon } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

// File: frontend/src/components/dashboard/Topbar.tsx
('use client');
import { useAuth } from '@clerk/nextjs';
import { BellIcon, MenuIcon } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

export default function Topbar({
  onMenuToggle,
}: {
  onMenuToggle?: () => void;
}) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-4 md:hidden">
        <button
          aria-label="Open menu"
          onClick={onMenuToggle}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Dashboard
        </h1>
      </div>
      <h1 className="hidden md:block text-xl font-semibold text-gray-800 dark:text-gray-100">
        Welcome, {user?.firstName || 'Student'}
      </h1>
      <div className="flex items-center space-x-4">
        <DarkModeToggle />
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-2 right-2 block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
            {user?.firstName?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

// File: frontend/src/components/dashboard/Sidebar.tsx
'use client';
import Link from 'next/link';
import { HomeIcon, CalendarIcon, UserIcon, CreditCardIcon } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Sessions', href: '/dashboard/sessions', icon: CalendarIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCardIcon },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r shadow-sm">
      <div className="p-6">
        <Link href="/dashboard" className="text-2xl font-bold">
          My Dashboard
        </Link>
      </div>
      <nav className="flex flex-col space-y-2 px-4">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {name}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

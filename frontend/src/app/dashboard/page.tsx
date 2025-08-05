// File: frontend/src/app/dashboard/page.tsx
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';
import ErrorBoundary from '@/components/dashboard/ErrorBoundary';

const SessionCard = dynamic(
  () => import('@/components/dashboard/SessionCard'),
  { loading: () => <LoadingSkeleton />, ssr: false }
);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardPage() {
  const { data: session, error } = useSWR('/api/next-session', fetcher);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg">
            <Sidebar />
          </div>
          <div
            className="flex-1"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
        </div>
      )}

      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onMenuToggle={() => setMenuOpen(open => !open)} />
        <main className="p-6 overflow-y-auto">
          <ErrorBoundary
            fallback={
              <div className="p-6 text-red-600">Failed to load session.</div>
            }
          >
            {!session && !error && <LoadingSkeleton />}
            {error && (
              <div className="p-6 text-red-600">Error loading session.</div>
            )}
            {session && <SessionCard session={session} />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

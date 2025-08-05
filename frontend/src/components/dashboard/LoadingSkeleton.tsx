// File: frontend/src/components/dashboard/LoadingSkeleton.tsx
'use client';
export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    </div>
  );
}

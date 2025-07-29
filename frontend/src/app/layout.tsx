'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Header } from '@/components/Header';
import Link from 'next/link';
import './globals.css';

function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <ClientOnly>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <main className="pt-24">{children}</main>
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  );
}

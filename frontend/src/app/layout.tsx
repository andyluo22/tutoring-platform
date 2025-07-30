'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
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
          <ClerkProvider
            frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API!}
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Header />
              <main className="pt-24">{children}</main>
            </ThemeProvider>
          </ClerkProvider>
        </ClientOnly>
      </body>
    </html>
  );
}

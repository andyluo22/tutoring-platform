import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
            <nav className="container mx-auto flex items-center justify-between py-4 px-4">
              <Link href="/" className="text-2xl font-bold">
                Andy&#39;s ClassRoom
              </Link>
              <div className="flex space-x-4">
                <a href="#features" className="hover:text-blue-600">
                  Features
                </a>
                <a href="#pricing" className="hover:text-blue-600">
                  Pricing
                </a>
                <a href="#contact" className="hover:text-blue-600">
                  Contact
                </a>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              </div>
            </nav>
          </header>
          <main className="pt-24">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

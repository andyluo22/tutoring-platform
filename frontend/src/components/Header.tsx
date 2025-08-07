'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import TwoDLogo from '@/components/TwoDLogo';
import ThreeLogo from '@/components/ThreeLogo';

export function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuItems = ['features', 'pricing', 'contact'];

  // If we landed with a hash (e.g. "/#pricing"), scroll to it on load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        // slight delay to ensure DOM is ready
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [pathname]);

  async function navigateToSection(id: string) {
    if (pathname !== '/') {
      // 1) navigate to home with hash
      await router.push(`/#${id}`);
    } else {
      // 2) already on home, update the URL hash without reloading
      window.history.replaceState(null, '', `/#${id}`);
    }
    // 3) then smooth-scroll
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  }

  return (
    <header className="fixed w-full z-50 bg-white/90 backdrop-blur-lg shadow">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <TwoDLogo sizeClass="text-3xl sm:text-4xl md:text-5xl" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          {menuItems.map(id => (
            <li key={id}>
              <button
                onClick={() => navigateToSection(id)}
                className="hover:text-blue-600"
              >
                {id.toUpperCase()}
              </button>
            </li>
          ))}
          <li>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-[#1B1447] hover:bg-[#2A1E6D] text-white rounded-lg transition-colors duration-200"
            >
              Dashboard
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white shadow-lg">
            <ul className="flex flex-col space-y-4 p-4">
              {menuItems.map(id => (
                <li key={id}>
                  <button
                    onClick={() => navigateToSection(id)}
                    className="block text-left w-full hover:text-blue-600"
                  >
                    {id.toUpperCase()}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

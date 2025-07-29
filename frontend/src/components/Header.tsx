// frontend/src/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [open, setOpen] = useState(false);
  const menuItems = ['features', 'pricing', 'contact'];

  return (
    <header className="fixed w-full z-50 bg-white/90 backdrop-blur-lg shadow">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold">
          Andy's Classroom
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          {menuItems.map(id => (
            <li key={id}>
              <a href={`#${id}`} className="hover:text-blue-600">
                {id.toUpperCase()}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  <a
                    href={`#${id}`}
                    className="block"
                    onClick={() => setOpen(false)}
                  >
                    {id.toUpperCase()}
                  </a>
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

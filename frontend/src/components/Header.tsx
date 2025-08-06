// frontend/src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

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
        <Link href="/" className="text-2xl font-bold">
          Luorn
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



// // frontend/src/components/Header.tsx
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { Menu, X } from 'lucide-react';

// export function Header() {
//   const [open, setOpen] = useState(false);
//   const menuItems = ['features', 'pricing', 'contact'];

//   return (
//     <header className="fixed w-full z-50 bg-white/90 backdrop-blur-lg shadow">
//       <nav className="container mx-auto flex items-center justify-between p-4">
//         <Link href="/" className="text-2xl font-bold">
//           Luorn
//         </Link>

//         {/* Desktop Menu */}
//         <ul className="hidden md:flex space-x-6">
//           {menuItems.map((id) => (
//             <li key={id}>
//               {/* Changed from `#${id}` to `/#${id}` */}
//               <a href={`/#${id}`} className="hover:text-blue-600">
//                 {id.toUpperCase()}
//               </a>
//             </li>
//           ))}
//           <li>
//             <Link
//               href="/dashboard"
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Dashboard
//             </Link>
//           </li>
//         </ul>

//         {/* Mobile toggle */}
//         <button
//           className="md:hidden p-2"
//           onClick={() => setOpen((o) => !o)}
//           aria-label="Toggle menu"
//         >
//           {open ? <X size={24} /> : <Menu size={24} />}
//         </button>

//         {/* Mobile Menu */}
//         {open && (
//           <div className="md:hidden bg-white shadow-lg">
//             <ul className="flex flex-col space-y-4 p-4">
//               {menuItems.map((id) => (
//                 <li key={id}>
//                   {/* And here too */}
//                   <a
//                     href={`/#${id}`}
//                     className="block"
//                     onClick={() => setOpen(false)}
//                   >
//                     {id.toUpperCase()}
//                   </a>
//                 </li>
//               ))}
//               <li>
//                 <Link
//                   href="/dashboard"
//                   className="block px-4 py-2 bg-blue-600 text-white rounded-lg"
//                   onClick={() => setOpen(false)}
//                 >
//                   Dashboard
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// }

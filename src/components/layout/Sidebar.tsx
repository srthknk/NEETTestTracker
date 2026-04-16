'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faChartLine,
  faFileAlt,
  faFlask,
  faSignOutAlt,
  faBars,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: faBook,
    },
    {
      name: 'Tests',
      href: '/dashboard/tests',
      icon: faFlask,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: faChartLine,
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: faFileAlt,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    router.push('/');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-black text-white rounded-sm hover:bg-gray-800 transition-colors active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-4 md:p-6 transition-all duration-300 transform z-40 ${
          isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full md:translate-x-0 md:shadow-none'
        }`}
      >
        {/* Logo */}
        <div className="mb-8 mt-14 md:mt-0">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <FontAwesomeIcon icon={faBook} className="text-2xl text-black" />
            <span className="text-lg md:text-xl font-semibold text-black truncate">RankForge</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 active:scale-95 ${
                isActive(item.href)
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all duration-200 font-medium"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        />
      )}
    </>
  );
}

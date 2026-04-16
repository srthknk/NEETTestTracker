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
import { useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    router.push('/');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="mb-8 mt-12 md:mt-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBook} className="text-2xl text-black" />
            <span className="text-xl font-semibold text-black">RankForge</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

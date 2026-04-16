'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="text-2xl font-semibold text-black mb-2">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 w-full md:ml-64 overflow-auto">
        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

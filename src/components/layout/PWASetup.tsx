'use client';

import { useEffect } from 'react';
import { registerServiceWorker, setupInstallPrompt } from '@/lib/pwa';

interface ServiceWorkerRegistrationExt extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
  };
}

export default function PWASetup() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Setup install prompt
    setupInstallPrompt();

    // Handle visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && 'serviceWorker' in navigator) {
        console.log('[PWA] App became visible, syncing...');
        navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistrationExt) => {
          if (registration.sync) {
            registration.sync.register('sync-tests').catch(() => {
              console.log('[PWA] Background sync not available');
            });
          }
        });
      }
    });
  }, []);

  return null;
}

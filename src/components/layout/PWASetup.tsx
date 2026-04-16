'use client';

import { useEffect } from 'react';
import { registerServiceWorker, setupInstallPrompt } from '@/lib/pwa';

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
        navigator.serviceWorker.ready.then((registration) => {
          if ('sync' in registration) {
            registration.sync.register('sync-tests');
          }
        });
      }
    });
  }, []);

  return null;
}

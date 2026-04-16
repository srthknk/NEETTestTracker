'use client';

export function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] Service Worker registered:', registration);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Listen for controller change (new SW ready)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Service Worker updated');
        });
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    });
  }
}

// Handle install prompt for "Add to Home Screen"
export function setupInstallPrompt() {
  if (typeof window === 'undefined') {
    return;
  }

  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    const event = e as BeforeInstallPromptEvent;
    event.preventDefault();
    deferredPrompt = event;
    console.log('[PWA] Install prompt ready');
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    deferredPrompt = null;
  });

  return () => deferredPrompt;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

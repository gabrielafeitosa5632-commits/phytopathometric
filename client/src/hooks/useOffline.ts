/**
 * PhytoPathometric — useOffline hook
 * Registers the Service Worker and exposes online/offline status
 */
import { useEffect, useState } from 'react';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [swRegistered, setSwRegistered] = useState(false);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          setSwRegistered(true);
          console.log('[SW] Registered:', reg.scope);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New version available');
              }
            });
          });
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    }
  }, []);

  // Track online/offline
  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { isOnline, swRegistered };
}

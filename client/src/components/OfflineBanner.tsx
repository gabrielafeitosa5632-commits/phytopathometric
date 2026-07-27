/**
 * PhytoPathometric — Offline Banner
 * Shows a smart banner when the user loses/regains connectivity
 * Hooks into the browser online/offline events
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, X } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showBack, setShowBack] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setShowBack(false);
      setDismissed(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowBack(true);
      setDismissed(false);
      // Auto-hide "back online" after 3s
      const t = setTimeout(() => setShowBack(false), 3000);
      return () => clearTimeout(t);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const showOffline = !isOnline && !dismissed;
  const showOnline  = isOnline && showBack;

  return (
    <AnimatePresence>
      {(showOffline || showOnline) && (
        <motion.div
          key={showOffline ? 'offline' : 'online'}
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 999,
              marginTop: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: showOffline
                ? 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
                : 'linear-gradient(135deg, #14532d, #166534)',
              border: showOffline ? '1px solid #444' : '1px solid #166534',
              maxWidth: 380,
              width: '100%',
            }}
          >
            {showOffline ? (
              <WifiOff size={15} style={{ color: '#f97316', flexShrink: 0 }} />
            ) : (
              <Wifi size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 12,
                fontWeight: 700,
                color: showOffline ? '#f97316' : '#4ade80',
                lineHeight: 1.2,
              }}>
                {showOffline ? 'You\'re offline' : 'Back online!'}
              </p>
              <p style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.65)',
                marginTop: 1,
              }}>
                {showOffline
                  ? 'App works offline · AI analysis needs internet'
                  : 'Connection restored · AI analysis available'}
              </p>
            </div>

            {showOffline && (
              <button
                onClick={() => setDismissed(true)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={11} color="rgba(255,255,255,0.7)" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

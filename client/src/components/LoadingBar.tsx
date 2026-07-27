/**
 * PhytoPathometric — Global Animated Loading Bar
 * Top-of-screen progress bar that triggers during tab switches & analysis
 * Uses framer-motion for smooth shimmer + fill animation
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from '@/lib/framer-safe';

interface LoadingBarProps {
  loading: boolean;
  color?: string;
}

export function LoadingBar({ loading, color = 'oklch(0.58 0.20 155)' }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;

    if (loading) {
      setVisible(true);
      setProgress(0);

      // Simulate realistic loading: fast to 70%, then slow
      const steps = [
        { target: 30,  delay: 80  },
        { target: 55,  delay: 180 },
        { target: 70,  delay: 300 },
        { target: 82,  delay: 500 },
        { target: 90,  delay: 800 },
        { target: 94,  delay: 1200 },
      ];

      let i = 0;
      const tick = () => {
        if (i < steps.length) {
          timeout = setTimeout(() => {
            setProgress(steps[i].target);
            i++;
            tick();
          }, steps[i].delay);
        }
      };
      tick();
    } else {
      // Complete the bar on finish
      setProgress(100);
      timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 450);
    }

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [loading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {/* Track */}
          <div style={{ position: 'absolute', inset: 0, background: `${color}22` }} />

          {/* Fill */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              background: `linear-gradient(90deg, ${color}, oklch(0.75 0.22 155), ${color})`,
              boxShadow: `0 0 10px ${color}, 0 0 20px ${color}80`,
              borderRadius: '0 2px 2px 0',
            }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: progress === 100 ? 0.25 : 0.6,
              ease: progress === 100 ? 'easeOut' : [0.4, 0, 0.2, 1],
            }}
          />

          {/* Shimmer overlay */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '40%',
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)`,
              borderRadius: '0 2px 2px 0',
            }}
            animate={{ x: ['−100%', '350%'] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 0.3,
            }}
          />

          {/* Glow dot at tip */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'white',
              boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
            }}
            animate={{ left: `calc(${progress}% - 3px)` }}
            transition={{
              duration: progress === 100 ? 0.25 : 0.6,
              ease: progress === 100 ? 'easeOut' : [0.4, 0, 0.2, 1],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

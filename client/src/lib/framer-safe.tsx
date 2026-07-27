/**
 * Safe re-exports from framer-motion
 * AnimatePresence replaced with React 19 compatible wrapper
 * Import from this file instead of 'framer-motion' for AnimatePresence
 */
export { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';

import React from 'react';

// Drop-in replacement — no DOM insertBefore manipulation
export function AnimatePresence({
  children,
}: {
  children?: React.ReactNode;
  mode?: 'sync' | 'popLayout' | 'wait';
  initial?: boolean;
  custom?: unknown;
  onExitComplete?: () => void;
}) {
  return <>{children}</>;
}

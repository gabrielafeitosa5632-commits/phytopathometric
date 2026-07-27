/**
 * framer-motion React 19 compatibility shim
 * Replaces AnimatePresence with a safe wrapper that doesn't cause
 * "insertBefore" crashes when conditionally rendering children
 */
import React from 'react';

// Safe AnimatePresence — just renders children directly, no DOM manipulation
export function AnimatePresence({
  children,
}: {
  children?: React.ReactNode;
  mode?: string;
  initial?: boolean;
  custom?: unknown;
}) {
  return <>{children}</>;
}

// Re-export as SafeAnimatePresence for backward compat
export { AnimatePresence as SafeAnimatePresence };

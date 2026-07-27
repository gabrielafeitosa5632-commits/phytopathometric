/**
 * framer-motion React 19 compatibility shim v2
 * Replaces AnimatePresence with a safe wrapper — no insertBefore crashes
 */
import React from 'react';

export function AnimatePresence({
  children,
}: {
  children?: React.ReactNode;
  mode?: string;
  initial?: boolean;
  custom?: unknown;
  onExitComplete?: () => void;
}) {
  return <>{children}</>;
}

export { AnimatePresence as SafeAnimatePresence };

/**
 * framer-motion patch — React 19 safe
 * Re-exports everything from real framer-motion
 * but replaces AnimatePresence with a safe no-op wrapper
 */
export * from 'framer-motion';
export { AnimatePresence } from './motion-compat';

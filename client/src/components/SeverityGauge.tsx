/**
 * PhytoPathometric — SeverityGauge Component
 * Circular gauge showing severity percentage with color coding
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 */
import { SeverityLevel, severityConfig } from '@/contexts/AnalysisContext';
import { motion } from 'framer-motion';

interface SeverityGaugeProps {
  value: number;
  level: SeverityLevel;
  size?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export function SeverityGauge({
  value,
  level,
  size = 160,
  showLabel = true,
  animated = true,
}: SeverityGaugeProps) {
  const config = severityConfig[level];
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            className="text-border"
          />
          {/* Progress arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : undefined}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display font-bold leading-none"
            style={{ color: config.color, fontSize: size * 0.22 }}
            initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {value.toFixed(1)}%
          </motion.span>
          <span
            className="font-body font-medium mt-1"
            style={{ color: config.textColor, fontSize: size * 0.1 }}
          >
            Severidade
          </span>
        </div>
      </div>
      {showLabel && (
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: config.bgColor,
            color: config.textColor,
            border: `1px solid ${config.borderColor}`,
          }}
          initial={animated ? { opacity: 0, y: 8 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.color }}
          />
          {config.label} — {config.range}
        </motion.div>
      )}
    </div>
  );
}

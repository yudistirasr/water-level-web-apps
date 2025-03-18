import { motion } from 'framer-motion';

export default function WaterLevelGauge({ value, size = 200 }) {
  const percentage = value;
  const circleCircumference = 2 * Math.PI * 45;
  const strokeDashoffset = circleCircumference - (percentage / 100) * circleCircumference;

  const getGradientColors = (value) => {
    if (value > 80) return ['#ef4444', '#dc2626']; // Red
    if (value > 60) return ['#f59e0b', '#d97706']; // Amber
    return ['#10b981', '#059669']; // Emerald
  };

  const [gradientStart, gradientEnd] = getGradientColors(percentage);

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Background glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Track with subtle gradient */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#trackGradient)"
          strokeWidth="10"
          opacity="0.2"
        />

        {/* Progress circle with dynamic gradient and glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={`url(#progressGradient)`}
          strokeWidth="10"
          strokeDasharray={circleCircumference}
          initial={{ strokeDashoffset: circleCircumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          filter="url(#glow)"
          strokeLinecap="round"
        />

        {/* Gradients definitions */}
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
      </svg>

      {/* Centered text with animation */}
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          {percentage}%
        </span>
        <span className="text-sm text-blue-200 mt-1 opacity-80">
          {(percentage * 0.1).toFixed(1)}m
        </span>
      </motion.div>
    </motion.div>
  );
}

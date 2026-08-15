import { motion, useReducedMotion } from "motion/react";

export function ProgressFill({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const progress = Math.max(0, Math.min(1, value));
  return (
    <motion.span
      initial={false}
      animate={{ transform: `scaleX(${progress})` }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
    />
  );
}

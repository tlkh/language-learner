import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PropsWithChildren } from "react";

export function RouteTransition({ routeKey, children }: PropsWithChildren<{ routeKey: string }>) {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(3px)" };
  const settled = { opacity: 1, transform: "translateY(0px)" };
  const exit = reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(-2px)" };

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        className="route-stage"
        key={routeKey}
        initial={enter}
        animate={settled}
        exit={exit}
        transition={reduceMotion ? { duration: 0.1 } : { duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

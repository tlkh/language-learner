import { Download, RefreshCw, WifiOff, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePwaState } from "../pwa/PwaState";

export function PwaNotice() {
  const { needRefresh, update, dismissUpdate, online, offlineReady } = usePwaState();
  const reduceMotion = useReducedMotion();
  const content = needRefresh ? (
      <motion.aside
        key="update"
        className="notice"
        role="status"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px)" }}
        transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.23, 1, 0.32, 1] }}
      >
        <RefreshCw aria-hidden="true" />
        <p><strong>Update ready.</strong> Apply it when you are ready.</p>
        <button className="button button--small" type="button" onClick={update}>Update</button>
        <button className="icon-button" type="button" onClick={dismissUpdate} aria-label="Dismiss update">
          <X aria-hidden="true" />
        </button>
      </motion.aside>
    ) : !online && !offlineReady ? (
      <motion.aside
        key="offline-warning"
        className="notice notice--warning"
        role="status"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px)" }}
        transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.23, 1, 0.32, 1] }}
      >
        <WifiOff aria-hidden="true" />
        <p>Offline setup did not finish. Reconnect once to cache the complete app.</p>
      </motion.aside>
    ) : null;
  return <AnimatePresence>{content}</AnimatePresence>;
}

export function OfflineBadge() {
  const { offlineReady, online } = usePwaState();
  const label = offlineReady ? (online ? "Ready offline" : "Working offline") : "Caching app";
  const [shortLabel, detail] = label.split(" ", 2);
  return (
    <span className={`offline-badge${offlineReady ? " is-ready" : ""}`} aria-label={label}>
      {offlineReady ? <Download aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
      <span aria-hidden="true">{shortLabel}<span className="offline-badge__detail"> {detail}</span></span>
    </span>
  );
}

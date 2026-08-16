import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { X } from "lucide-react";

interface BottomSheetProps extends PropsWithChildren {
  open: boolean;
  title: string;
  onClose: () => void;
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.dialog
          ref={dialogRef}
          className="bottom-sheet"
          aria-labelledby="sheet-title"
          initial={reduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0.84 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0.72 }}
          transformTemplate={(_, generated) => generated.replace(/translateY\(([^)]+)\)/g, "translate3d(0, $1, 0)")}
          transition={reduceMotion ? { duration: 0.12 } : { type: "spring", stiffness: 400, damping: 40, mass: 1 }}
          drag={reduceMotion ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.04, bottom: 0.42 }}
          dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 96 || info.velocity.y > 620) onClose();
          }}
          onCancel={(event) => {
            event.preventDefault();
            onClose();
          }}
          onClick={(event) => {
            if (event.target === dialogRef.current) onClose();
          }}
        >
          <div className="bottom-sheet__handle" aria-hidden="true" />
          <header className="bottom-sheet__header">
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close sheet">
              <X aria-hidden="true" />
            </button>
            <h2 id="sheet-title">{title}</h2>
          </header>
          <div className="bottom-sheet__content">{children}</div>
        </motion.dialog>
      ) : null}
    </AnimatePresence>
  );
}

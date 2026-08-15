import { Info, X } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, MODULAR_PROGRESS_RESET_KEY } from "../storage/db";

export function ProgressResetNotice() {
  const pending = useLiveQuery(() => db.preferences.get(MODULAR_PROGRESS_RESET_KEY), []);
  if (!pending) return null;
  return (
    <aside className="notice notice--info" role="status">
      <Info aria-hidden="true" />
      <p><strong>Language packs were upgraded.</strong> Learning progress starts fresh in the new language-scoped format.</p>
      <button
        className="icon-button"
        type="button"
        aria-label="Dismiss progress reset notice"
        onClick={() => void db.preferences.delete(MODULAR_PROGRESS_RESET_KEY)}
      >
        <X aria-hidden="true" />
      </button>
    </aside>
  );
}

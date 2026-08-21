import { Info, X } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, JAPANESE_CONTENT_RESET_KEY, MODULAR_PROGRESS_RESET_KEY } from "../storage/db";

export function ProgressResetNotice() {
  const pending = useLiveQuery(async () => (await db.preferences.get(JAPANESE_CONTENT_RESET_KEY)) ?? (await db.preferences.get(MODULAR_PROGRESS_RESET_KEY)), []);
  if (!pending) return null;
  return (
    <aside className="notice notice--info" role="status">
      <Info aria-hidden="true" />
      <p>{pending.key === JAPANESE_CONTENT_RESET_KEY ? <><strong>Japanese was rebuilt for beginners.</strong> Japanese study, checkpoint, and kana progress starts fresh; your other languages are unchanged.</> : <><strong>Language packs were upgraded.</strong> Learning progress starts fresh in the new language-scoped format.</>}</p>
      <button
        className="icon-button"
        type="button"
        aria-label="Dismiss progress reset notice"
        onClick={() => void db.preferences.delete(pending.key)}
      >
        <X aria-hidden="true" />
      </button>
    </aside>
  );
}

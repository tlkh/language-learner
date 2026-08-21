import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import { usePwaState } from "../pwa/PwaState";

export function MandatoryUpdateGate({ children }: PropsWithChildren) {
  const location = useLocation();
  const { checkForUpdate, needRefresh, online, update } = usePwaState();
  const [updating, setUpdating] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(true);
  const [checkFailed, setCheckFailed] = useState(false);

  const runUpdateCheck = useCallback(async () => {
    setCheckingUpdate(true);
    setCheckFailed(false);
    try {
      await checkForUpdate();
    } catch {
      setCheckFailed(true);
    } finally {
      setCheckingUpdate(false);
    }
  }, [checkForUpdate]);

  const updateCheckKey = location.pathname === "/" ? location.key : "app";

  useEffect(() => {
    void runUpdateCheck();
  }, [runUpdateCheck, updateCheckKey]);

  const applyRequiredUpdate = async () => {
    setUpdating(true);
    setUpdateFailed(false);
    try {
      await update();
    } catch {
      setUpdating(false);
      setUpdateFailed(true);
    }
  };

  if (checkingUpdate) {
    return (
      <main className="language-selector-page language-selector-page--update" id="main-content">
        <section className="required-update" role="status" aria-labelledby="update-check-title">
          <span className="required-update__mark"><RefreshCw className="is-spinning" aria-hidden="true" /></span>
          <p className="quiet-label">Version check</p>
          <h1 id="update-check-title">Checking for updates</h1>
          <p>The app will open as soon as the installed lessons are verified.</p>
        </section>
      </main>
    );
  }

  if (checkFailed && online && !needRefresh) {
    return (
      <main className="language-selector-page language-selector-page--update" id="main-content">
        <section className="required-update" role="alert" aria-labelledby="update-check-failed-title">
          <span className="required-update__mark"><RefreshCw aria-hidden="true" /></span>
          <p className="quiet-label">Update check required</p>
          <h1 id="update-check-failed-title">Couldn’t verify this version</h1>
          <p>Check your connection and retry before continuing.</p>
          <button className="button" type="button" onClick={() => void runUpdateCheck()}><RefreshCw aria-hidden="true" /> Check again</button>
        </section>
      </main>
    );
  }

  if (needRefresh) {
    return (
      <main className="language-selector-page language-selector-page--update" id="main-content">
        <section className="required-update" role="alert" aria-labelledby="required-update-title">
          <span className="required-update__mark"><RefreshCw className={updating ? "is-spinning" : undefined} aria-hidden="true" /></span>
          <p className="quiet-label">Required update</p>
          <h1 id="required-update-title">A new version is ready</h1>
          <p>Update before continuing so lessons and cached files stay in sync on this device.</p>
          <button
            className="button"
            type="button"
            aria-busy={updating}
            data-state={updateFailed ? "error" : undefined}
            disabled={updating}
            onClick={() => void applyRequiredUpdate()}
          >
            <RefreshCw aria-hidden="true" /> {updating ? "Updating…" : updateFailed ? "Try update again" : "Update and continue"}
          </button>
          {updateFailed ? <p className="inline-status is-error" role="status">The update could not be applied. Check your connection and try again.</p> : null}
        </section>
      </main>
    );
  }

  return children;
}

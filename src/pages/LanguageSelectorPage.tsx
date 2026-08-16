import { ArrowRight, Languages, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { languageCatalog } from "../languages";
import { usePwaState } from "../pwa/PwaState";

export function LanguageSelectorPage() {
  const [searchParams] = useSearchParams();
  const { checkForUpdate, needRefresh, online, update } = usePwaState();
  const [updating, setUpdating] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(true);
  const [checkFailed, setCheckFailed] = useState(false);
  const unknown = searchParams.get("unknown");
  const failed = searchParams.get("error");
  const lastLanguage = localStorage.getItem("ll-last-language");

  useEffect(() => {
    let cancelled = false;
    void checkForUpdate()
      .then(() => {
        if (!cancelled) setCheckingUpdate(false);
      })
      .catch(() => {
        if (!cancelled) {
          setCheckingUpdate(false);
          setCheckFailed(true);
        }
      });
    return () => { cancelled = true; };
  }, [checkForUpdate]);

  const retryUpdateCheck = async () => {
    setCheckingUpdate(true);
    setCheckFailed(false);
    try {
      await checkForUpdate();
    } catch {
      setCheckFailed(true);
    } finally {
      setCheckingUpdate(false);
    }
  };

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
          <p>Language selection will open as soon as the installed lessons are verified.</p>
        </section>
      </main>
    );
  }

  if (checkFailed && online) {
    return (
      <main className="language-selector-page language-selector-page--update" id="main-content">
        <section className="required-update" role="alert" aria-labelledby="update-check-failed-title">
          <span className="required-update__mark"><RefreshCw aria-hidden="true" /></span>
          <p className="quiet-label">Update check required</p>
          <h1 id="update-check-failed-title">Couldn’t verify this version</h1>
          <p>Check your connection and retry before choosing a language.</p>
          <button className="button" type="button" onClick={() => void retryUpdateCheck()}><RefreshCw aria-hidden="true" /> Check again</button>
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
          <p>Update before choosing a language so lessons and cached files stay in sync on this device.</p>
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

  return (
    <main className="language-selector-page" id="main-content">
      <header className="language-selector-hero">
        <span className="language-selector-mark"><Languages aria-hidden="true" /></span>
        <p className="quiet-label">Language Learner</p>
        <h1>Choose what you’re learning</h1>
        <p>Each language keeps its curriculum, character practice, and progress separate on this device.</p>
      </header>

      {unknown ? <p className="inline-status is-error">“{unknown}” is not an installed language pack.</p> : null}
      {failed ? <p className="inline-status is-error">The {failed} language pack could not be loaded.</p> : null}
      {checkFailed ? <p className="inline-status">Offline: using the latest version already saved on this device.</p> : null}

      <section className="language-card-grid" aria-label="Installed language packs">
        {languageCatalog.map((language) => (
          <Link className="language-card" to={`/${language.code}/learn`} key={language.code} lang={language.locale}>
            <span className="language-card__mark">{language.mark}</span>
            <span className="language-card__copy">
              <strong>{language.nativeName}</strong>
              <small lang="en">{language.name}{lastLanguage === language.code ? " · Last opened" : ""}</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
      </section>

      <p className="language-selector-note">Installed packs work offline after the app has finished caching.</p>
    </main>
  );
}

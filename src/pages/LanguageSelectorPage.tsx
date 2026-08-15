import { ArrowRight, Languages } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { languageCatalog } from "../languages";

export function LanguageSelectorPage() {
  const [searchParams] = useSearchParams();
  const unknown = searchParams.get("unknown");
  const failed = searchParams.get("error");
  const lastLanguage = localStorage.getItem("ll-last-language");

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

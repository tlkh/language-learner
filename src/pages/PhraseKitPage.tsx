import { ArrowLeft, Play } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { getVocabularyForm } from "../languages";
import { useLanguagePack } from "../languages/LanguagePackContext";

export function PhraseKitPage() {
  const { pack, variantId } = useLanguagePack();
  const base = `/${pack.code}`;
  const phraseSet = pack.sharedVocabularySets[0];
  if (!phraseSet) return <Navigate to={`${base}/topics`} replace />;
  const entries = new Map(phraseSet.vocabulary.map((entry) => [entry.id, entry]));

  return (
    <div className="page phrase-kit-page">
      <ScreenHeader
        title={phraseSet.title}
        description={phraseSet.description}
        actions={<Link className="icon-button" to={`${base}/topics`} aria-label="Back to topics"><ArrowLeft aria-hidden="true" /></Link>}
      >
        <div className="topic-stats"><span>{phraseSet.vocabulary.length} shared phrases</span><span>One mastery record per language</span></div>
      </ScreenHeader>
      <p className="topic-guidance" role="note">These phrases appear inside topic checkpoints, but progress is recorded only once within this language pack.</p>
      <section className="phrase-study-callout" aria-labelledby="phrase-study-title">
        <div>
          <h2 id="phrase-study-title">Practice the essentials</h2>
          <p>Start with a short active-recall round. The complete phrase kit remains available to browse at your own pace.</p>
        </div>
        <div className="study-action-group">
          <Link className="button" to={`${base}/phrases/study?mode=focus`}><Play aria-hidden="true" /> Quick study · {Math.min(phraseSet.vocabulary.length, 12)}</Link>
          <Link className="text-link" to={`${base}/phrases/study?mode=all`}>Browse all {phraseSet.vocabulary.length}</Link>
        </div>
      </section>
      <div className="phrase-groups">
        {phraseSet.groups.map((group) => (
          <section className="phrase-group" key={group.id}>
            <div className="section-heading"><div><h2>{group.title}</h2><p>{group.description}</p></div></div>
            <ul className="vocabulary-list">
              {group.entryIds.map((entryId) => entries.get(entryId)).filter(Boolean).map((entry) => {
                if (!entry) return null;
                const form = getVocabularyForm(entry, variantId);
                const target = form.representations.target;
                const reading = form.representations.reading;
                return (
                  <li key={entry.id}>
                    <div className="vocabulary-list__japanese"><strong lang={pack.locale}>{target}</strong>{reading && reading !== target ? <span lang={pack.locale}>{reading}</span> : null}</div>
                    <div className="vocabulary-list__meaning"><span>{entry.meanings.join(" · ")}</span>{form.representations.romanization ? <small>{form.representations.romanization}</small> : null}</div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { japanesePack } from "../content";
import { formFor } from "../content/helpers";
import { useAppState } from "../state/AppState";

const groups = [
  { title: "Politeness & repair", description: "Keep an interaction comfortable when you need help.", start: 0, end: 11 },
  { title: "Questions & pointers", description: "Ask about people, places, choices, and things around you.", start: 11, end: 22 },
  { title: "Time & simple counts", description: "Handle immediate plans and basic quantities.", start: 22, end: 29 },
  { title: "Places & direction", description: "Find entrances, exits, and the right way forward.", start: 29, end: 40 }
];

export function PhraseKitPage() {
  const { register } = useAppState();
  const phraseSet = japanesePack.sharedVocabularySets[0];

  return (
    <div className="page phrase-kit-page">
      <ScreenHeader
        title={phraseSet.title}
        description={phraseSet.description}
        actions={<Link className="icon-button" to="/topics" aria-label="Back to topics"><ArrowLeft aria-hidden="true" /></Link>}
      >
        <div className="topic-stats"><span>{phraseSet.vocabulary.length} shared phrases</span><span>One mastery record</span></div>
      </ScreenHeader>
      <p className="topic-guidance" role="note">These phrases appear inside every topic checkpoint, but progress is recorded only once across the whole app.</p>
      <div className="phrase-groups">
        {groups.map((group) => (
          <section className="phrase-group" key={group.title}>
            <div className="section-heading"><div><h2>{group.title}</h2><p>{group.description}</p></div></div>
            <ul className="vocabulary-list">
              {phraseSet.vocabulary.slice(group.start, group.end).map((entry) => {
                const form = formFor(entry, register);
                return (
                  <li key={entry.id}>
                    <div className="vocabulary-list__japanese"><strong lang="ja">{form.kanji ?? form.kana}</strong>{form.kanji ? <span lang="ja">{form.kana}</span> : null}</div>
                    <div className="vocabulary-list__meaning"><span>{entry.meanings.join(" · ")}</span><small>{form.romaji}</small></div>
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

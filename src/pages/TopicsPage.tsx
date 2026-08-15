import { useLiveQuery } from "dexie-react-hooks";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { ProgressFill } from "../components/ProgressFill";
import { japanesePack } from "../content";
import { db } from "../storage/db";

export function TopicsPage() {
  const [query, setQuery] = useState("");
  const progress = useLiveQuery(() => db.tierProgress.toArray(), []) ?? [];
  const passed = useMemo(() => {
    const map = new Map<string, number>();
    progress.filter((tier) => tier.passed).forEach((tier) => map.set(tier.topicId, (map.get(tier.topicId) ?? 0) + 1));
    return map;
  }, [progress]);
  const filtered = useMemo(() => {
    const normalized = query.normalize("NFKC").trim().toLocaleLowerCase("en");
    if (!normalized) return japanesePack.topics;
    return japanesePack.topics.filter(
      (topic) =>
        topic.title.toLocaleLowerCase("en").includes(normalized) ||
        topic.description.toLocaleLowerCase("en").includes(normalized) ||
        topic.scenes.some((scene) => scene.title.toLocaleLowerCase("en").includes(normalized) || scene.description.toLocaleLowerCase("en").includes(normalized)) ||
        topic.vocabulary.some((entry) =>
          entry.meanings.some((meaning) => meaning.toLocaleLowerCase("en").includes(normalized)) ||
          entry.sharedForm.kana.includes(normalized) ||
          entry.sharedForm.kanji?.includes(normalized)
        )
    );
  }, [query]);

  return (
    <div className="page">
      <ScreenHeader title="Topics" description={`${japanesePack.topics.length} practical situations. Start anywhere; difficulty progresses inside each topic.`} />
      <label className="search-field">
        <span className="sr-only">Search topics and vocabulary</span>
        <Search aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics or vocabulary" />
      </label>
      {filtered.length ? (
        japanesePack.collections.map((collection) => {
          const items = collection.topicIds.map((id) => filtered.find((topic) => topic.id === id)).filter(Boolean);
          if (!items.length) return null;
          return (
            <section className={`topic-section ${collection.pinned ? "topic-section--pinned" : ""}`} key={collection.id}>
              <div className="collection-heading">
                <div><h2>{collection.title}</h2><p>{collection.description}</p></div>
                {collection.pinned ? <span className="collection-badge">Safety kit</span> : null}
                {collection.optional ? <span className="collection-badge collection-badge--quiet">Optional</span> : null}
              </div>
              <div className="topic-grid">
                {collection.phraseSetIds?.length && !query ? (
                  <Link className="topic-card topic-card--phrase-kit" to="/phrases">
                    <div className="topic-card__meta"><span>40 shared phrases</span><span>Master once</span></div>
                    <h3>Essential Phrase Kit</h3>
                    <p>Politeness, clarification, questions, numbers, and finding your way.</p>
                    <span className="topic-card__aside">Always available</span>
                  </Link>
                ) : null}
                {items.map((topic, index) => {
                  if (!topic) return null;
                  const completed = passed.get(topic.id) ?? 0;
                  const domainCount = topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length;
                  return (
                    <Link className={`topic-card topic-card--${index % 3}`} to={`/topic/${topic.id}`} key={topic.id}>
                      <div className="topic-card__meta">
                        <span>{domainCount} topic words + essentials</span>
                        <span>{topic.scenes.length} scenes</span>
                      </div>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                      <div className="topic-card__progress">
                        <span><strong>{completed}</strong> / 4 tiers</span>
                        <span className="progress-track" aria-hidden="true"><ProgressFill value={completed / 4} /></span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <section className="empty-state">
          <Search aria-hidden="true" />
          <h2>No matching topic</h2>
          <p>Try a broader word such as “ticket,” “weather,” or “hotel.”</p>
          <button className="button button--secondary" type="button" onClick={() => setQuery("")}>Clear search</button>
        </section>
      )}
    </div>
  );
}

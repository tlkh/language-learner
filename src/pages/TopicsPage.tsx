import { useLiveQuery } from "dexie-react-hooks";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProgressFill } from "../components/ProgressFill";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { db } from "../storage/db";

export function TopicsPage() {
  const { pack, variantId } = useLanguagePack();
  const base = `/${pack.code}`;
  const [query, setQuery] = useState("");
  const progress = useLiveQuery(() => db.tierProgress.where("languageCode").equals(pack.code).toArray(), [pack.code]) ?? [];
  const passed = useMemo(() => {
    const map = new Map<string, number>();
    progress.filter((tier) => tier.passed && tier.variantId === variantId).forEach((tier) => map.set(tier.topicId, (map.get(tier.topicId) ?? 0) + 1));
    return map;
  }, [progress, variantId]);
  const filtered = useMemo(() => {
    const normalized = pack.searchNormalizer(query);
    if (!normalized) return pack.topics;
    return pack.topics.filter((topic) => {
      const searchable = [
        topic.title,
        topic.description,
        ...topic.scenes.flatMap((scene) => [scene.title, scene.description]),
        ...topic.vocabulary.flatMap((entry) => [
          ...entry.meanings,
          ...Object.values(entry.baseForm.representations),
          ...Object.values(entry.baseForm.aliases).flatMap((values) => values ?? [])
        ])
      ];
      return searchable.some((value) => pack.searchNormalizer(value).includes(normalized));
    });
  }, [pack, query]);

  return (
    <div className="page">
      <ScreenHeader title="Topics" description={`${pack.topics.length} practical situations. Start anywhere; difficulty progresses inside each topic.`} />
      <label className="search-field">
        <span className="sr-only">Search topics and vocabulary</span>
        <Search aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics or vocabulary" />
      </label>
      {filtered.length ? (
        pack.collections.map((collection) => {
          const items = collection.topicIds.map((id) => filtered.find((topic) => topic.id === id)).filter(Boolean);
          if (!items.length) return null;
          const featured = collection.presentation === "featured";
          return (
            <section className={`topic-section ${featured ? "topic-section--pinned" : ""}`} key={collection.id}>
              <div className="collection-heading">
                <div><h2>{collection.title}</h2><p>{collection.description}</p></div>
                {featured ? <span className="collection-badge">Featured</span> : null}
                {collection.presentation === "optional" ? <span className="collection-badge collection-badge--quiet">Optional</span> : null}
              </div>
              <div className="topic-grid">
                {collection.phraseSetIds?.length && !query ? pack.sharedVocabularySets.filter((set) => collection.phraseSetIds?.includes(set.id)).map((set) => (
                  <Link className="topic-card topic-card--phrase-kit" to={`${base}/phrases`} key={set.id}>
                    <div className="topic-card__meta"><span>{set.vocabulary.length} shared phrases</span><span>Master once</span></div>
                    <h3>{set.title}</h3><p>{set.description}</p><span className="topic-card__aside">Always available</span>
                  </Link>
                )) : null}
                {items.map((topic, index) => {
                  if (!topic) return null;
                  const completed = passed.get(topic.id) ?? 0;
                  const domainCount = topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length;
                  return (
                    <Link className={`topic-card topic-card--${index % 3}`} to={`${base}/topic/${topic.id}`} key={topic.id}>
                      <div className="topic-card__meta"><span>{domainCount} topic words + essentials</span><span>{topic.scenes.length} scenes</span></div>
                      <h3>{topic.title}</h3><p>{topic.description}</p>
                      <div className="topic-card__progress">
                        <span><strong>{completed}</strong> / {topic.quizTierIds.length} tiers</span>
                        <span className="progress-track" aria-hidden="true"><ProgressFill value={completed / topic.quizTierIds.length} /></span>
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
          <Search aria-hidden="true" /><h2>No matching topic</h2><p>Try a broader search term.</p>
          <button className="button button--secondary" type="button" onClick={() => setQuery("")}>Clear search</button>
        </section>
      )}
    </div>
  );
}

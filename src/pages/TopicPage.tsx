import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Play, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { topicById } from "../content";
import { formFor } from "../content/helpers";
import type { VocabularyPriority } from "../content/types";
import { PASS_SCORE } from "../quiz/engine";
import { tierMeta, tierOrder } from "../quiz/meta";
import { useAppState } from "../state/AppState";
import { db, type TierProgressRecord } from "../storage/db";

type PriorityFilter = "all" | VocabularyPriority;

const priorityLabels: Record<VocabularyPriority, string> = {
  "must-know": "Must know",
  useful: "Useful",
  reference: "Reference"
};

export function TopicPage() {
  const { topicId, sceneId } = useParams();
  const topic = topicId ? topicById.get(topicId) : undefined;
  const selectedScene = sceneId ? topic?.scenes.find((scene) => scene.id === sceneId) : undefined;
  const { register } = useAppState();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const progress = useLiveQuery<TierProgressRecord[]>(async () => {
    if (!topic) return [];
    return db.tierProgress.where("topicId").equals(topic.id).toArray();
  }, [topic?.id]) ?? [];

  useEffect(() => {
    setQuery("");
    setPriority("all");
    setShowAll(false);
  }, [sceneId]);

  const progressByTier = new Map(progress.map((item) => [item.tier, item]));
  const domainVocabulary = useMemo(() => topic?.vocabulary.filter((entry) => entry.tags.includes("domain")) ?? [], [topic]);
  const scopedVocabulary = useMemo(() => selectedScene
    ? domainVocabulary.filter((entry) => entry.primarySceneId === selectedScene.id)
    : domainVocabulary, [domainVocabulary, selectedScene]);
  const filteredVocabulary = useMemo(() => {
    const normalized = query.normalize("NFKC").trim().toLocaleLowerCase("en");
    const items = scopedVocabulary.filter((entry) => {
      if (priority !== "all" && entry.priority !== priority) return false;
      if (!normalized) return true;
      const form = formFor(entry, register);
      return (
        entry.meanings.some((meaning) => meaning.toLocaleLowerCase("en").includes(normalized)) ||
        form.kana.includes(normalized) ||
        form.kanji?.includes(normalized) ||
        form.romaji.toLocaleLowerCase("en").includes(normalized)
      );
    });
    return showAll || normalized ? items : items.slice(0, selectedScene ? 12 : 16);
  }, [priority, query, register, scopedVocabulary, showAll]);

  if (!topic) return <Navigate to="/topics" replace />;
  if (sceneId && !selectedScene) return <Navigate to={`/topic/${topic.id}`} replace />;

  const visibleDialogues = selectedScene
    ? topic.dialogues.filter((dialogue) => selectedScene.dialogueIds.includes(dialogue.id))
    : topic.dialogues;
  const vocabularyScopeCount = selectedScene ? selectedScene.vocabularyIds.length : domainVocabulary.length;
  const studyVocabularyCount = priority === "all"
    ? scopedVocabulary.length
    : scopedVocabulary.filter((entry) => entry.priority === priority).length;
  const studyParameters = new URLSearchParams();
  if (selectedScene) studyParameters.set("scene", selectedScene.id);
  if (priority !== "all") studyParameters.set("priority", priority);
  const studyHref = `/topic/${topic.id}/study${studyParameters.size ? `?${studyParameters}` : ""}`;
  const relatedTopics = topic.relatedTopicIds.map((id) => topicById.get(id)).filter(Boolean);
  const jumpTo = (id: string) => document.getElementById(id)?.scrollIntoView({ block: "start" });

  return (
    <div className="page topic-page">
      <ScreenHeader
        title={selectedScene?.title ?? topic.title}
        description={selectedScene?.description ?? topic.description}
        actions={<Link className="icon-button" to="/topics" aria-label="Back to topics"><ArrowLeft aria-hidden="true" /></Link>}
      >
        <div className="topic-stats">
          <span>{domainVocabulary.length} topic words + essentials</span>
          <span>{topic.scenes.length} scenes</span>
          {selectedScene ? <span>{selectedScene.vocabularyIds.length} in this scene</span> : null}
        </div>
      </ScreenHeader>

      <nav className="scene-switcher" aria-label="Topic scenes">
        <Link className={!selectedScene ? "is-active" : undefined} to={`/topic/${topic.id}`}>Overview</Link>
        {topic.scenes.map((scene, index) => (
          <Link className={selectedScene?.id === scene.id ? "is-active" : undefined} to={`/topic/${topic.id}/scene/${scene.id}`} key={scene.id}>
            <span>{index + 1}</span>{scene.title}
          </Link>
        ))}
      </nav>

      {!selectedScene ? (
        <section className="scene-section" aria-labelledby="scenes-title">
          <div className="section-heading"><div><h2 id="scenes-title">Study the trip in scenes</h2><p>Small, practical groups organize study; the topic checkpoint covers all three.</p></div></div>
          <div className="scene-grid">
            {topic.scenes.map((scene, index) => {
              const mustKnow = domainVocabulary.filter((entry) => entry.primarySceneId === scene.id && entry.priority === "must-know").length;
              return (
                <Link to={`/topic/${topic.id}/scene/${scene.id}`} key={scene.id}>
                  <span className="scene-number">Scene {index + 1}</span>
                  <h3>{scene.title}</h3>
                  <p>{scene.description}</p>
                  <small>{scene.vocabularyIds.length} words · {mustKnow} must know</small>
                  <ArrowRight aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="scene-focus" aria-labelledby="scene-focus-title">
          <h2 id="scene-focus-title">What this scene prepares you to do</h2>
          <p>{selectedScene.description}</p>
          <div><span>{selectedScene.sentencePatternIds.length} sentence functions</span><span>{selectedScene.responsePatternIds.length} response functions</span></div>
        </section>
      )}

      <nav className="topic-jumpbar" aria-label="On this topic">
        <button type="button" onClick={() => jumpTo("tiers-title")}>Checkpoint</button>
        <button type="button" onClick={() => jumpTo("dialogues-title")}>Dialogue</button>
        <button type="button" onClick={() => jumpTo("vocabulary-title")}>Words</button>
      </nav>
      <p className="topic-guidance" role="note">
        {register === "formal"
          ? "Polite Japanese is the safe default with staff and strangers."
          : "Casual forms are for friends and recognition; use polite Japanese with staff and strangers."}
      </p>

      <section className="tier-section" aria-labelledby="tiers-title">
        <div className="section-heading">
          <div><h2 id="tiers-title">Four-step topic checkpoint</h2><p>All scenes contribute questions. Score {PASS_SCORE} of 24 to open the next step.</p></div>
        </div>
        <ol className="tier-list">
          {tierOrder.map((tier, index) => {
            const record = progressByTier.get(tier);
            const unlocked = index === 0 || Boolean(progressByTier.get(tierOrder[index - 1])?.passed);
            return (
              <li className={record?.passed ? "is-passed" : undefined} key={tier}>
                <span className="tier-number">{record?.passed ? <Check aria-hidden="true" /> : tierMeta[tier].step}</span>
                <div>
                  <h3>{tierMeta[tier].title}</h3><p>{tierMeta[tier].description}</p>
                  {record ? <small>Best score: {record.bestScore} / 24 · {record.attempts} {record.attempts === 1 ? "attempt" : "attempts"}</small> : null}
                </div>
                {unlocked ? (
                  <Link className="button button--small" to={`/topic/${topic.id}/quiz/${tier}`}><Play aria-hidden="true" /> {record ? "Practice" : "Start"}</Link>
                ) : <span className="locked-label"><LockKeyhole aria-hidden="true" /> Locked</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="dialogue-section" aria-labelledby="dialogues-title">
        <div className="section-heading"><div><h2 id="dialogues-title">Dialogue in context</h2><p>{selectedScene ? "The exchange anchoring this scene." : `One realistic exchange anchors each scene in the selected ${register === "formal" ? "formal" : "casual"} register.`}</p></div></div>
        <div className={`dialogue-list ${selectedScene ? "dialogue-list--single" : ""}`} tabIndex={0} role="region" aria-label="Scenario dialogues. Scroll horizontally for more.">
          {visibleDialogues.map((scenario) => (
            <article className="dialogue" key={scenario.id}>
              <header><h3>{scenario.title}</h3><p>{scenario.context}</p></header>
              <ol>{scenario.turns.map((turn, index) => (
                <li className={`dialogue__turn dialogue__turn--${turn.speaker}`} key={`${scenario.id}-${index}`}>
                  <span className="dialogue__speaker">{turn.speaker === "traveler" ? "You" : "Local"}</span>
                  <p lang="ja">{turn.japanese[register]}</p><small>{turn.english}</small>
                </li>
              ))}</ol>
            </article>
          ))}
        </div>
      </section>

      <section className="vocabulary-section" aria-labelledby="vocabulary-title">
        <div className="section-heading section-heading--vocabulary">
          <div><h2 id="vocabulary-title">{selectedScene ? "Scene vocabulary" : "Topic vocabulary"}</h2><p>{vocabularyScopeCount} unique topic entries. The shared phrase kit is linked separately.</p></div>
          <div className="vocabulary-actions">
            <Link className="button button--study" to={studyHref}><Play aria-hidden="true" /> Study {studyVocabularyCount}</Link>
            <label className="search-field search-field--small"><span className="sr-only">Search this topic</span><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this topic" /></label>
          </div>
        </div>
        <div className="priority-filter" role="group" aria-label="Vocabulary priority">
          {(["all", "must-know", "useful", "reference"] as PriorityFilter[]).map((value) => (
            <button className={priority === value ? "is-active" : undefined} type="button" onClick={() => { setPriority(value); setShowAll(false); }} key={value}>
              {value === "all" ? "All" : priorityLabels[value]}
            </button>
          ))}
        </div>
        <ul className="vocabulary-list">
          {filteredVocabulary.map((entry) => {
            const form = formFor(entry, register);
            const alternative = entry.registerForms?.[register === "formal" ? "informal" : "formal"];
            return (
              <li key={entry.id}>
                <div className="vocabulary-list__japanese"><strong lang="ja">{form.kanji ?? form.kana}</strong>{form.kanji ? <span lang="ja">{form.kana}</span> : null}</div>
                <div className="vocabulary-list__meaning"><span>{entry.meanings.join(" · ")}</span><small>{form.romaji}</small></div>
                <span className={`priority-label priority-label--${entry.priority}`}>{priorityLabels[entry.priority]}</span>
                {alternative ? <span className="register-note" title={`Other register: ${alternative.kanji ?? alternative.kana}`} lang="ja">{alternative.kanji ?? alternative.kana}</span> : null}
              </li>
            );
          })}
        </ul>
        {!query && !showAll && filteredVocabulary.length < vocabularyScopeCount ? (
          <button className="button button--secondary button--wide" type="button" onClick={() => setShowAll(true)}>Show all matching words</button>
        ) : null}
        {!filteredVocabulary.length ? <p className="empty-note">No words match this scene and priority filter.</p> : null}
      </section>

      <section className="topic-companions" aria-labelledby="companions-title">
        <div><h2 id="companions-title">Essential Phrase Kit</h2><p>Politeness, clarification, numbers, and wayfinding are mastered once across every checkpoint.</p></div>
        <Link className="button button--secondary" to="/phrases">Open 40 phrases <ArrowRight aria-hidden="true" /></Link>
      </section>

      {relatedTopics.length ? (
        <section className="related-section" aria-labelledby="related-title">
          <div className="section-heading"><div><h2 id="related-title">Useful companions</h2><p>Continue with situations that naturally connect to this topic.</p></div></div>
          <div className="related-links">{relatedTopics.map((related) => related ? <Link to={`/topic/${related.id}`} key={related.id}><span><strong>{related.shortTitle}</strong><small>{related.description}</small></span><ArrowRight aria-hidden="true" /></Link> : null)}</div>
        </section>
      ) : null}
    </div>
  );
}

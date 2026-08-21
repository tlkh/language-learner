import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Play, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { getVocabularyForm, type VocabularyPriority } from "../languages";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { db } from "../storage/db";

type PriorityFilter = "all" | VocabularyPriority;

const priorityLabels: Record<VocabularyPriority, string> = {
  "must-know": "Must know",
  useful: "Useful",
  reference: "Reference"
};

export function TopicPage() {
  const { topicId, sceneId } = useParams();
  const [searchParams] = useSearchParams();
  const { pack, indexes, variantId } = useLanguagePack();
  const base = `/${pack.code}`;
  const topic = topicId ? indexes.topics.get(topicId) : undefined;
  const selectedScene = sceneId ? topic?.scenes.find((scene) => scene.id === sceneId) : undefined;
  const [query, setQuery] = useState("");
  const defaultPriority: PriorityFilter = pack.presentation.speechVariantMode === "primary-with-reference" ? "must-know" : "all";
  const [priority, setPriority] = useState<PriorityFilter>(defaultPriority);
  const [showAll, setShowAll] = useState(false);
  const progressData = useLiveQuery(async () => {
    if (!topic) return { tiers: [], attempts: [], study: [] };
    const [tiers, attempts, study] = await Promise.all([
      db.tierProgress.where("languageCode").equals(pack.code).filter((item) => item.topicId === topic.id && item.variantId === variantId).toArray(),
      db.attempts.where("languageCode").equals(pack.code).filter((item) => item.topicId === topic.id && item.variantId === variantId && item.correct).toArray(),
      db.studyProgress.where("[languageCode+scopeId]").equals([pack.code, `topic:${topic.id}`]).toArray()
    ]);
    return { tiers, attempts, study };
  }, [pack.code, topic?.id, variantId]) ?? { tiers: [], attempts: [], study: [] };

  useEffect(() => {
    setQuery("");
    setPriority(defaultPriority);
    setShowAll(false);
  }, [defaultPriority, sceneId]);

  const progressByTier = new Map(progressData.tiers.map((item) => [item.tierId, item]));
  const domainVocabulary = useMemo(() => topic?.vocabulary.filter((entry) => entry.tags.includes("domain")) ?? [], [topic]);
  const scopedVocabulary = useMemo(() => selectedScene
    ? domainVocabulary.filter((entry) => entry.primarySceneId === selectedScene.id)
    : domainVocabulary, [domainVocabulary, selectedScene]);
  const filteredVocabulary = useMemo(() => {
    const normalized = pack.searchNormalizer(query);
    const items = scopedVocabulary.filter((entry) => {
      if (priority !== "all" && entry.priority !== priority) return false;
      if (!normalized) return true;
      const form = getVocabularyForm(entry, variantId);
      return (
        entry.meanings.some((meaning) => pack.searchNormalizer(meaning).includes(normalized)) ||
        Object.values(form.representations).some((value) => pack.searchNormalizer(value).includes(normalized)) ||
        Object.values(form.aliases).flatMap((values) => values ?? []).some((value) => pack.searchNormalizer(value).includes(normalized))
      );
    });
    return showAll || normalized ? items : items.slice(0, selectedScene ? 12 : 16);
  }, [pack, priority, query, scopedVocabulary, showAll, variantId]);

  if (!topic) return <Navigate to={`${base}/topics`} replace />;
  if (sceneId && !selectedScene) return <Navigate to={`${base}/topic/${topic.id}`} replace />;

  const visibleDialogues = selectedScene
    ? topic.dialogues.filter((dialogue) => selectedScene.dialogueIds.includes(dialogue.id))
    : topic.dialogues;
  const vocabularyScopeCount = selectedScene ? selectedScene.vocabularyIds.length : domainVocabulary.length;
  const studyVocabularyCount = priority === "all"
    ? scopedVocabulary.length
    : scopedVocabulary.filter((entry) => entry.priority === priority).length;
  const studiedVocabularyIds = new Set(progressData.study.map((record) => record.sourceId));
  const unstudiedVocabularyCount = scopedVocabulary.filter((entry) => !studiedVocabularyIds.has(entry.id) && (priority === "all" || entry.priority === priority)).length;
  const quickStudyCount = Math.min(unstudiedVocabularyCount || studyVocabularyCount, 12);
  const studyParameters = new URLSearchParams();
  if (selectedScene) studyParameters.set("scene", selectedScene.id);
  if (priority !== "all") studyParameters.set("priority", priority);
  studyParameters.set("mode", "focus");
  const focusStudyHref = `${base}/topic/${topic.id}/study?${studyParameters}`;
  studyParameters.set("mode", "all");
  const allStudyHref = `${base}/topic/${topic.id}/study?${studyParameters}`;
  const relatedTopics = topic.relatedTopicIds.map((id) => indexes.topics.get(id)).filter(Boolean);
  const activeVariant = pack.speechVariants.find((variant) => variant.id === variantId);
  const referenceVariant = pack.presentation.speechVariantMode === "primary-with-reference"
    ? pack.speechVariants.find((variant) => variant.id !== variantId)
    : undefined;
  const topicTiers = topic.quizTierIds.map((id) => indexes.quizTiers.get(id)).filter((tier) => tier !== undefined);
  const checkpointPools = new Map(topicTiers.map((tier) => [tier.id, pack.quiz.generate(topic, {
    languageCode: pack.code,
    topicId: topic.id,
    tierId: tier.id,
    variantId,
    seed: 0,
    count: Number.MAX_SAFE_INTEGER
  })]));
  const correctQuestionIds = new Set(progressData.attempts.map((attempt) => attempt.questionId));
  const checkpointTotals = topicTiers.map((tier) => {
    const pool = checkpointPools.get(tier.id) ?? [];
    return { tierId: tier.id, total: pool.length, completed: pool.filter((question) => correctQuestionIds.has(question.id)).length };
  });
  const checkpointCompleted = checkpointTotals.reduce((sum, item) => sum + item.completed, 0);
  const checkpointTotal = checkpointTotals.reduce((sum, item) => sum + item.total, 0);
  const companionSet = pack.sharedVocabularySets.find((set) => topic.sharedVocabularySetIds.includes(set.id));
  const jumpTo = (id: string) => document.getElementById(id)?.scrollIntoView({ block: "start" });
  const activeTab = searchParams.get("tab") === "checkpoint" ? "checkpoint" : "learn";
  const topicPath = selectedScene
    ? `${base}/topic/${topic.id}/scene/${selectedScene.id}`
    : `${base}/topic/${topic.id}`;

  return (
    <div className="page topic-page">
      <ScreenHeader
        title={selectedScene?.title ?? topic.title}
        description={selectedScene?.description ?? topic.description}
        leading={<Link className="icon-button" to={`${base}/topics`} aria-label="Back to topics"><ArrowLeft aria-hidden="true" /></Link>}
      >
        <div className="topic-stats">
          <span>{domainVocabulary.length} topic words + essentials</span>
          <span>{topic.scenes.length} scenes</span>
          {selectedScene ? <span>{selectedScene.vocabularyIds.length} in this scene</span> : null}
        </div>
      </ScreenHeader>

      <nav className="scene-switcher" aria-label="Topic scenes">
        <Link className={!selectedScene ? "is-active" : undefined} to={`${base}/topic/${topic.id}?tab=${activeTab}`}>Overview</Link>
        {topic.scenes.map((scene, index) => (
          <Link className={selectedScene?.id === scene.id ? "is-active" : undefined} to={`${base}/topic/${topic.id}/scene/${scene.id}?tab=${activeTab}`} key={scene.id}>
            <span className="scene-switcher__number">{index + 1}</span>
            <span className="scene-switcher__title">{scene.title}</span>
          </Link>
        ))}
      </nav>

      <nav className="topic-tabs" aria-label="Topic sections">
        <Link className={activeTab === "learn" ? "is-active" : undefined} aria-current={activeTab === "learn" ? "page" : undefined} to={`${topicPath}?tab=learn`}>Learn & study</Link>
        <Link className={activeTab === "checkpoint" ? "is-active" : undefined} aria-current={activeTab === "checkpoint" ? "page" : undefined} to={`${topicPath}?tab=checkpoint`}>Checkpoint</Link>
      </nav>

      {activeTab === "learn" ? <>
      <nav className="topic-jumpbar" aria-label="On this topic">
        <button type="button" onClick={() => jumpTo("scenes-title")}>Scenes</button>
        <button type="button" onClick={() => jumpTo("vocabulary-title")}>Words</button>
        <button type="button" onClick={() => jumpTo("dialogues-title")}>Dialogue</button>
      </nav>
      <p className="topic-guidance" role="note">
        {activeVariant?.description ?? `Using the ${activeVariant?.label ?? variantId} speech variant.`}
      </p>

      {!selectedScene ? (
        <section className="scene-section" aria-labelledby="scenes-title">
          <div className="section-heading"><div><h2 id="scenes-title">Study the trip in scenes</h2><p>Start with one practical situation, then return for the rest of the topic.</p></div></div>
          <div className="scene-grid">
            {topic.scenes.map((scene, index) => {
              const mustKnow = domainVocabulary.filter((entry) => entry.primarySceneId === scene.id && entry.priority === "must-know").length;
              return (
                <Link to={`${base}/topic/${topic.id}/scene/${scene.id}`} key={scene.id}>
                  <span className="scene-number">Scene {index + 1}</span>
                  <h3>{scene.title}</h3>
                  <p>{scene.description}</p>
                  <small>{mustKnow} must know · {scene.vocabularyIds.length} assessed words</small>
                  <ArrowRight aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="scene-focus" aria-labelledby="scenes-title">
          <h2 id="scenes-title">What this scene prepares you to do</h2>
          <p>{selectedScene.description}</p>
          <div><span>{selectedScene.vocabularyIds.filter((id) => indexes.vocabulary.get(id)?.priority === "must-know").length} must-know words</span><span>1 guided dialogue</span></div>
        </section>
      )}

      <section className="vocabulary-section" aria-labelledby="vocabulary-title">
        <div className="section-heading section-heading--vocabulary">
          <div><h2 id="vocabulary-title">{selectedScene ? "Scene vocabulary" : "Topic vocabulary"}</h2><p>{vocabularyScopeCount} unique topic entries. The shared phrase kit is linked separately.</p></div>
          <div className="vocabulary-actions">
            <div className="study-action-group">
              <Link className="button button--study" to={focusStudyHref}><Play aria-hidden="true" /> Quick study · {quickStudyCount}</Link>
              <Link className="text-link" to={allStudyHref}>Browse all {studyVocabularyCount}</Link>
            </div>
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
            const form = getVocabularyForm(entry, variantId);
            const alternativeVariant = pack.speechVariants.find((variant) => variant.id !== variantId);
            const alternative = alternativeVariant ? entry.variantForms?.[alternativeVariant.id] : undefined;
            const target = form.representations.target;
            const reading = form.representations.reading;
            const alternativeTarget = alternative?.representations.target;
            return (
              <li key={entry.id}>
                <div className="vocabulary-list__japanese"><strong lang={pack.locale}>{target}</strong>{reading && reading !== target ? <span lang={pack.locale}>{reading}</span> : null}</div>
                <div className="vocabulary-list__meaning"><span>{entry.meanings.join(" · ")}</span>{form.representations.romanization && pack.presentation.speechVariantMode !== "primary-with-reference" ? <small>{form.representations.romanization}</small> : null}</div>
                <span className={`priority-label priority-label--${entry.priority}`}>{priorityLabels[entry.priority]}</span>
                {alternativeTarget ? <span className="register-note" title={`${alternativeVariant?.label}: ${alternativeTarget}`} lang={pack.locale}>{alternativeTarget}</span> : null}
              </li>
            );
          })}
        </ul>
        {!query && !showAll && filteredVocabulary.length < vocabularyScopeCount ? (
          <button className="button button--secondary button--wide" type="button" onClick={() => setShowAll(true)}>Show all matching words</button>
        ) : null}
        {!filteredVocabulary.length ? <p className="empty-note">No words match this scene and priority filter.</p> : null}
      </section>

      <section className="dialogue-section" aria-labelledby="dialogues-title">
        <div className="section-heading"><div><h2 id="dialogues-title">Dialogue in context</h2><p>{selectedScene ? "The exchange anchoring this scene." : `One realistic exchange anchors each scene in the selected ${activeVariant?.label.toLocaleLowerCase("en") ?? variantId} variant.`}</p></div></div>
        <div className={`dialogue-list ${selectedScene ? "dialogue-list--single" : ""}`} tabIndex={0} role="region" aria-label="Scenario dialogues. Scroll horizontally for more.">
          {visibleDialogues.map((scenario) => (
            <article className="dialogue" key={scenario.id}>
              <header><h3>{scenario.title}</h3><p>{scenario.context}</p></header>
              <ol>{scenario.turns.map((turn, index) => (
                <li className={`dialogue__turn dialogue__turn--${turn.speaker}`} key={`${scenario.id}-${index}`}>
                  <span className="dialogue__speaker">{turn.speaker === "traveler" ? "You" : "Local"}</span>
                  <p lang={pack.locale}>{turn.targetTextByVariant[variantId]}</p>
                  {turn.targetReadingByVariant?.[variantId] && turn.targetReadingByVariant[variantId] !== turn.targetTextByVariant[variantId] ? <span className="dialogue__reading" lang={pack.locale}>{turn.targetReadingByVariant[variantId]}</span> : null}
                  <small>{turn.sourceText}</small>
                  {referenceVariant && turn.targetTextByVariant[referenceVariant.id] !== turn.targetTextByVariant[variantId] ? <span className="dialogue__reference"><b>Casual</b><span lang={pack.locale}>{turn.targetTextByVariant[referenceVariant.id]}</span></span> : null}
                </li>
              ))}</ol>
            </article>
          ))}
        </div>
      </section>

      {companionSet ? <section className="topic-companions" aria-labelledby="companions-title">
        <div><h2 id="companions-title">{companionSet.title}</h2><p>{companionSet.description}</p></div>
        <Link className="button button--secondary" to={`${base}/phrases`}>Open {companionSet.vocabulary.length} phrases <ArrowRight aria-hidden="true" /></Link>
      </section> : null}

      {relatedTopics.length ? (
        <section className="related-section" aria-labelledby="related-title">
          <div className="section-heading"><div><h2 id="related-title">Useful companions</h2><p>Continue with situations that naturally connect to this topic.</p></div></div>
          <div className="related-links">{relatedTopics.map((related) => related ? <Link to={`${base}/topic/${related.id}`} key={related.id}><span><strong>{related.shortTitle}</strong><small>{related.description}</small></span><ArrowRight aria-hidden="true" /></Link> : null)}</div>
        </section>
      ) : null}
      </> : (

      <section className="tier-section" aria-labelledby="tiers-title">
        <div className="section-heading">
          <div><h2 id="tiers-title">{topicTiers.length}-step topic checkpoint</h2><p>{checkpointCompleted} of {checkpointTotal} questions completed. Correct answers stay out of the queue until every question has been covered.</p></div>
        </div>
        <ol className="tier-list">
          {topicTiers.map((tier, index) => {
            const record = progressByTier.get(tier.id);
            const unlocked = index === 0 || Boolean(progressByTier.get(topicTiers[index - 1].id)?.passed);
            const coverage = checkpointTotals.find((item) => item.tierId === tier.id);
            return (
              <li className={record?.passed ? "is-passed" : undefined} key={tier.id}>
                <span className="tier-number">{record?.passed ? <Check aria-hidden="true" /> : tier.step}</span>
                <div>
                  <h3>{tier.title}</h3><p>{tier.description}</p>
                  <small>{coverage?.completed ?? 0} of {coverage?.total ?? 0} questions completed{record ? ` · Best ${record.bestScore} / ${tier.sessionSize}` : ""}</small>
                </div>
                {unlocked ? (
                  <Link className="button button--small" to={`${base}/topic/${topic.id}/quiz/${tier.id}`}><Play aria-hidden="true" /> {record ? "Practice" : "Start"}</Link>
                ) : <span className="locked-label"><LockKeyhole aria-hidden="true" /> Locked</span>}
              </li>
            );
          })}
        </ol>
      </section>
      )}
    </div>
  );
}

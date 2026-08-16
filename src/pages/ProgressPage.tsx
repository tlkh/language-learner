import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, BookCheck, BookOpenCheck, Brain, Check, Languages, Target, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { ProgressFill } from "../components/ProgressFill";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { buildPhraseQuizTopic, getPhraseQuizTier } from "../quiz/phrases";
import { aggregateStats, db } from "../storage/db";

const accuracyLabel = (correct: number, attempts: number) =>
  attempts ? `${Math.round((correct / attempts) * 100)}% · ${attempts} ${attempts === 1 ? "answer" : "answers"}` : "No answers yet";

export function ProgressPage() {
  const { pack, indexes, variantId } = useLanguagePack();
  const base = `/${pack.code}`;
  const vocabularyIds = new Set(indexes.vocabulary.keys());
  const data = useLiveQuery(async () => {
    const [stats, tiers, attempts, characterMastery, studyProgress] = await Promise.all([
      aggregateStats(pack.code, vocabularyIds),
      db.tierProgress.where("languageCode").equals(pack.code).toArray(),
      db.attempts.where("languageCode").equals(pack.code).reverse().sortBy("answeredAt"),
      db.characterMastery.where("languageCode").equals(pack.code).toArray(),
      db.studyProgress.where("languageCode").equals(pack.code).toArray()
    ]);
    return { stats, tiers, attempts, characterMastery, studyProgress };
  }, [pack.code]);
  const stats = data?.stats ?? { mastered: 0, seen: 0, correct: 0, attempts: 0, passedTiers: 0, completedSessions: 0, recentAttempts: 0 };
  const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const passedByTopic = new Map<string, number>();
  data?.tiers.filter((tier) => tier.passed && tier.variantId === variantId).forEach((tier) => passedByTopic.set(tier.topicId, (passedByTopic.get(tier.topicId) ?? 0) + 1));
  const attempts = data?.attempts ?? [];
  const tierBreakdown = pack.quiz.tiers.map((tier) => {
    const records = attempts.filter((attempt) => attempt.tierId === tier.id);
    return { tier, correct: records.filter((attempt) => attempt.correct).length, attempts: records.length };
  });
  const variantBreakdown = pack.speechVariants.map((variant) => {
    const records = attempts.filter((attempt) => attempt.variantId === variant.id);
    return { variant, correct: records.filter((attempt) => attempt.correct).length, attempts: records.length };
  });
  const masteredCharacters = data?.characterMastery.filter((item) => item.mastered).length ?? 0;
  const practicedCharacters = data?.characterMastery.length ?? 0;
  const studiedSourceIds = new Set(data?.studyProgress.map((record) => record.sourceId) ?? []);
  const studyTotal = indexes.vocabulary.size;
  const correctQuestionIds = new Set((data?.attempts ?? []).filter((attempt) => attempt.variantId === variantId && attempt.correct).map((attempt) => attempt.questionId));
  const checkpointCoverageByTopic = new Map(pack.topics.map((topic) => {
    const pools = topic.quizTierIds.flatMap((tierId) => pack.quiz.generate(topic, {
      languageCode: pack.code,
      topicId: topic.id,
      tierId,
      variantId,
      seed: 0,
      count: Number.MAX_SAFE_INTEGER
    }));
    return [topic.id, { completed: pools.filter((question) => correctQuestionIds.has(question.id)).length, total: pools.length }] as const;
  }));
  const phraseTopic = buildPhraseQuizTopic(pack);
  const phraseTier = getPhraseQuizTier(pack);
  const phrasePool = phraseTopic && phraseTier ? pack.quiz.generate(phraseTopic, {
    languageCode: pack.code,
    topicId: phraseTopic.id,
    tierId: phraseTier.id,
    variantId,
    seed: 0,
    count: Number.MAX_SAFE_INTEGER
  }) : [];
  const checkpointCompleted = [...checkpointCoverageByTopic.values()].reduce((sum, item) => sum + item.completed, 0)
    + phrasePool.filter((question) => correctQuestionIds.has(question.id)).length;
  const checkpointTotal = [...checkpointCoverageByTopic.values()].reduce((sum, item) => sum + item.total, 0) + phrasePool.length;
  const isFirstSession = data !== undefined && stats.attempts === 0 && studiedSourceIds.size === 0;
  const startTopic = indexes.topics.get(pack.presentation.startTopicId);

  return (
    <div className="page">
      <ScreenHeader title="Progress" description="A quiet record of what you can recall—not a streak to protect." />
      {data === undefined ? (
        <section className="progress-loading" role="status"><span className="spinner" /> Loading your learning record…</section>
      ) : isFirstSession ? (
        <section className="progress-empty-state" aria-labelledby="progress-empty-title">
          <BookOpenCheck aria-hidden="true" />
          <div>
            <span className="quiet-label">Nothing to measure yet</span>
            <h2 id="progress-empty-title">Your learning record starts with one card</h2>
            <p>Open quick study or answer a checkpoint question and this page will begin showing coverage, recall, and topic readiness—without streaks or daily pressure.</p>
          </div>
          {startTopic ? <Link className="button" to={`${base}/topic/${startTopic.id}`}>Open {startTopic.shortTitle}</Link> : null}
        </section>
      ) : (
        <section className="stats-grid" aria-label="Learning statistics">
          <article><BookOpenCheck aria-hidden="true" /><strong>{studiedSourceIds.size}</strong><span>words studied</span><small>of {studyTotal} total</small></article>
          <article><Brain aria-hidden="true" /><strong>{stats.mastered}</strong><span>words mastered</span><small>{stats.seen} seen</small></article>
          <article><Target aria-hidden="true" /><strong>{accuracy}%</strong><span>answer accuracy</span><small>{stats.attempts} answers</small></article>
          <article><BookCheck aria-hidden="true" /><strong>{stats.passedTiers}</strong><span>steps passed</span><small>of {pack.topics.length * pack.quiz.tiers.length * pack.speechVariants.length + (phrasePool.length ? 1 : 0)} total</small></article>
          <article><BarChart3 aria-hidden="true" /><strong>{stats.recentAttempts}</strong><span>answers in 30 days</span><small>{stats.completedSessions} sessions total</small></article>
        </section>
      )}

      <section className="coverage-section" aria-labelledby="coverage-title">
        <div className="section-heading"><div><h2 id="coverage-title">Overall completion</h2><p>Quick study tracks first exposure; checkpoints track every unique question answered correctly.</p></div></div>
        <div className="coverage-grid">
          <article>
            <div><BookOpenCheck aria-hidden="true" /><span><strong>Quick study</strong><small>{studiedSourceIds.size} of {studyTotal} words shown</small></span><b>{studyTotal ? Math.round((studiedSourceIds.size / studyTotal) * 100) : 0}%</b></div>
            <span className="coverage-track" role="progressbar" aria-label="Quick study completion" aria-valuemin={0} aria-valuemax={studyTotal} aria-valuenow={studiedSourceIds.size}><ProgressFill value={studyTotal ? studiedSourceIds.size / studyTotal : 0} /></span>
          </article>
          <article>
            <div><Target aria-hidden="true" /><span><strong>Checkpoint questions</strong><small>{checkpointCompleted} of {checkpointTotal} answered correctly</small></span><b>{checkpointTotal ? Math.round((checkpointCompleted / checkpointTotal) * 100) : 0}%</b></div>
            <span className="coverage-track" role="progressbar" aria-label="Checkpoint completion" aria-valuemin={0} aria-valuemax={checkpointTotal} aria-valuenow={checkpointCompleted}><ProgressFill value={checkpointTotal ? checkpointCompleted / checkpointTotal : 0} /></span>
          </article>
        </div>
      </section>

      <section className="character-progress-panel" aria-labelledby="character-progress-title">
        <Languages aria-hidden="true" />
        <div><h2 id="character-progress-title">{pack.characterCourse.title}</h2><p>{masteredCharacters} of {pack.characterCourse.items.length} mastered · {practicedCharacters} practiced</p></div>
        <Link className="button button--secondary" to={`${base}/characters`}>Practice {pack.characterCourse.navLabel}</Link>
      </section>

      {data !== undefined && !isFirstSession ? (
        <>
          <section className="breakdown-section" aria-labelledby="breakdown-title">
            <div className="section-heading"><div><h2 id="breakdown-title">Recall breakdown</h2><p>Accuracy by pack-authored quiz step{pack.speechVariants.length > 1 ? " and speech style" : ""}.</p></div></div>
            <div className="breakdown-grid">
              {tierBreakdown.map(({ tier, correct, attempts: count }) => <article key={tier.id}><span className="quiet-label">Step {tier.step}</span><strong>{tier.shortTitle}</strong><small>{accuracyLabel(correct, count)}</small></article>)}
              {pack.speechVariants.length > 1 ? variantBreakdown.map(({ variant, correct, attempts: count }) => <article className="breakdown-register" key={variant.id}><strong lang={pack.locale}>{variant.nativeLabel ? `${variant.nativeLabel} · ` : ""}{variant.label}</strong><small>{accuracyLabel(correct, count)}</small></article>) : null}
            </div>
          </section>

          <section className="activity-section" aria-labelledby="activity-title">
            <div className="section-heading"><div><h2 id="activity-title">Recent activity</h2><p>Your latest answers, without streaks or daily pressure.</p></div></div>
            <ul className="activity-list">{attempts.slice(0, 6).map((attempt) => {
              const topic = indexes.topics.get(attempt.topicId);
              const tier = indexes.quizTiers.get(attempt.tierId);
              const variant = pack.speechVariants.find((item) => item.id === attempt.variantId);
              return <li key={attempt.id}><span className={attempt.correct ? "activity-mark is-correct" : "activity-mark"} aria-hidden="true">{attempt.correct ? <Check /> : <X />}</span><span className="sr-only">{attempt.correct ? "Correct" : "Incorrect"}</span><span><strong>{topic?.shortTitle ?? pack.name}</strong><small>{tier?.shortTitle ?? attempt.tierId}{pack.speechVariants.length > 1 ? ` · ${variant?.label ?? attempt.variantId}` : ""}</small></span><time dateTime={new Date(attempt.answeredAt).toISOString()}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(attempt.answeredAt)}</time></li>;
            })}</ul>
          </section>
        </>
      ) : null}

      <details className="readiness-section readiness-disclosure">
        <summary><span><strong id="readiness-title">Topic readiness</strong><small>{passedByTopic.size} of {pack.topics.length} topics started · tap for all</small></span></summary>
        <div className="readiness-collections">
          {pack.collections.map((collection) => <section key={collection.id}><h3>{collection.title}</h3><ul className="readiness-list">{collection.topicIds.map((topicId) => {
            const topic = indexes.topics.get(topicId);
            if (!topic) return null;
            const passed = passedByTopic.get(topic.id) ?? 0;
            const coverage = checkpointCoverageByTopic.get(topic.id) ?? { completed: 0, total: 0 };
            return <li key={topic.id}><Link to={`${base}/topic/${topic.id}?tab=checkpoint`}><span><strong>{topic.shortTitle}</strong><small>{coverage.completed} of {coverage.total} questions · {passed} of {topic.quizTierIds.length} steps passed</small></span><span className="readiness-dots" aria-label={`${passed} of ${topic.quizTierIds.length} tiers passed`}>{topic.quizTierIds.map((id, index) => <i className={index < passed ? "is-filled" : undefined} key={id} />)}</span></Link></li>;
          })}</ul></section>)}
        </div>
      </details>
    </div>
  );
}

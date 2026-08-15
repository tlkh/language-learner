import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, BookCheck, Brain, Check, Languages, Target, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { aggregateStats, db } from "../storage/db";

const accuracyLabel = (correct: number, attempts: number) =>
  attempts ? `${Math.round((correct / attempts) * 100)}% · ${attempts} ${attempts === 1 ? "answer" : "answers"}` : "No answers yet";

export function ProgressPage() {
  const { pack, indexes, variantId } = useLanguagePack();
  const base = `/${pack.code}`;
  const vocabularyIds = new Set(indexes.vocabulary.keys());
  const data = useLiveQuery(async () => {
    const [stats, tiers, attempts, characterMastery] = await Promise.all([
      aggregateStats(pack.code, vocabularyIds),
      db.tierProgress.where("languageCode").equals(pack.code).toArray(),
      db.attempts.where("languageCode").equals(pack.code).reverse().sortBy("answeredAt"),
      db.characterMastery.where("languageCode").equals(pack.code).toArray()
    ]);
    return { stats, tiers, attempts: attempts.slice(0, 100), characterMastery };
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

  return (
    <div className="page">
      <ScreenHeader title="Progress" description="A quiet record of what you can recall—not a streak to protect." />
      <section className="stats-grid" aria-label="Learning statistics">
        <article><Brain aria-hidden="true" /><strong>{stats.mastered}</strong><span>words mastered</span><small>{stats.seen} seen</small></article>
        <article><Target aria-hidden="true" /><strong>{accuracy}%</strong><span>answer accuracy</span><small>{stats.attempts} answers</small></article>
        <article><BookCheck aria-hidden="true" /><strong>{stats.passedTiers}</strong><span>tiers passed</span><small>of {pack.topics.length * pack.quiz.tiers.length * pack.speechVariants.length} total</small></article>
        <article><BarChart3 aria-hidden="true" /><strong>{stats.recentAttempts}</strong><span>answers in 30 days</span><small>{stats.completedSessions} sessions total</small></article>
      </section>

      <section className="character-progress-panel" aria-labelledby="character-progress-title">
        <Languages aria-hidden="true" />
        <div><h2 id="character-progress-title">{pack.characterCourse.title}</h2><p>{masteredCharacters} of {pack.characterCourse.items.length} mastered · {practicedCharacters} practiced</p></div>
        <Link className="button button--secondary" to={`${base}/characters`}>Practice {pack.characterCourse.navLabel}</Link>
      </section>

      <section className="breakdown-section" aria-labelledby="breakdown-title">
        <div className="section-heading"><div><h2 id="breakdown-title">Recall breakdown</h2><p>Accuracy by pack-authored quiz step{pack.speechVariants.length > 1 ? " and speech style" : ""}.</p></div></div>
        <div className="breakdown-grid">
          {tierBreakdown.map(({ tier, correct, attempts: count }) => <article key={tier.id}><span className="quiet-label">Step {tier.step}</span><strong>{tier.shortTitle}</strong><small>{accuracyLabel(correct, count)}</small></article>)}
          {pack.speechVariants.length > 1 ? variantBreakdown.map(({ variant, correct, attempts: count }) => <article className="breakdown-register" key={variant.id}><strong lang={pack.locale}>{variant.nativeLabel ? `${variant.nativeLabel} · ` : ""}{variant.label}</strong><small>{accuracyLabel(correct, count)}</small></article>) : null}
        </div>
      </section>

      <section className="activity-section" aria-labelledby="activity-title">
        <div className="section-heading"><div><h2 id="activity-title">Recent activity</h2><p>Your latest answers, without streaks or daily pressure.</p></div></div>
        {attempts.length ? <ul className="activity-list">{attempts.slice(0, 6).map((attempt) => {
          const topic = indexes.topics.get(attempt.topicId);
          const tier = indexes.quizTiers.get(attempt.tierId);
          const variant = pack.speechVariants.find((item) => item.id === attempt.variantId);
          return <li key={attempt.id}><span className={attempt.correct ? "activity-mark is-correct" : "activity-mark"} aria-hidden="true">{attempt.correct ? <Check /> : <X />}</span><span className="sr-only">{attempt.correct ? "Correct" : "Incorrect"}</span><span><strong>{topic?.shortTitle ?? pack.name}</strong><small>{tier?.shortTitle ?? attempt.tierId}{pack.speechVariants.length > 1 ? ` · ${variant?.label ?? attempt.variantId}` : ""}</small></span><time dateTime={new Date(attempt.answeredAt).toISOString()}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(attempt.answeredAt)}</time></li>;
        })}</ul> : <p className="empty-note">Your first completed answer will appear here.</p>}
      </section>

      <details className="readiness-section readiness-disclosure">
        <summary><span><strong id="readiness-title">Topic readiness</strong><small>{passedByTopic.size} of {pack.topics.length} topics started · tap for all</small></span></summary>
        <div className="readiness-collections">
          {pack.collections.map((collection) => <section key={collection.id}><h3>{collection.title}</h3><ul className="readiness-list">{collection.topicIds.map((topicId) => {
            const topic = indexes.topics.get(topicId);
            if (!topic) return null;
            const passed = passedByTopic.get(topic.id) ?? 0;
            return <li key={topic.id}><Link to={`${base}/topic/${topic.id}`}><span><strong>{topic.shortTitle}</strong><small>{passed ? `${passed} of ${topic.quizTierIds.length} tiers passed` : "Not started"}</small></span><span className="readiness-dots" aria-label={`${passed} of ${topic.quizTierIds.length} tiers passed`}>{topic.quizTierIds.map((id, index) => <i className={index < passed ? "is-filled" : undefined} key={id} />)}</span></Link></li>;
          })}</ul></section>)}
        </div>
      </details>
    </div>
  );
}

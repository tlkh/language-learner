import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, BookCheck, Brain, Check, Target, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { japanesePack, topicById, type QuizTier, type Register } from "../content";
import { tierMeta, tierOrder } from "../quiz/meta";
import { aggregateStats, db } from "../storage/db";

const accuracyLabel = (correct: number, attempts: number) =>
  attempts ? `${Math.round((correct / attempts) * 100)}% · ${attempts} ${attempts === 1 ? "answer" : "answers"}` : "No answers yet";

export function ProgressPage() {
  const data = useLiveQuery(async () => {
    const [stats, tiers, attempts] = await Promise.all([
      aggregateStats(),
      db.tierProgress.toArray(),
      db.attempts.orderBy("answeredAt").reverse().limit(100).toArray()
    ]);
    return { stats, tiers, attempts };
  }, []);
  const stats = data?.stats ?? { mastered: 0, seen: 0, correct: 0, attempts: 0, passedTiers: 0, completedSessions: 0, recentAttempts: 0 };
  const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const passedByTopic = new Map<string, number>();
  data?.tiers.filter((tier) => tier.passed).forEach((tier) => passedByTopic.set(tier.topicId, (passedByTopic.get(tier.topicId) ?? 0) + 1));
  const attempts = data?.attempts ?? [];
  const tierBreakdown = tierOrder.map((tier) => {
    const records = attempts.filter((attempt) => attempt.tier === tier);
    return { tier, correct: records.filter((attempt) => attempt.correct).length, attempts: records.length };
  });
  const registerBreakdown = (["formal", "informal"] as Register[]).map((register) => {
    const records = attempts.filter((attempt) => attempt.register === register);
    return { register, correct: records.filter((attempt) => attempt.correct).length, attempts: records.length };
  });

  return (
    <div className="page">
      <ScreenHeader title="Progress" description="A quiet record of what you can recall—not a streak to protect." />
      <section className="stats-grid" aria-label="Learning statistics">
        <article><Brain aria-hidden="true" /><strong>{stats.mastered}</strong><span>words mastered</span><small>{stats.seen} seen</small></article>
        <article><Target aria-hidden="true" /><strong>{accuracy}%</strong><span>answer accuracy</span><small>{stats.attempts} answers</small></article>
        <article><BookCheck aria-hidden="true" /><strong>{stats.passedTiers}</strong><span>tiers passed</span><small>of {japanesePack.topics.length * tierOrder.length} total</small></article>
        <article><BarChart3 aria-hidden="true" /><strong>{stats.recentAttempts}</strong><span>answers in 30 days</span><small>{stats.completedSessions} sessions total</small></article>
      </section>

      <section className="breakdown-section" aria-labelledby="breakdown-title">
        <div className="section-heading"><div><h2 id="breakdown-title">Recall breakdown</h2><p>Accuracy by quiz step and the speech style used for each answer.</p></div></div>
        <div className="breakdown-grid">
          {tierBreakdown.map(({ tier, correct, attempts: count }) => (
            <article key={tier}>
              <span className="quiet-label">Step {tierMeta[tier].step}</span>
              <strong>{tierMeta[tier].shortTitle}</strong>
              <small>{accuracyLabel(correct, count)}</small>
            </article>
          ))}
          {registerBreakdown.map(({ register, correct, attempts: count }) => (
            <article className="breakdown-register" key={register}>
              <strong lang="ja">{register === "formal" ? "丁寧 · Formal" : "カジュアル · Casual"}</strong>
              <small>{accuracyLabel(correct, count)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="activity-section" aria-labelledby="activity-title">
        <div className="section-heading"><div><h2 id="activity-title">Recent activity</h2><p>Your latest answers, without streaks or daily pressure.</p></div></div>
        {attempts.length ? (
          <ul className="activity-list">
            {attempts.slice(0, 6).map((attempt) => {
              const topic = topicById.get(attempt.topicId);
              return (
                <li key={attempt.id}>
                  <span className={attempt.correct ? "activity-mark is-correct" : "activity-mark"} aria-hidden="true">
                    {attempt.correct ? <Check /> : <X />}
                  </span>
                  <span className="sr-only">{attempt.correct ? "Correct" : "Incorrect"}</span>
                  <span><strong>{topic?.shortTitle ?? "Japanese"}</strong><small>{tierMeta[attempt.tier as QuizTier].shortTitle} · {attempt.register === "formal" ? "Formal" : "Casual"}</small></span>
                  <time dateTime={new Date(attempt.answeredAt).toISOString()}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(attempt.answeredAt)}</time>
                </li>
              );
            })}
          </ul>
        ) : <p className="empty-note">Your first completed answer will appear here.</p>}
      </section>

      <details className="readiness-section readiness-disclosure">
        <summary><span><strong id="readiness-title">Topic readiness</strong><small>{passedByTopic.size} of {japanesePack.topics.length} topics started · tap for all</small></span></summary>
        <div className="readiness-collections">
          {japanesePack.collections.map((collection) => (
            <section key={collection.id}>
              <h3>{collection.title}</h3>
              <ul className="readiness-list">
                {collection.topicIds.map((topicId) => {
                  const topic = topicById.get(topicId)!;
                  const passed = passedByTopic.get(topic.id) ?? 0;
                  return (
                    <li key={topic.id}>
                      <Link to={`/topic/${topic.id}`}>
                        <span><strong>{topic.shortTitle}</strong><small>{passed ? `${passed} of 4 tiers passed` : "Not started"}</small></span>
                        <span className="readiness-dots" aria-label={`${passed} of 4 tiers passed`}>
                          {[0, 1, 2, 3].map((index) => <i className={index < passed ? "is-filled" : undefined} key={index} />)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </details>
    </div>
  );
}

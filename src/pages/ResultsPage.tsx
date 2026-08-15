import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { topicById } from "../content";
import { completeSession } from "../storage/db";
import { db } from "../storage/db";
import { PASS_SCORE, QUIZ_SIZE } from "../quiz/engine";
import { tierMeta, tierOrder } from "../quiz/meta";

export function ResultsPage() {
  const reduceMotion = useReducedMotion();
  const { sessionId } = useParams();
  const data = useLiveQuery(async () => {
    if (!sessionId) return undefined;
    const session = await db.sessions.get(sessionId);
    if (!session) return undefined;
    const attempts = await db.attempts.where("sessionId").equals(sessionId).toArray();
    return { session, attempts };
  }, [sessionId]);

  useEffect(() => {
    if (!data || data.session.completed || data.attempts.length < QUIZ_SIZE) return;
    const score = data.attempts.filter((attempt) => attempt.correct).length;
    void completeSession(data.session, score).then(() => {
      if (score >= PASS_SCORE) void navigator.storage?.persist?.();
    });
  }, [data]);

  if (!sessionId) return <Navigate to="/learn" replace />;
  if (!data) return <div className="page quiz-loading" role="status"><span className="spinner" /> Loading results…</div>;
  const { session, attempts } = data;
  const topic = topicById.get(session.topicId);
  if (!topic) return <Navigate to="/learn" replace />;
  const score = attempts.filter((attempt) => attempt.correct).length;
  const passed = score >= PASS_SCORE;
  const missed = attempts.filter((attempt) => !attempt.correct);
  const tierIndex = tierOrder.indexOf(session.tier);
  const nextTier = tierOrder[tierIndex + 1];
  const questionMap = new Map(session.questions.map((question) => [question.id, question]));

  return (
    <div className="page results-page">
      <motion.section
        className={`result-hero${passed ? " is-passed" : ""}`}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: [0.23, 1, 0.32, 1] }}
      >
        {passed ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
        <span className="quiet-label">{topic.shortTitle} · {tierMeta[session.tier].shortTitle}</span>
        <h1>{score} <small>/ 24</small></h1>
        <h2>{passed ? "Tier passed" : "Keep this tier open"}</h2>
        <p>{passed ? "The next kind of recall is ready." : `You need ${PASS_SCORE - score} more correct answers to move on.`}</p>
        <div className="result-actions">
          {passed && nextTier ? (
            <Link className="button" to={`/topic/${topic.id}/quiz/${nextTier}`}>Start next tier <ArrowRight aria-hidden="true" /></Link>
          ) : (
            <Link className="button" to={`/topic/${topic.id}/quiz/${session.tier}`}><RotateCcw aria-hidden="true" /> Try again</Link>
          )}
          <Link className="button button--secondary" to={`/topic/${topic.id}`}>Return to topic</Link>
        </div>
      </motion.section>

      {missed.length ? (
        <section className="review-section" aria-labelledby="review-title">
          <div className="section-heading"><div><h2 id="review-title">Review the misses</h2><p>These items will be weighted first next time.</p></div></div>
          <ul className="review-list">
            {missed.map((attempt) => {
              const question = questionMap.get(attempt.questionId);
              return question ? (
                <li key={attempt.id}>
                  <span lang={question.promptLanguage}>{question.prompt}</span>
                  <strong lang={question.tier === "romaji-recall" ? "en" : "ja"}>{question.canonicalAnswer}</strong>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { completeSession, db } from "../storage/db";
import { buildPhraseQuizTopic, PHRASE_QUIZ_TOPIC_ID } from "../quiz/phrases";

export function ResultsPage() {
  const reduceMotion = useReducedMotion();
  const { sessionId } = useParams();
  const { pack, indexes } = useLanguagePack();
  const base = `/${pack.code}`;
  const data = useLiveQuery(async () => {
    if (!sessionId) return undefined;
    const session = await db.sessions.get(sessionId);
    if (!session || session.languageCode !== pack.code) return undefined;
    const attempts = await db.attempts.where("sessionId").equals(sessionId).toArray();
    return { session, attempts };
  }, [pack.code, sessionId]);

  const tier = data ? indexes.quizTiers.get(data.session.tierId) : undefined;
  useEffect(() => {
    if (!data || !tier || data.session.completed || data.attempts.length < data.session.questions.length) return;
    const score = data.attempts.filter((attempt) => attempt.correct).length;
    void completeSession(data.session, score, tier.passScore).then(() => {
      if (score >= tier.passScore) void navigator.storage?.persist?.();
    });
  }, [data, tier]);

  if (!sessionId) return <Navigate to={`${base}/learn`} replace />;
  if (!data) return <div className="page quiz-loading" role="status"><span className="spinner" /> Loading results…</div>;
  const { session, attempts } = data;
  const phraseQuiz = session.topicId === PHRASE_QUIZ_TOPIC_ID;
  const topic = phraseQuiz ? buildPhraseQuizTopic(pack) : indexes.topics.get(session.topicId);
  if (!topic || !tier) return <Navigate to={`${base}/learn`} replace />;
  const score = attempts.filter((attempt) => attempt.correct).length;
  const passed = score >= tier.passScore;
  const missed = attempts.filter((attempt) => !attempt.correct);
  const tierIndex = topic.quizTierIds.indexOf(session.tierId);
  const nextTierId = topic.quizTierIds[tierIndex + 1];
  const questionMap = new Map(session.questions.map((question) => [question.id, question]));

  return (
    <div className="page results-page">
      <motion.section className={`result-hero${passed ? " is-passed" : ""}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: [0.23, 1, 0.32, 1] }}>
        {passed ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
        <span className="quiet-label">{topic.shortTitle} · {tier.shortTitle}</span>
        <h1>{score} <small>/ {session.questions.length}</small></h1>
        <h2>{passed ? "Tier passed" : "Keep this tier open"}</h2>
        <p>{passed ? "The next kind of recall is ready." : `You need ${Math.max(0, tier.passScore - score)} more correct answers to move on.`}</p>
        <div className="result-actions">
          {passed && nextTierId ? <Link className="button" to={`${base}/topic/${topic.id}/quiz/${nextTierId}`}>Start next tier <ArrowRight aria-hidden="true" /></Link> : <Link className="button" to={phraseQuiz ? `${base}/phrases/quiz` : `${base}/topic/${topic.id}/quiz/${session.tierId}`}><RotateCcw aria-hidden="true" /> Try again</Link>}
          <Link className="button button--secondary" to={phraseQuiz ? `${base}/phrases?tab=practice` : `${base}/topic/${topic.id}?tab=checkpoint`}>Return to {phraseQuiz ? "phrases" : "topic"}</Link>
        </div>
      </motion.section>

      {missed.length ? (
        <section className="review-section" aria-labelledby="review-title">
          <div className="section-heading">
            <div><h2 id="review-title">Review the misses</h2><p>These items will be weighted first next time.</p></div>
            <Link className="button button--secondary" to={phraseQuiz ? `${base}/phrases/study?mode=focus` : `${base}/topic/${topic.id}/study?mode=focus`}>Review weak words <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ul className="review-list">
            {missed.map((attempt) => {
              const question = questionMap.get(attempt.questionId);
              return question ? <li key={attempt.id}><span lang={question.promptLanguage}>{question.prompt}</span><strong lang={question.answerLanguage}>{question.canonicalAnswer}</strong></li> : null;
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

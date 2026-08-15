import { Check, ChevronLeft, CircleX, Lightbulb, Minus, Send } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { ProgressFill } from "../components/ProgressFill";
import { topicById, type GradeResult, type QuizTier } from "../content";
import { generateQuiz, gradeAnswer, mergeRegisterQuestions, QUIZ_SIZE } from "../quiz/engine";
import { tierMeta, tierOrder } from "../quiz/meta";
import { useAppState } from "../state/AppState";
import { db, getMasteryMap, saveAttempt, type QuizSessionRecord } from "../storage/db";

const isTier = (value: string | undefined): value is QuizTier => Boolean(value && tierOrder.includes(value as QuizTier));

export function QuizPage() {
  const { topicId, tier: tierParam } = useParams();
  const topic = topicId ? topicById.get(topicId) : undefined;
  const tier = isTier(tierParam) ? tierParam : undefined;
  const { register } = useAppState();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<QuizSessionRecord | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!topic || !tier) return;
    let cancelled = false;
    void (async () => {
      const resumeId = searchParams.get("resume");
      const resumed = resumeId ? await db.sessions.get(resumeId) : undefined;
      if (resumed && !resumed.completed && !cancelled) {
        setSession(resumed);
        return;
      }
      const existing = await db.sessions
        .where("[topicId+tier]")
        .equals([topic.id, tier])
        .filter((item) => !item.completed)
        .sortBy("updatedAt")
        .then((items) => items.at(-1));
      if (existing && !cancelled) {
        setSession(existing);
        return;
      }
      const seed = Date.now() & 0x7fffffff;
      const mastery = await getMasteryMap(topic.id, register);
      const created: QuizSessionRecord = {
        id: crypto.randomUUID(),
        topicId: topic.id,
        tier,
        seed,
        questions: generateQuiz(topic, { topicId: topic.id, tier, register, seed, mastery }),
        currentIndex: 0,
        correct: 0,
        completed: false,
        startedAt: Date.now(),
        updatedAt: Date.now()
      };
      await db.sessions.put(created);
      if (!cancelled) setSession(created);
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, tier, topic]);

  useEffect(() => {
    if (!result) inputRef.current?.focus({ preventScroll: true });
  }, [result, session?.currentIndex]);

  const question = session?.questions[session.currentIndex];
  const progress = session ? session.currentIndex / QUIZ_SIZE : 0;
  const responseLabel = tier === "romaji-recall" ? "Romaji answer" : "Japanese answer";
  const inputLanguage = tier === "romaji-recall" ? "en" : "ja";

  const answer = async (value: string) => {
    if (!session || !question || submitting) return;
    if (!value.trim()) {
      setInputError(true);
      return;
    }
    setSubmitting(true);
    const graded = gradeAnswer(question, value);
    setResult(graded);
    setInputError(false);
    await saveAttempt(session, question, value, graded.status === "correct", graded.status === "near-miss");
    setSubmitting(false);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (result) void next();
    else void answer(input);
  };

  const giveUp = () => {
    if (!session || !question || submitting) return;
    setSubmitting(true);
    const graded = gradeAnswer(question, "");
    setResult(graded);
    setInputError(false);
    void saveAttempt(session, question, "", false, false).finally(() => setSubmitting(false));
  };

  const next = async () => {
    if (!session || !result || submitting || !topic || !tier) return;
    const correct = session.correct + (result.status === "correct" ? 1 : 0);
    const currentIndex = session.currentIndex + 1;
    let questions = session.questions;
    if (currentIndex < QUIZ_SIZE && session.questions[currentIndex]?.register !== register) {
      const mastery = await getMasteryMap(topic.id, register);
      const regenerated = generateQuiz(topic, { topicId: topic.id, tier, register, seed: session.seed, mastery });
      questions = mergeRegisterQuestions(session.questions, currentIndex, regenerated);
    }
    const updated = { ...session, questions, correct, currentIndex, updatedAt: Date.now() };
    setInput("");
    setResult(null);
    if (currentIndex >= QUIZ_SIZE) {
      navigate(`/results/${session.id}`, { replace: true });
      return;
    }
    await db.sessions.put(updated);
    setSession(updated);
  };

  const diff = useMemo(() => result?.diff.filter((part) => part.value) ?? [], [result]);

  if (!topic || !tier) return <Navigate to="/topics" replace />;
  if (!session || !question) {
    return <div className="page quiz-loading" role="status"><span className="spinner" /> Preparing your quiz…</div>;
  }

  return (
    <div className="page quiz-page">
      <ScreenHeader
        title={`${topic.shortTitle} · ${tierMeta[tier].shortTitle}`}
        description={`Step ${tierMeta[tier].step} of 4`}
        actions={<Link className="icon-button" to={`/topic/${topic.id}`} aria-label="Leave quiz"><ChevronLeft aria-hidden="true" /></Link>}
      />
      <div className="quiz-progress" aria-label={`Question ${session.currentIndex + 1} of 24`}>
        <span className="quiz-progress__track"><ProgressFill value={progress} /></span>
        <span>{session.currentIndex + 1} / 24</span>
        <span>{session.correct} correct</span>
      </div>

      <main className="quiz-card">
        <motion.div
          className="quiz-prompt"
          key={question.id}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(3px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: reduceMotion ? 0.1 : 0.16, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1 lang={question.promptLanguage}>{question.prompt}</h1>
          <p>{question.helper}</p>
        </motion.div>

        <form className="answer-form" onSubmit={submit}>
          <label htmlFor="quiz-answer">{responseLabel}</label>
          <div className={`answer-input${inputError ? " is-error" : ""}${result ? ` is-${result.status}` : ""}`}>
            <input
              id="quiz-answer"
              ref={inputRef}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (inputError) setInputError(false);
              }}
              lang={inputLanguage}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              readOnly={Boolean(result)}
              aria-invalid={inputError}
              aria-describedby="answer-helper"
              placeholder={tier === "romaji-recall" ? "Type romaji" : "日本語で入力"}
            />
            {result?.status === "correct" ? <Check aria-hidden="true" /> : null}
            {result && result.status !== "correct" ? <CircleX aria-hidden="true" /> : null}
          </div>
          <div id="answer-helper" className="answer-helper" aria-live="polite">
            {inputError ? "Type an answer, or choose “I don’t know.”" : " "}
          </div>

          <AnimatePresence initial={false}>
          {result ? (
            <motion.section
              className={`answer-feedback answer-feedback--${result.status}`}
              aria-live="polite"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(4px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(0px)" }}
              transition={{ duration: reduceMotion ? 0.1 : 0.16, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="answer-feedback__heading">
                {result.status === "correct" ? <Check aria-hidden="true" /> : result.status === "near-miss" ? <Minus aria-hidden="true" /> : <CircleX aria-hidden="true" />}
                <h2>{result.status === "correct" ? "Correct" : result.status === "near-miss" ? "Almost" : "Not this time"}</h2>
              </div>
              {result.status !== "correct" ? (
                <>
                  <p>The accepted answer is <strong lang={inputLanguage}>{result.canonicalAnswer}</strong>.</p>
                  {input.trim() && diff.length ? (
                    <div className="answer-diff" aria-label="Character comparison">
                      {diff.map((part, index) => <span className={`is-${part.kind}`} key={`${part.kind}-${index}`}>{part.value}</span>)}
                    </div>
                  ) : null}
                </>
              ) : <p>Your answer matches an accepted form.</p>}
            </motion.section>
          ) : null}
          </AnimatePresence>

          <div className="answer-actions">
            {result ? (
              <button className="button button--wide" type="submit" disabled={submitting}>Next question <Send aria-hidden="true" /></button>
            ) : (
              <>
                <button className="button button--secondary" type="button" onClick={giveUp} disabled={submitting}>
                  <Lightbulb aria-hidden="true" /> I don’t know
                </button>
                <button className="button" type="submit" disabled={submitting}>Check answer <Check aria-hidden="true" /></button>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

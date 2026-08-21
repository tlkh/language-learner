import { Check, ChevronLeft, CircleX, Lightbulb, Minus, Send } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProgressFill } from "../components/ProgressFill";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguagePack } from "../languages/LanguagePackContext";
import type { GradeResult } from "../languages";
import { mergeVariantQuestions } from "../quiz/engine";
import { buildPhraseQuizTopic, getPhraseQuizTier } from "../quiz/phrases";
import { db, getCorrectQuestionIds, getMasteryMap, saveAttempt, type QuizSessionRecord } from "../storage/db";

export function QuizPage({ source = "topic" }: { source?: "topic" | "phrases" }) {
  const { topicId, tierId } = useParams();
  const { pack, indexes, variantId } = useLanguagePack();
  const base = `/${pack.code}`;
  const phraseTopic = useMemo(() => source === "phrases" ? buildPhraseQuizTopic(pack) : undefined, [pack, source]);
  const topic = source === "phrases" ? phraseTopic : topicId ? indexes.topics.get(topicId) : undefined;
  const tier = source === "phrases" ? getPhraseQuizTier(pack) : tierId ? indexes.quizTiers.get(tierId) : undefined;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<QuizSessionRecord | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const question = session?.questions[session.currentIndex];

  useEffect(() => {
    if (!topic || !tier) return;
    let cancelled = false;
    void (async () => {
      const resumeId = searchParams.get("resume");
      const resumed = resumeId ? await db.sessions.get(resumeId) : undefined;
      if (resumed && resumed.languageCode === pack.code && resumed.topicId === topic.id && resumed.tierId === tier.id && !resumed.completed && !cancelled) {
        setSession(resumed);
        return;
      }
      const existing = await db.sessions
        .where("[languageCode+topicId+tierId+variantId]")
        .equals([pack.code, topic.id, tier.id, variantId])
        .filter((item) => !item.completed)
        .sortBy("updatedAt")
        .then((items) => items.at(-1));
      if (existing && !cancelled) {
        setSession(existing);
        return;
      }
      const seed = Date.now() & 0x7fffffff;
      const [mastery, correctQuestionIds] = await Promise.all([
        getMasteryMap(pack.code, topic.id, tier.id, variantId),
        getCorrectQuestionIds(pack.code, topic.id, tier.id, variantId)
      ]);
      const created: QuizSessionRecord = {
        id: crypto.randomUUID(),
        languageCode: pack.code,
        topicId: topic.id,
        tierId: tier.id,
        variantId,
        seed,
        questions: pack.quiz.generate(topic, {
          languageCode: pack.code,
          topicId: topic.id,
          tierId: tier.id,
          variantId,
          seed,
          count: tier.sessionSize,
          mastery,
          correctQuestionIds
        }),
        currentIndex: 0,
        correct: 0,
        completed: false,
        startedAt: Date.now(),
        updatedAt: Date.now()
      };
      await db.sessions.put(created);
      if (!cancelled) setSession(created);
    })();
    return () => { cancelled = true; };
  }, [pack, searchParams, tier, topic]);

  useEffect(() => {
    if (!result && question?.kind !== "choice") inputRef.current?.focus({ preventScroll: true });
  }, [question?.kind, result, session?.currentIndex]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const updateKeyboardInset = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardInset(inset > 96 ? inset : 0);
    };
    updateKeyboardInset();
    viewport.addEventListener("resize", updateKeyboardInset);
    viewport.addEventListener("scroll", updateKeyboardInset);
    return () => {
      viewport.removeEventListener("resize", updateKeyboardInset);
      viewport.removeEventListener("scroll", updateKeyboardInset);
    };
  }, []);

  const sessionSize = session?.questions.length ?? tier?.sessionSize ?? 0;
  const progress = sessionSize && session ? session.currentIndex / sessionSize : 0;

  const answer = async (value: string) => {
    if (!session || !question || submitting) return;
    if (!value.trim()) {
      setInputError(true);
      return;
    }
    setSubmitting(true);
    const graded = pack.quiz.grade(question, value);
    setResult(graded);
    setInputError(false);
    await saveAttempt(session, question, value, graded.status === "correct", graded.status === "near-miss", indexes.sharedVocabularyIds.has(question.sourceId));
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
    const graded = pack.quiz.grade(question, "");
    setResult(graded);
    setInputError(false);
    void saveAttempt(session, question, "", false, false, indexes.sharedVocabularyIds.has(question.sourceId)).finally(() => setSubmitting(false));
  };

  const next = async () => {
    if (!session || !result || submitting || !topic || !tier) return;
    const correct = session.correct + (result.status === "correct" ? 1 : 0);
    const currentIndex = session.currentIndex + 1;
    let questions = session.questions;
    if (currentIndex < sessionSize && session.variantId !== variantId) {
      const [mastery, correctQuestionIds] = await Promise.all([
        getMasteryMap(pack.code, topic.id, tier.id, variantId),
        getCorrectQuestionIds(pack.code, topic.id, tier.id, variantId)
      ]);
      const regenerated = pack.quiz.generate(topic, {
        languageCode: pack.code,
        topicId: topic.id,
        tierId: tier.id,
        variantId,
        seed: session.seed,
        count: tier.sessionSize,
        mastery,
        correctQuestionIds
      });
      questions = mergeVariantQuestions(session.questions, currentIndex, regenerated, sessionSize, (value) => pack.normalizeRepresentation("target", value));
    }
    const updated = { ...session, questions, variantId, correct, currentIndex, updatedAt: Date.now() };
    setInput("");
    setResult(null);
    if (currentIndex >= sessionSize) {
      await db.sessions.put(updated);
      navigate(`${base}/results/${session.id}`, { replace: true });
      return;
    }
    await db.sessions.put(updated);
    setSession(updated);
  };

  const diff = useMemo(() => result?.diff.filter((part) => part.value) ?? [], [result]);

  if (!topic || !tier) return <Navigate to={source === "phrases" ? `${base}/phrases` : `${base}/topics`} replace />;
  if (!session || !question) return <div className="page quiz-loading" role="status"><span className="spinner" /> Preparing your quiz…</div>;

  return (
    <div
      className={`page quiz-page${keyboardInset ? " quiz-page--keyboard" : ""}`}
      style={{ "--keyboard-inset": `${keyboardInset}px` } as CSSProperties}
    >
      <ScreenHeader
        title={`${topic.shortTitle} · ${tier.shortTitle}`}
        description={source === "phrases" ? "Essential phrase quiz" : `Step ${tier.step} of ${pack.quiz.tiers.length}`}
        leading={<Link className="icon-button" to={source === "phrases" ? `${base}/phrases?tab=practice` : `${base}/topic/${topic.id}?tab=checkpoint`} aria-label="Leave quiz"><ChevronLeft aria-hidden="true" /></Link>}
      />
      <div className="quiz-progress" aria-label={`Question ${session.currentIndex + 1} of ${sessionSize}`}>
        <span className="quiz-progress__track"><ProgressFill value={progress} /></span>
        <span>{session.currentIndex + 1} / {sessionSize}</span>
        <span>{session.correct} correct</span>
      </div>

      <main className="quiz-card">
        <motion.div className="quiz-prompt" key={question.id} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(3px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: reduceMotion ? 0.1 : 0.16, ease: [0.23, 1, 0.32, 1] }}>
          <h1 lang={question.promptLanguage}>{question.prompt}</h1>
          {question.promptReading && question.promptReading !== question.prompt ? <span className="quiz-prompt__reading" lang={question.promptLanguage}>{question.promptReading}</span> : null}
          <p>{question.helper}</p>
        </motion.div>

        <form className="answer-form" onSubmit={submit}>
          {question.kind === "choice" ? (
            <fieldset className="quiz-choices" aria-describedby="answer-helper">
              <legend>{question.answerLabel}</legend>
              {question.options?.map((option) => {
                const selected = input === option.id;
                const correct = result && option.id === question.correctOptionId;
                const incorrect = result && selected && !correct;
                return (
                  <button
                    className={`${selected ? "is-selected" : ""}${correct ? " is-correct" : ""}${incorrect ? " is-incorrect" : ""}`}
                    type="button"
                    key={option.id}
                    aria-pressed={selected}
                    disabled={Boolean(result) || submitting}
                    onClick={() => { setInput(option.id); setInputError(false); }}
                  >
                    <span lang={option.language}>{option.text}</span>
                    {option.reading && option.reading !== option.text ? <small lang={option.language}>{option.reading}</small> : null}
                    {correct ? <Check aria-hidden="true" /> : incorrect ? <CircleX aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </fieldset>
          ) : (
            <>
              <label htmlFor="quiz-answer">{question.answerLabel}</label>
              <div className={`answer-input${inputError ? " is-error" : ""}${result ? ` is-${result.status}` : ""}`}>
                <input id="quiz-answer" ref={inputRef} value={input} onChange={(event) => { setInput(event.target.value); if (inputError) setInputError(false); }} lang={question.answerLanguage} autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" readOnly={Boolean(result)} aria-invalid={inputError} aria-describedby="answer-helper" placeholder={question.answerPlaceholder} />
                {result?.status === "correct" ? <Check aria-hidden="true" /> : null}
                {result && result.status !== "correct" ? <CircleX aria-hidden="true" /> : null}
              </div>
            </>
          )}
          <div id="answer-helper" className="answer-helper" aria-live="polite">{inputError ? `${question.kind === "choice" ? "Choose" : "Type"} an answer, or choose “I don’t know.”` : " "}</div>

          <AnimatePresence initial={false}>
            {result ? (
              <motion.section className={`answer-feedback answer-feedback--${result.status}`} aria-live="polite" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(4px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.16, ease: [0.23, 1, 0.32, 1] }}>
                <div className="answer-feedback__heading">
                  {result.status === "correct" ? <Check aria-hidden="true" /> : result.status === "near-miss" ? <Minus aria-hidden="true" /> : <CircleX aria-hidden="true" />}
                  <h2>{result.status === "correct" ? "Correct" : result.status === "near-miss" ? "Almost" : "Not this time"}</h2>
                </div>
                {result.status !== "correct" ? <><p>The accepted answer is <strong lang={question.answerLanguage}>{result.canonicalAnswer}</strong>.</p>{input.trim() && diff.length ? <div className="answer-diff" aria-label="Character comparison">{diff.map((part, index) => <span className={`is-${part.kind}`} key={`${part.kind}-${index}`}>{part.value}</span>)}</div> : null}</> : <p>{question.kind === "choice" ? "That is the right choice." : "Your answer matches an accepted form."}</p>}
                {question.explanation ? <p className="answer-feedback__explanation">{question.explanation}</p> : null}
              </motion.section>
            ) : null}
          </AnimatePresence>

          <div className="answer-actions">
            {result ? <button className="button button--wide" type="submit" disabled={submitting}>Next question <Send aria-hidden="true" /></button> : <><button className="button button--secondary" type="button" onClick={giveUp} disabled={submitting}><Lightbulb aria-hidden="true" /> I don’t know</button><button className="button" type="submit" disabled={submitting}>Check answer <Check aria-hidden="true" /></button></>}
          </div>
        </form>
      </main>
    </div>
  );
}

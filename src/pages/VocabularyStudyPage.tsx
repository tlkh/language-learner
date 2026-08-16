import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getVocabularyForm, type VocabularyEntry, type VocabularyPriority } from "../languages";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { db, recordStudyCardShown, recordStudyOutcome } from "../storage/db";
import {
  aggregateVocabularyReviewSignals,
  selectStudyQueue,
  type StudyMode
} from "../study/queue";

const SWIPE_THRESHOLD = 72;
const FOCUS_LIMIT = 12;

interface CardTransition {
  direction: -1 | 0 | 1;
  velocity: number;
  reduced: boolean;
}

type FocusOutcome = "recalled" | "unresolved";

const cardVariants = {
  enter: ({ direction, reduced }: CardTransition) => ({
    x: reduced ? 0 : `${direction * 100}%`,
    opacity: reduced ? 0 : 1
  }),
  center: { x: 0, opacity: 1 },
  exit: ({ direction, reduced }: CardTransition) => ({
    x: reduced ? 0 : `${direction * -100}%`,
    opacity: reduced ? 0 : 1
  })
};

export function projectedSwipeOffset(offset: number, velocity: number, decelerationRate = 0.99) {
  return offset + (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

export function VocabularyStudyPage({ source = "topic" }: { source?: "topic" | "phrases" }) {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reduceMotion = Boolean(useReducedMotion());
  const { pack, indexes, variantId } = useLanguagePack();
  const basePath = `/${pack.code}`;
  const mode: StudyMode = searchParams.get("mode") === "all" ? "all" : "focus";
  const phraseSet = source === "phrases" ? pack.sharedVocabularySets[0] : undefined;
  const topic = source === "topic" && topicId ? indexes.topics.get(topicId) : undefined;
  const sceneId = searchParams.get("scene");
  const selectedScene = sceneId ? topic?.scenes.find((scene) => scene.id === sceneId) : undefined;
  const priorityParam = searchParams.get("priority");
  const priority = (["must-know", "useful", "reference"] as VocabularyPriority[]).includes(priorityParam as VocabularyPriority)
    ? priorityParam as VocabularyPriority
    : undefined;
  const candidateVocabulary = useMemo(() => phraseSet?.vocabulary ?? topic?.vocabulary.filter((entry) =>
    entry.tags.includes("domain") &&
    (!selectedScene || entry.primarySceneId === selectedScene.id) &&
    (!priority || entry.priority === priority)
  ) ?? [], [phraseSet, priority, selectedScene, topic]);
  const candidateKey = candidateVocabulary.map((entry) => entry.id).join("|");
  const quizTierKey = pack.quiz.tiers.map((tier) => tier.id).join("|");
  const studyScopeId = phraseSet ? `phrases:${phraseSet.id}` : `topic:${topic?.id ?? "unknown"}`;
  const studyData = useLiveQuery(async () => {
    if (mode === "all" || !candidateVocabulary.length) return { mastery: [], progress: [] };
    const sourceIds = new Set(candidateVocabulary.map((entry) => entry.id));
    const tierIds = new Set(pack.quiz.tiers.map((tier) => tier.id));
    const [mastery, progress] = await Promise.all([
      db.mastery
        .where("languageCode")
        .equals(pack.code)
        .filter((record) => record.variantId === variantId && tierIds.has(record.tierId) && sourceIds.has(record.sourceId))
        .toArray(),
      db.studyProgress
        .where("[languageCode+scopeId]")
        .equals([pack.code, studyScopeId])
        .filter((record) => sourceIds.has(record.sourceId))
        .toArray()
    ]);
    return { mastery, progress };
  }, [candidateKey, mode, pack.code, quizTierKey, studyScopeId, variantId]);
  const reviewSignals = useMemo(
    () => aggregateVocabularyReviewSignals(studyData?.mastery ?? []),
    [studyData?.mastery]
  );
  const previouslyShown = useMemo(
    () => new Set(studyData?.progress.map((record) => record.sourceId) ?? []),
    [studyData?.progress]
  );
  const baseQueue = useMemo(() => mode === "all"
    ? candidateVocabulary
    : studyData === undefined
      ? []
      : selectStudyQueue(candidateVocabulary, reviewSignals, FOCUS_LIMIT, previouslyShown),
  [candidateVocabulary, mode, previouslyShown, reviewSignals, studyData]);
  const selectionKey = `${source}:${topicId ?? ""}:${sceneId ?? ""}:${priority ?? ""}:${mode}:${candidateKey}`;
  const [queue, setQueue] = useState<VocabularyEntry[]>(baseQueue);
  const [queueKey, setQueueKey] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [requeued, setRequeued] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<Map<string, FocusOutcome>>(new Map());
  const [completed, setCompleted] = useState(false);
  const [cardTransition, setCardTransition] = useState<CardTransition>({ direction: 0, velocity: 0, reduced: reduceMotion });
  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const restoreCardFocus = useRef(false);
  const shownThisRound = useRef(new Set<string>());
  const activeQueue = queueKey === selectionKey ? queue : baseQueue;
  const activeEntry = activeQueue[index];

  const returnTo = phraseSet
    ? `${basePath}/phrases?tab=practice`
    : topic
    ? selectedScene
      ? `${basePath}/topic/${topic.id}/scene/${selectedScene.id}#vocabulary-title`
      : `${basePath}/topic/${topic.id}#vocabulary-title`
    : `${basePath}/topics`;

  useEffect(() => {
    if (mode === "focus" && studyData === undefined) return;
    if (queueKey === selectionKey) return;
    setQueue(baseQueue);
    setQueueKey(selectionKey);
    setIndex(0);
    setFlipped(false);
    setRequeued(new Set());
    setOutcomes(new Map());
    setCompleted(false);
    shownThisRound.current = new Set();
    setCardTransition({ direction: 0, velocity: 0, reduced: reduceMotion });
  }, [baseQueue, mode, queueKey, reduceMotion, selectionKey, studyData]);

  useEffect(() => {
    if (mode !== "focus" || !activeEntry || shownThisRound.current.has(activeEntry.id)) return;
    shownThisRound.current.add(activeEntry.id);
    void recordStudyCardShown(pack.code, studyScopeId, activeEntry.id);
  }, [activeEntry, mode, pack.code, studyScopeId]);

  const move = useCallback((delta: -1 | 1, velocity = 0, restoreFocus = false) => {
    const target = Math.min(Math.max(index + delta, 0), activeQueue.length - 1);
    if (target === index) return;
    restoreCardFocus.current = restoreFocus;
    setCardTransition({ direction: delta, velocity, reduced: reduceMotion });
    setIndex(target);
    setFlipped(false);
  }, [activeQueue.length, index, reduceMotion]);

  const rateFocusCard = useCallback((rating: "again" | "got-it") => {
    const current = activeQueue[index];
    if (mode !== "focus" || !flipped || !current) return;

    restoreCardFocus.current = true;
    setCardTransition({ direction: 1, velocity: 0, reduced: reduceMotion });
    setFlipped(false);

    if (rating === "again" && !requeued.has(current.id)) {
      setRequeued((items) => new Set(items).add(current.id));
      setQueue((items) => [...items, current]);
      setIndex((currentIndex) => currentIndex + 1);
      return;
    }

    setOutcomes((items) => {
      const next = new Map(items);
      const outcome = rating === "got-it" ? "recalled" : "unresolved";
      next.set(current.id, outcome);
      void recordStudyOutcome(pack.code, studyScopeId, current.id, outcome);
      return next;
    });
    if (index >= activeQueue.length - 1) setCompleted(true);
    else setIndex((currentIndex) => currentIndex + 1);
  }, [activeQueue, flipped, index, mode, pack.code, reduceMotion, requeued, studyScopeId]);

  const resetFocusRound = useCallback(() => {
    setQueue(baseQueue);
    setQueueKey(selectionKey);
    setIndex(0);
    setFlipped(false);
    setRequeued(new Set());
    setOutcomes(new Map());
    setCompleted(false);
    shownThisRound.current = new Set();
    setCardTransition({ direction: 0, velocity: 0, reduced: reduceMotion });
  }, [baseQueue, reduceMotion, selectionKey]);

  useEffect(() => {
    if (!restoreCardFocus.current || completed) return;
    restoreCardFocus.current = false;
    requestAnimationFrame(() => cardButtonRef.current?.focus());
  }, [completed, index]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const interactiveTarget = target instanceof HTMLElement ? target.closest("button, a, input, textarea, select") : null;
      const studyCardTarget = target instanceof HTMLElement ? target.closest(".study-card") : null;
      if (interactiveTarget && !studyCardTarget) return;
      if (mode === "all" && event.key === "ArrowRight") {
        event.preventDefault();
        move(1, 0, true);
      } else if (mode === "all" && event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1, 0, true);
      } else if (mode === "focus" && !studyCardTarget && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setFlipped((current) => !current);
      } else if (mode === "focus" && event.key === "1") {
        event.preventDefault();
        rateFocusCard("again");
      } else if (mode === "focus" && event.key === "2") {
        event.preventDefault();
        rateFocusCard("got-it");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, move, rateFocusCard]);

  if (source === "phrases" && !phraseSet) return <Navigate to={`${basePath}/topics`} replace />;
  if (source === "topic" && !topic) return <Navigate to={`${basePath}/topics`} replace />;
  if (sceneId && !selectedScene) return <Navigate to={topic ? `${basePath}/topic/${topic.id}` : returnTo} replace />;
  if (!candidateVocabulary.length) return <Navigate to={returnTo} replace />;
  if (!activeQueue.length) return <main className="page quiz-loading" role="status"><span className="spinner" /> Preparing a short review…</main>;

  const scopeLabel = phraseSet?.title ?? selectedScene?.title ?? (priority ? `${priority.replace("-", " ")} words` : "Topic vocabulary");
  const contextLabel = phraseSet ? "Essential phrases" : topic?.shortTitle ?? pack.name;
  const recalledCount = [...outcomes.values()].filter((outcome) => outcome === "recalled").length;
  const unresolvedCount = [...outcomes.values()].filter((outcome) => outcome === "unresolved").length;
  const resolvedCount = outcomes.size;
  const progress = mode === "focus" ? resolvedCount / baseQueue.length : (index + 1) / activeQueue.length;
  const progressNow = mode === "focus" ? resolvedCount : index + 1;
  const progressMin = mode === "focus" ? 0 : 1;

  if (completed) {
    return (
      <main className="study-page" aria-labelledby="study-complete-title">
        <header className="study-header">
          <Link className="icon-button" to={returnTo} aria-label="Close vocabulary study"><ArrowLeft aria-hidden="true" /></Link>
          <div><span>{contextLabel}</span><h1>{scopeLabel}</h1></div>
          <span className="study-count">{baseQueue.length} cards</span>
          <span className="study-progress" role="progressbar" aria-label="Review complete" aria-valuemin={0} aria-valuemax={baseQueue.length} aria-valuenow={baseQueue.length}>
            <span style={{ transform: "scaleX(1)" }} />
          </span>
        </header>
        <section className="study-complete">
          <Check aria-hidden="true" />
          <span className="quiet-label">Short review finished</span>
          <h1 id="study-complete-title">Round complete</h1>
          <p>{unresolvedCount
            ? `${unresolvedCount} ${unresolvedCount === 1 ? "word still needs" : "words still need"} practice. Quiz answers—not this round—remain your saved mastery record.`
            : "You recalled every card in this round. Quiz answers remain your saved mastery record."}</p>
          <dl className="study-summary">
            <div><dt>Recalled</dt><dd>{recalledCount}</dd></div>
            <div><dt>Unresolved</dt><dd>{unresolvedCount}</dd></div>
            <div><dt>Extra passes</dt><dd>{requeued.size}</dd></div>
          </dl>
          <div className="result-actions">
            <button className="button" type="button" onClick={resetFocusRound}><RotateCw aria-hidden="true" /> Repeat round</button>
            <Link className="button button--secondary" to={returnTo}>Return to {phraseSet ? "phrases" : "topic"}</Link>
          </div>
        </section>
      </main>
    );
  }

  const entry = activeEntry;
  const form = getVocabularyForm(entry, variantId);
  const definitions = pack.defineVocabulary?.(topic, entry) ?? {
    target: form.representations.target,
    source: entry.meanings.join(" · ")
  };
  const target = form.representations.target;
  const reading = form.representations.reading;
  const romanization = form.representations.romanization;
  const countLabel = mode === "focus" ? `${resolvedCount} / ${baseQueue.length}` : `${index + 1} / ${activeQueue.length}`;
  const countAria = mode === "focus"
    ? `${resolvedCount} of ${baseQueue.length} cards resolved`
    : `Card ${index + 1} of ${activeQueue.length}`;

  const front = (
    <div className="study-card__face study-card__face--front" lang={pack.locale}>
      <span className="study-card__eyebrow">{pack.nativeName}</span>
      <div className="study-card__term">
        <strong>{target}</strong>
        {reading && reading !== target ? <span>{reading}</span> : null}
      </div>
      <p>{definitions.target}</p>
      <span className="study-card__flip-hint"><RotateCw aria-hidden="true" /> Tap to flip</span>
    </div>
  );

  const back = (
    <div className="study-card__face study-card__face--back">
      <span className="study-card__eyebrow">Paired translation</span>
      <div className="study-card__pairs">
        <div><span>Word</span><strong lang={pack.locale}>{target}</strong></div>
        <div><span>Meaning</span><strong>{entry.meanings.join(" · ")}</strong></div>
        {reading ? <div><span>Reading</span><strong lang={pack.locale}>{reading}</strong></div> : null}
        {romanization ? <div><span>Romanization</span><strong>{romanization}</strong></div> : null}
      </div>
      <div className="study-card__english-definition"><span>Definition</span><p>{definitions.source}</p></div>
      <span className="study-card__flip-hint"><RotateCw aria-hidden="true" /> Tap to see {pack.name}</span>
    </div>
  );

  return (
    <main className="study-page" aria-labelledby="study-title">
      <header className="study-header">
        <Link className="icon-button" to={returnTo} aria-label="Close vocabulary study"><ArrowLeft aria-hidden="true" /></Link>
        <div><span>{contextLabel}</span><h1 id="study-title">{scopeLabel}</h1></div>
        <span className="study-count" aria-label={countAria}>{countLabel}</span>
        <span className="study-progress" role="progressbar" aria-valuemin={progressMin} aria-valuemax={mode === "focus" ? baseQueue.length : activeQueue.length} aria-valuenow={progressNow}>
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </header>

      <section className="study-deck" aria-label="Vocabulary flashcards">
        <div className="study-card-stack" aria-hidden="true" />
        <AnimatePresence initial={false} custom={cardTransition}>
          <motion.div
            className="study-card-motion"
            key={`${entry.id}-${index}`}
            custom={cardTransition}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduceMotion
              ? { duration: 0.12 }
              : { type: "spring", stiffness: 520, damping: 52, mass: 1, velocity: cardTransition.velocity }}
            drag={mode === "all" && !reduceMotion ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: index < activeQueue.length - 1 ? 0.64 : 0.12, right: index > 0 ? 0.64 : 0.12 }}
            dragMomentum={false}
            dragDirectionLock
            onDragEnd={(_, info) => {
              if (mode !== "all") return;
              const projected = projectedSwipeOffset(info.offset.x, info.velocity.x);
              if (projected <= -SWIPE_THRESHOLD) move(1, info.velocity.x);
              else if (projected >= SWIPE_THRESHOLD) move(-1, info.velocity.x);
            }}
          >
            <button
              ref={cardButtonRef}
              className="study-card"
              type="button"
              aria-pressed={flipped}
              aria-label={`${flipped ? "Translation" : pack.name} side for ${target}. Tap to flip.`}
              onClick={() => setFlipped((current) => !current)}
            >
              <div className="study-card__content">{flipped ? back : front}</div>
            </button>
          </motion.div>
        </AnimatePresence>
        <p className="study-announcement sr-only" aria-live="polite">
          {mode === "focus" ? `${resolvedCount} of ${baseQueue.length} resolved.` : `Card ${index + 1} of ${activeQueue.length}.`} {flipped ? "Translation side." : `${pack.name} side.`}
        </p>
      </section>

      <footer className="study-controls">
        {mode === "all" ? (
          <>
            <div className="study-swipe-hints" aria-hidden="true">
              <span className={index === 0 ? "is-muted" : undefined}><ChevronLeft /> Swipe right</span>
              <span className={index === activeQueue.length - 1 ? "is-muted" : undefined}>Swipe left <ChevronRight /></span>
            </div>
            <div className="study-control-bar">
              <button className="icon-button" type="button" disabled={index === 0} onClick={() => move(-1)} aria-label="Previous card"><ChevronLeft aria-hidden="true" /></button>
              <button className="study-flip-button" type="button" onClick={() => setFlipped((current) => !current)}><RotateCw aria-hidden="true" /> Flip</button>
              {index === activeQueue.length - 1 ? (
                <button className="icon-button" type="button" onClick={() => navigate(returnTo)} aria-label="Finish vocabulary study"><Check aria-hidden="true" /></button>
              ) : (
                <button className="icon-button" type="button" onClick={() => move(1)} aria-label="Next card"><ChevronRight aria-hidden="true" /></button>
              )}
            </div>
            <small>Arrow keys move between cards · Enter or Space flips</small>
          </>
        ) : (
          <>
            <div className={`study-control-bar study-control-bar--focus${flipped ? " is-rating" : ""}`}>
              {flipped ? (
                <>
                  <button className="button button--secondary" type="button" onClick={() => rateFocusCard("again")}>Again</button>
                  <button className="button" type="button" onClick={() => rateFocusCard("got-it")}><Check aria-hidden="true" /> Got it</button>
                </>
              ) : (
                <button className="study-flip-button" type="button" onClick={() => setFlipped(true)}><RotateCw aria-hidden="true" /> Flip to answer</button>
              )}
            </div>
            <small>Enter or Space flips · 1 Again · 2 Got it</small>
          </>
        )}
      </footer>
    </main>
  );
}

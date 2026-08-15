import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { topicById } from "../content";
import { definitionsForVocabulary } from "../content/definitions";
import { formFor } from "../content/helpers";
import type { VocabularyPriority } from "../content/types";
import { useAppState } from "../state/AppState";

const SWIPE_THRESHOLD = 72;

interface CardTransition {
  direction: -1 | 0 | 1;
  velocity: number;
  reduced: boolean;
}

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

export function VocabularyStudyPage() {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reduceMotion = Boolean(useReducedMotion());
  const { register } = useAppState();
  const topic = topicId ? topicById.get(topicId) : undefined;
  const sceneId = searchParams.get("scene");
  const selectedScene = sceneId ? topic?.scenes.find((scene) => scene.id === sceneId) : undefined;
  const priorityParam = searchParams.get("priority");
  const priority = (["must-know", "useful", "reference"] as VocabularyPriority[]).includes(priorityParam as VocabularyPriority)
    ? priorityParam as VocabularyPriority
    : undefined;
  const vocabulary = useMemo(() => topic?.vocabulary.filter((entry) =>
    entry.tags.includes("domain") &&
    (!selectedScene || entry.primarySceneId === selectedScene.id) &&
    (!priority || entry.priority === priority)
  ) ?? [], [priority, selectedScene, topic]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardTransition, setCardTransition] = useState<CardTransition>({ direction: 0, velocity: 0, reduced: reduceMotion });
  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const restoreCardFocus = useRef(false);

  const returnTo = topic
    ? selectedScene
      ? `/topic/${topic.id}/scene/${selectedScene.id}#vocabulary-title`
      : `/topic/${topic.id}#vocabulary-title`
    : "/topics";

  const move = useCallback((delta: -1 | 1, velocity = 0, restoreFocus = false) => {
    const target = Math.min(Math.max(index + delta, 0), vocabulary.length - 1);
    if (target === index) return;
    restoreCardFocus.current = restoreFocus;
    setCardTransition({ direction: delta, velocity, reduced: reduceMotion });
    setIndex(target);
    setFlipped(false);
  }, [index, reduceMotion, vocabulary.length]);

  useEffect(() => {
    if (!restoreCardFocus.current) return;
    restoreCardFocus.current = false;
    requestAnimationFrame(() => cardButtonRef.current?.focus());
  }, [index]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1, 0, true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1, 0, true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  if (!topic) return <Navigate to="/topics" replace />;
  if (sceneId && !selectedScene) return <Navigate to={`/topic/${topic.id}`} replace />;
  if (!vocabulary.length) return <Navigate to={returnTo} replace />;

  const entry = vocabulary[index];
  const form = formFor(entry, register);
  const definitions = definitionsForVocabulary(topic, entry);
  const progress = (index + 1) / vocabulary.length;
  const scopeLabel = selectedScene?.title ?? (priority ? `${priority.replace("-", " ")} words` : "Topic vocabulary");
  const flipDirection = flipped ? 1 : -1;

  const front = (
    <div
      className="study-card__face study-card__face--front"
      lang="ja"
    >
      <span className="study-card__eyebrow">日本語</span>
      <div className="study-card__term">
        <strong>{form.kanji ?? form.kana}</strong>
        {form.kanji && form.kanji !== form.kana ? <span>{form.kana}</span> : null}
      </div>
      <p>{definitions.japanese}</p>
      <span className="study-card__flip-hint"><RotateCw aria-hidden="true" /> タップして裏返す</span>
    </div>
  );

  const back = (
    <div
      className="study-card__face study-card__face--back"
    >
      <span className="study-card__eyebrow">Paired translation</span>
      <div className="study-card__pairs">
        <div><span>Word</span><strong lang="ja">{form.kanji ?? form.kana}</strong></div>
        <div><span>Meaning</span><strong>{entry.meanings.join(" · ")}</strong></div>
        <div><span>Kana</span><strong lang="ja">{form.kana}</strong></div>
        <div><span>Romaji</span><strong>{form.romaji}</strong></div>
      </div>
      <div className="study-card__english-definition"><span>Definition</span><p>{definitions.english}</p></div>
      <span className="study-card__flip-hint"><RotateCw aria-hidden="true" /> Tap to see Japanese</span>
    </div>
  );

  return (
    <main className="study-page" aria-labelledby="study-title">
      <header className="study-header">
        <Link className="icon-button" to={returnTo} aria-label="Close vocabulary study"><ArrowLeft aria-hidden="true" /></Link>
        <div><span>{topic.shortTitle}</span><h1 id="study-title">{scopeLabel}</h1></div>
        <span className="study-count" aria-label={`Card ${index + 1} of ${vocabulary.length}`}>{index + 1} / {vocabulary.length}</span>
        <span className="study-progress" role="progressbar" aria-valuemin={1} aria-valuemax={vocabulary.length} aria-valuenow={index + 1}>
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </header>

      <section className="study-deck" aria-label="Vocabulary flashcards">
        <div className="study-card-stack" aria-hidden="true" />
        <AnimatePresence initial={false} custom={cardTransition}>
          <motion.div
            className="study-card-motion"
            key={entry.id}
            custom={cardTransition}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduceMotion
              ? { duration: 0.12 }
              : { type: "spring", stiffness: 520, damping: 52, mass: 1, velocity: cardTransition.velocity }}
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: index < vocabulary.length - 1 ? 0.64 : 0.12, right: index > 0 ? 0.64 : 0.12 }}
            dragMomentum={false}
            dragDirectionLock
            onDragEnd={(_, info) => {
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
              aria-label={`${flipped ? "Translation" : "Japanese"} side for ${form.kanji ?? form.kana}. Tap to flip.`}
              onClick={() => setFlipped((current) => !current)}
            >
              {reduceMotion ? (
                <div className="study-card__rotor study-card__rotor--reduced">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      className="study-card__reduced-face"
                      key={flipped ? "back" : "front"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      {flipped ? back : front}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="study-card__rotor">
                  <AnimatePresence initial={false} custom={flipDirection}>
                    <motion.div
                      className="study-card__fold-face"
                      key={flipped ? "back" : "front"}
                      custom={flipDirection}
                      variants={{
                        enter: (direction: number) => ({ rotateY: direction * 88, opacity: 0.5 }),
                        center: { rotateY: 0, opacity: 1 },
                        exit: (direction: number) => ({ rotateY: direction * -88, opacity: 0.42 })
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 420, damping: 42, mass: 1 }}
                    >
                      {flipped ? back : front}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </button>
          </motion.div>
        </AnimatePresence>
        <p className="study-announcement sr-only" aria-live="polite">Card {index + 1} of {vocabulary.length}. {flipped ? "Translation side." : "Japanese side."}</p>
      </section>

      <footer className="study-controls">
        <div className="study-swipe-hints" aria-hidden="true">
          <span className={index === 0 ? "is-muted" : undefined}><ChevronLeft /> Swipe right</span>
          <span className={index === vocabulary.length - 1 ? "is-muted" : undefined}>Swipe left <ChevronRight /></span>
        </div>
        <div className="study-control-bar">
          <button className="icon-button" type="button" disabled={index === 0} onClick={() => move(-1)} aria-label="Previous card"><ChevronLeft aria-hidden="true" /></button>
          <button className="study-flip-button" type="button" onClick={() => setFlipped((current) => !current)}><RotateCw aria-hidden="true" /> Flip</button>
          {index === vocabulary.length - 1 ? (
            <button className="icon-button" type="button" onClick={() => navigate(returnTo)} aria-label="Finish vocabulary study"><Check aria-hidden="true" /></button>
          ) : (
            <button className="icon-button" type="button" onClick={() => move(1)} aria-label="Next card"><ChevronRight aria-hidden="true" /></button>
          )}
        </div>
        <small>Arrow keys move between cards · Enter or Space flips</small>
      </footer>
    </main>
  );
}

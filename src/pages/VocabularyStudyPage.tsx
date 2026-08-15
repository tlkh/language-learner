import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getVocabularyForm, type VocabularyPriority } from "../languages";
import { useLanguagePack } from "../languages/LanguagePackContext";

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

export function VocabularyStudyPage({ source = "topic" }: { source?: "topic" | "phrases" }) {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reduceMotion = Boolean(useReducedMotion());
  const { pack, indexes, variantId } = useLanguagePack();
  const basePath = `/${pack.code}`;
  const phraseSet = source === "phrases" ? pack.sharedVocabularySets[0] : undefined;
  const topic = source === "topic" && topicId ? indexes.topics.get(topicId) : undefined;
  const sceneId = searchParams.get("scene");
  const selectedScene = sceneId ? topic?.scenes.find((scene) => scene.id === sceneId) : undefined;
  const priorityParam = searchParams.get("priority");
  const priority = (["must-know", "useful", "reference"] as VocabularyPriority[]).includes(priorityParam as VocabularyPriority)
    ? priorityParam as VocabularyPriority
    : undefined;
  const vocabulary = useMemo(() => phraseSet?.vocabulary ?? topic?.vocabulary.filter((entry) =>
    entry.tags.includes("domain") &&
    (!selectedScene || entry.primarySceneId === selectedScene.id) &&
    (!priority || entry.priority === priority)
  ) ?? [], [phraseSet, priority, selectedScene, topic]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardTransition, setCardTransition] = useState<CardTransition>({ direction: 0, velocity: 0, reduced: reduceMotion });
  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const restoreCardFocus = useRef(false);

  const returnTo = phraseSet
    ? `${basePath}/phrases`
    : topic
    ? selectedScene
      ? `${basePath}/topic/${topic.id}/scene/${selectedScene.id}#vocabulary-title`
      : `${basePath}/topic/${topic.id}#vocabulary-title`
    : `${basePath}/topics`;

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

  if (source === "phrases" && !phraseSet) return <Navigate to={`${basePath}/topics`} replace />;
  if (source === "topic" && !topic) return <Navigate to={`${basePath}/topics`} replace />;
  if (sceneId && !selectedScene) return <Navigate to={topic ? `${basePath}/topic/${topic.id}` : returnTo} replace />;
  if (!vocabulary.length) return <Navigate to={returnTo} replace />;

  const entry = vocabulary[index];
  const form = getVocabularyForm(entry, variantId);
  const definitions = pack.defineVocabulary?.(topic, entry) ?? {
    target: form.representations.target,
    source: entry.meanings.join(" · ")
  };
  const target = form.representations.target;
  const reading = form.representations.reading;
  const romanization = form.representations.romanization;
  const progress = (index + 1) / vocabulary.length;
  const scopeLabel = phraseSet?.title ?? selectedScene?.title ?? (priority ? `${priority.replace("-", " ")} words` : "Topic vocabulary");
  const contextLabel = phraseSet ? "Essential phrases" : topic?.shortTitle ?? pack.name;

  const front = (
    <div
      className="study-card__face study-card__face--front"
      lang={pack.locale}
    >
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
    <div
      className="study-card__face study-card__face--back"
    >
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
              aria-label={`${flipped ? "Translation" : pack.name} side for ${target}. Tap to flip.`}
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
                  <AnimatePresence initial={false}>
                    <motion.div
                      className="study-card__fold-face"
                      key={flipped ? "back" : "front"}
                      variants={{
                        enter: { rotateY: flipped ? 78 : -78, opacity: 0 },
                        center: { rotateY: 0, opacity: 1 },
                        exit: { rotateY: flipped ? -78 : 78, opacity: 0 }
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.16, ease: [0.77, 0, 0.175, 1] }}
                    >
                      {flipped ? back : front}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </button>
          </motion.div>
        </AnimatePresence>
        <p className="study-announcement sr-only" aria-live="polite">Card {index + 1} of {vocabulary.length}. {flipped ? "Translation side." : `${pack.name} side.`}</p>
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

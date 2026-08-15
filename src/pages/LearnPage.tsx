import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, BookOpenCheck, CircleAlert, Languages, Play, ShieldCheck, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { OfflineBadge } from "../components/PwaNotice";
import { ProgressFill } from "../components/ProgressFill";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { db, latestIncompleteSession, SHARED_MASTERY_TOPIC_ID } from "../storage/db";
import { aggregateVocabularyReviewSignals } from "../study/queue";

export function LearnPage() {
  const {
    pack,
    indexes,
    variantId,
    welcomeDismissed,
    dismissWelcome,
    characterCalloutDismissed,
    dismissCharacterCallout
  } = useLanguagePack();
  const base = `/${pack.code}`;
  const pathCollections = pack.collections.filter((collection) => (collection.presentation ?? "path") === "path");
  const featuredTrack = pack.tracks.find((track) => track.presentation === "featured");
  const optionalTrack = pack.tracks.find((track) => track.presentation === "optional");
  const pathTrack = pack.tracks.find((track) => track.presentation === "path");
  const [welcomeOpen, setWelcomeOpen] = useState(!welcomeDismissed);
  const quizTierKey = pack.quiz.tiers.map((tier) => tier.id).join("|");
  const data = useLiveQuery(async () => {
    const tierIds = new Set(pack.quiz.tiers.map((tier) => tier.id));
    const [resume, progress, mastery, characterMastery] = await Promise.all([
      latestIncompleteSession(pack.code),
      db.tierProgress.where("languageCode").equals(pack.code).toArray(),
      db.mastery.where("languageCode").equals(pack.code).filter((item) => item.variantId === variantId && tierIds.has(item.tierId)).toArray(),
      db.characterMastery.where("languageCode").equals(pack.code).toArray()
    ]);
    return { resume, progress, mastery, characterMastery };
  }, [pack.code, quizTierKey, variantId]);
  const passedByTopic = new Map<string, number>();
  data?.progress.filter((item) => item.passed && item.variantId === variantId).forEach((item) => {
    passedByTopic.set(item.topicId, (passedByTopic.get(item.topicId) ?? 0) + 1);
  });
  const resumeTopic = data?.resume ? indexes.topics.get(data.resume.topicId) : undefined;
  const resumeTier = data?.resume ? indexes.quizTiers.get(data.resume.tierId) : undefined;
  const startTopic = indexes.topics.get(pack.presentation.startTopicId);
  const masteredCharacters = data?.characterMastery.filter((item) => item.mastered).length ?? 0;
  const reviewSignals = aggregateVocabularyReviewSignals(data?.mastery ?? []);
  const weakItems = [...reviewSignals.entries()]
    .filter(([, signal]) => signal.confidence < 3)
    .map(([sourceId, signal]) => {
      const record = data?.mastery.find((item) => item.sourceId === sourceId);
      return { sourceId, signal, topicId: record?.topicId ?? SHARED_MASTERY_TOPIC_ID };
    })
    .filter((item) => indexes.vocabulary.has(item.sourceId))
    .sort((left, right) => left.signal.confidence - right.signal.confidence || left.signal.latestAttemptAt - right.signal.latestAttemptAt);
  const weakGroups = new Map<string, { count: number; oldestAttemptAt: number }>();
  weakItems.forEach((item) => {
    const current = weakGroups.get(item.topicId);
    weakGroups.set(item.topicId, {
      count: (current?.count ?? 0) + 1,
      oldestAttemptAt: Math.min(current?.oldestAttemptAt ?? item.signal.latestAttemptAt, item.signal.latestAttemptAt)
    });
  });
  const weakReview = [...weakGroups.entries()]
    .sort((left, right) => right[1].count - left[1].count || left[1].oldestAttemptAt - right[1].oldestAttemptAt)[0];
  const weakReviewTopic = weakReview?.[0] === SHARED_MASTERY_TOPIC_ID ? undefined : indexes.topics.get(weakReview?.[0] ?? "");
  const weakReviewHref = weakReview?.[0] === SHARED_MASTERY_TOPIC_ID
    ? `${base}/phrases/study?mode=focus`
    : weakReviewTopic
      ? `${base}/topic/${weakReviewTopic.id}/study?mode=focus`
      : undefined;

  const closeWelcome = () => {
    setWelcomeOpen(false);
    dismissWelcome();
  };

  return (
    <div className="page page--learn">
      <ScreenHeader title="Learn" description={pack.presentation.tagline} actions={<OfflineBadge />} />

      {resumeTopic && resumeTier && data?.resume ? (
        <section className="resume-panel" aria-labelledby="resume-title">
          <div>
            <h2 id="resume-title">{resumeTopic.shortTitle} · {resumeTier.shortTitle}</h2>
            <p>Question {Math.min(data.resume.currentIndex + 1, data.resume.questions.length)} of {data.resume.questions.length} · {data.resume.correct} correct so far</p>
          </div>
          <Link className="button" to={`${base}/topic/${resumeTopic.id}/quiz/${data.resume.tierId}?resume=${data.resume.id}`}>
            <Play aria-hidden="true" /> Resume
          </Link>
        </section>
      ) : weakReview && weakReviewHref ? (
        <section className="resume-panel resume-panel--review" aria-labelledby="review-next-title">
          <div>
            <h2 id="review-next-title">Review weak words in {weakReviewTopic?.shortTitle ?? "essential phrases"}</h2>
            <p>{weakReview[1].count} {weakReview[1].count === 1 ? "word needs" : "words need"} another short recall round.</p>
          </div>
          <Link className="button" to={weakReviewHref}>
            <Play aria-hidden="true" /> Review now
          </Link>
        </section>
      ) : startTopic ? (
        <section className="resume-panel resume-panel--fresh" aria-labelledby="start-title">
          <div>
            <h2 id="start-title">Start with {startTopic.shortTitle.toLocaleLowerCase("en")}</h2>
            <p>{startTopic.description}</p>
          </div>
          <Link className="button" to={`${base}/topic/${startTopic.id}`}>
            <BookOpenCheck aria-hidden="true" /> Open topic
          </Link>
        </section>
      ) : null}

      {!characterCalloutDismissed ? (
        <section className="character-callout" aria-labelledby="character-callout-title">
          <Languages aria-hidden="true" />
          <div>
            <h2 id="character-callout-title">Learn {pack.characterCourse.title}</h2>
            <p>{pack.characterCourse.description}</p>
            <small>{masteredCharacters} of {pack.characterCourse.items.length} characters mastered</small>
          </div>
          <button
            className="icon-button character-callout__dismiss"
            type="button"
            onClick={dismissCharacterCallout}
            aria-label={`Dismiss Learn ${pack.characterCourse.title} card`}
          >
            <X aria-hidden="true" />
          </button>
          <Link className="button button--secondary" to={`${base}/characters`}>Open {pack.characterCourse.navLabel} <ArrowRight aria-hidden="true" /></Link>
        </section>
      ) : null}

      {featuredTrack ? (
        <section className="safety-panel" aria-labelledby="safety-title">
          <div className="safety-panel__heading">
            <ShieldCheck aria-hidden="true" />
            <div><h2 id="safety-title">{featuredTrack.title}</h2></div>
          </div>
          <div className="safety-panel__links">
            {featuredTrack.topicIds.map((id) => {
              const topic = indexes.topics.get(id);
              return topic ? <Link key={id} to={`${base}/topic/${id}`}>{topic.shortTitle}<ArrowRight aria-hidden="true" /></Link> : null;
            })}
          </div>
        </section>
      ) : null}

      {pathTrack ? (
        <section className="path-section" aria-labelledby="path-title">
          <div className="section-heading">
            <div><h2 id="path-title">{pathTrack.title}</h2><p>{pathTrack.description}</p></div>
            <Link className="text-link" to={`${base}/topics`}>Browse all topics <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="path-groups path-groups--journey">
            {pathCollections.map((collection) => (
              <section className="path-group" key={collection.id}>
                <header><h3>{collection.title}</h3><p>{collection.description}</p></header>
                <ol>
                  {collection.phraseSetIds?.length ? (
                    <li className="path-phrase-item">
                      <Link to={`${base}/phrases`}>
                        <span className="path-number">KIT</span>
                        <span className="path-copy"><strong>Essential phrases</strong><small>{pack.sharedVocabularySets[0]?.vocabulary.length ?? 0} shared phrases · mastered once</small></span>
                        <span className="path-progress path-progress--kit" aria-hidden="true" />
                      </Link>
                    </li>
                  ) : null}
                  {collection.topicIds.map((id) => {
                    const topic = indexes.topics.get(id);
                    if (!topic) return null;
                    const passed = passedByTopic.get(id) ?? 0;
                    const pathIndex = pathTrack.topicIds.indexOf(id);
                    return (
                      <li key={id}>
                        <Link to={`${base}/topic/${id}`}>
                          <span className="path-number">{String(pathIndex + 1).padStart(2, "0")}</span>
                          <span className="path-copy">
                            <strong>{topic.shortTitle}</strong>
                            <small>{passed ? `${passed} of ${topic.quizTierIds.length} tiers passed` : topic.description}</small>
                          </span>
                          <span className="path-progress" aria-label={`${passed} of ${topic.quizTierIds.length} tiers passed`}>
                            <ProgressFill value={passed / topic.quizTierIds.length} />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      {optionalTrack ? (
        <section className="elective-section" aria-labelledby="elective-title">
          <div className="section-heading"><div><h2 id="elective-title">{optionalTrack.title}</h2><p>{optionalTrack.description}</p></div></div>
          <div className="elective-links">
            {optionalTrack.topicIds.map((id) => {
              const topic = indexes.topics.get(id);
              if (!topic) return null;
              const passed = passedByTopic.get(id) ?? 0;
              return <Link key={id} to={`${base}/topic/${id}`}><Sparkles aria-hidden="true" /><span><strong>{topic.shortTitle}</strong><small>{passed ? `${passed} of ${topic.quizTierIds.length} tiers passed` : `${topic.scenes.length} study scenes`}</small></span><ArrowRight aria-hidden="true" /></Link>;
            })}
          </div>
        </section>
      ) : null}

      {weakItems.length ? (
        <section className="weak-section" aria-labelledby="weak-title">
          <div className="section-heading"><div><h2 id="weak-title">{pack.presentation.weakVocabularyTitle}</h2><p>Low-confidence words are selected first in a short review.</p></div></div>
          <ul className="weak-list">
            {weakItems.slice(0, 5).map((item) => {
              const topic = indexes.topics.get(item.topicId);
              const entry = indexes.vocabulary.get(item.sourceId);
              return entry ? (
                <li key={item.sourceId}>
                  <span lang={pack.locale}>{entry.baseForm.representations.target}</span>
                  <span>{entry.meanings[0]}</span>
                  <Link to={topic ? `${base}/topic/${topic.id}/study?mode=focus` : `${base}/phrases/study?mode=focus`}>{topic?.shortTitle ?? "Essential phrases"}</Link>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      ) : null}

      <BottomSheet open={welcomeOpen} onClose={closeWelcome} title={pack.presentation.welcomeTitle}>
        <div className="welcome-sheet">
          <p>Language Learner stores every answer on this device. There is no account and nothing is sent to a server.</p>
          <div className="welcome-sheet__note"><CircleAlert aria-hidden="true" /><p>{pack.presentation.welcomeDescription}</p></div>
          <button className="button button--wide" type="button" onClick={closeWelcome}>Start learning</button>
        </div>
      </BottomSheet>
    </div>
  );
}

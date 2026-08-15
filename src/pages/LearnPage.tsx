import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, BookOpenCheck, CircleAlert, Languages, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { OfflineBadge } from "../components/PwaNotice";
import { ProgressFill } from "../components/ProgressFill";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { db, latestIncompleteSession } from "../storage/db";

export function LearnPage() {
  const { pack, indexes, variantId, welcomeDismissed, dismissWelcome } = useLanguagePack();
  const base = `/${pack.code}`;
  const pathCollections = pack.collections.filter((collection) => (collection.presentation ?? "path") === "path");
  const featuredTrack = pack.tracks.find((track) => track.presentation === "featured");
  const optionalTrack = pack.tracks.find((track) => track.presentation === "optional");
  const pathTrack = pack.tracks.find((track) => track.presentation === "path");
  const [welcomeOpen, setWelcomeOpen] = useState(!welcomeDismissed);
  const data = useLiveQuery(async () => {
    const [resume, progress, weak, characterMastery] = await Promise.all([
      latestIncompleteSession(pack.code),
      db.tierProgress.where("languageCode").equals(pack.code).toArray(),
      db.mastery.where("languageCode").equals(pack.code).filter((item) => item.confidence < 3).limit(5).toArray(),
      db.characterMastery.where("languageCode").equals(pack.code).toArray()
    ]);
    return { resume, progress, weak, characterMastery };
  }, [pack.code]);
  const passedByTopic = new Map<string, number>();
  data?.progress.filter((item) => item.passed && item.variantId === variantId).forEach((item) => {
    passedByTopic.set(item.topicId, (passedByTopic.get(item.topicId) ?? 0) + 1);
  });
  const resumeTopic = data?.resume ? indexes.topics.get(data.resume.topicId) : undefined;
  const resumeTier = data?.resume ? indexes.quizTiers.get(data.resume.tierId) : undefined;
  const startTopic = indexes.topics.get(pack.presentation.startTopicId);
  const masteredCharacters = data?.characterMastery.filter((item) => item.mastered).length ?? 0;

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

      <section className="character-callout" aria-labelledby="character-callout-title">
        <Languages aria-hidden="true" />
        <div>
          <h2 id="character-callout-title">Learn {pack.characterCourse.title}</h2>
          <p>{pack.characterCourse.description}</p>
          <small>{masteredCharacters} of {pack.characterCourse.items.length} characters mastered</small>
        </div>
        <Link className="button button--secondary" to={`${base}/characters`}>Open {pack.characterCourse.navLabel} <ArrowRight aria-hidden="true" /></Link>
      </section>

      {featuredTrack ? (
        <section className="safety-panel" aria-labelledby="safety-title">
          <div className="safety-panel__heading">
            <ShieldCheck aria-hidden="true" />
            <div><h2 id="safety-title">{featuredTrack.title}</h2><p>{featuredTrack.description}</p></div>
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

      {data?.weak.length ? (
        <section className="weak-section" aria-labelledby="weak-title">
          <div className="section-heading"><div><h2 id="weak-title">{pack.presentation.weakVocabularyTitle}</h2><p>Low-confidence words will be selected first in your next quiz.</p></div></div>
          <ul className="weak-list">
            {data.weak.map((item) => {
              const topic = indexes.topics.get(item.topicId);
              const entry = indexes.vocabulary.get(item.sourceId);
              return entry ? (
                <li key={item.id}>
                  <span lang={pack.locale}>{entry.baseForm.representations.target}</span>
                  <span>{entry.meanings[0]}</span>
                  <Link to={topic ? `${base}/topic/${topic.id}` : `${base}/phrases`}>{topic?.shortTitle ?? "Essential phrases"}</Link>
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

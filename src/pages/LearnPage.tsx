import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, BookOpenCheck, CircleAlert, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { OfflineBadge } from "../components/PwaNotice";
import { ProgressFill } from "../components/ProgressFill";
import { ScreenHeader } from "../components/ScreenHeader";
import { japanesePack, topicById, vocabularyById } from "../content";
import { tierMeta } from "../quiz/meta";
import { useAppState } from "../state/AppState";
import { db, latestIncompleteSession } from "../storage/db";

const journeyCollections = japanesePack.collections.filter((collection) => !collection.pinned && !collection.optional);
const safetyCollection = japanesePack.collections.find((collection) => collection.pinned)!;
const interestCollection = japanesePack.collections.find((collection) => collection.optional)!;

export function LearnPage() {
  const { welcomeDismissed, dismissWelcome } = useAppState();
  const [welcomeOpen, setWelcomeOpen] = useState(!welcomeDismissed);
  const data = useLiveQuery(async () => {
    const [resume, progress, weak] = await Promise.all([
      latestIncompleteSession(),
      db.tierProgress.toArray(),
      db.mastery.orderBy("confidence").filter((item) => item.confidence < 3).limit(5).toArray()
    ]);
    return { resume, progress, weak };
  }, []);
  const passedByTopic = new Map<string, number>();
  data?.progress.filter((item) => item.passed).forEach((item) => {
    passedByTopic.set(item.topicId, (passedByTopic.get(item.topicId) ?? 0) + 1);
  });
  const resumeTopic = data?.resume ? topicById.get(data.resume.topicId) : undefined;

  const closeWelcome = () => {
    setWelcomeOpen(false);
    dismissWelcome();
  };

  return (
    <div className="page page--learn">
      <ScreenHeader title="Learn" description="Practical Japanese for the moments that matter—ready when the signal disappears." actions={<OfflineBadge />} />

      {resumeTopic && data?.resume ? (
        <section className="resume-panel" aria-labelledby="resume-title">
          <div>
            <h2 id="resume-title">{resumeTopic.shortTitle} · {tierMeta[data.resume.tier].shortTitle}</h2>
            <p>Question {Math.min(data.resume.currentIndex + 1, 24)} of 24 · {data.resume.correct} correct so far</p>
          </div>
          <Link className="button" to={`/topic/${resumeTopic.id}/quiz/${data.resume.tier}?resume=${data.resume.id}`}>
            <Play aria-hidden="true" /> Resume
          </Link>
        </section>
      ) : (
        <section className="resume-panel resume-panel--fresh" aria-labelledby="start-title">
          <div>
            <h2 id="start-title">Start with greetings & small talk</h2>
            <p>Learn the words that make every later interaction easier.</p>
          </div>
          <Link className="button" to="/topic/greetings-small-talk">
            <BookOpenCheck aria-hidden="true" /> Open topic
          </Link>
        </section>
      )}

      <section className="safety-panel" aria-labelledby="safety-title">
        <div className="safety-panel__heading">
          <ShieldCheck aria-hidden="true" />
          <div><h2 id="safety-title">Safety kit</h2><p>Food restrictions, weather warnings, and urgent help stay open without prerequisites.</p></div>
        </div>
        <div className="safety-panel__links">
          {safetyCollection.topicIds.map((id) => {
            const topic = topicById.get(id)!;
            return <Link key={id} to={`/topic/${id}`}>{topic.shortTitle}<ArrowRight aria-hidden="true" /></Link>;
          })}
        </div>
      </section>

      <section className="path-section" aria-labelledby="path-title">
        <div className="section-heading">
          <div>
            <h2 id="path-title">Your trip-ready path</h2>
            <p>Everything is open. This order simply puts the most useful language first.</p>
          </div>
          <Link className="text-link" to="/topics">Browse all topics <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="path-groups path-groups--journey">
          {journeyCollections.map((collection) => (
            <section className="path-group" key={collection.id}>
              <header><h3>{collection.title}</h3><p>{collection.description}</p></header>
              <ol>
                {collection.phraseSetIds?.length ? (
                  <li className="path-phrase-item">
                    <Link to="/phrases">
                      <span className="path-number">KIT</span>
                      <span className="path-copy"><strong>Essential phrases</strong><small>40 shared phrases · mastered once</small></span>
                      <span className="path-progress path-progress--kit" aria-hidden="true" />
                    </Link>
                  </li>
                ) : null}
                {collection.topicIds.map((id) => {
                  const topic = topicById.get(id)!;
                  const passed = passedByTopic.get(id) ?? 0;
                  const journeyIndex = japanesePack.recommendedTracks.journey.indexOf(id);
                  return (
                    <li key={id}>
                      <Link to={`/topic/${id}`}>
                        <span className="path-number">{String(journeyIndex + 1).padStart(2, "0")}</span>
                        <span className="path-copy">
                          <strong>{topic.shortTitle}</strong>
                          <small>{passed ? `${passed} of 4 tiers passed` : topic.description}</small>
                        </span>
                        <span className="path-progress" aria-label={`${passed} of 4 tiers passed`}>
                          <ProgressFill value={passed / 4} />
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

      <section className="elective-section" aria-labelledby="elective-title">
        <div className="section-heading"><div><h2 id="elective-title">Explore your interests</h2><p>Optional specialist material for photography, aircraft recognition, and public aviation events.</p></div></div>
        <div className="elective-links">
          {interestCollection.topicIds.map((id) => {
            const topic = topicById.get(id)!;
            const passed = passedByTopic.get(id) ?? 0;
            return <Link key={id} to={`/topic/${id}`}><Sparkles aria-hidden="true" /><span><strong>{topic.shortTitle}</strong><small>{passed ? `${passed} of 4 tiers passed` : `${topic.scenes.length} study scenes`}</small></span><ArrowRight aria-hidden="true" /></Link>;
          })}
        </div>
      </section>

      {data?.weak.length ? (
        <section className="weak-section" aria-labelledby="weak-title">
          <div className="section-heading">
            <div>
              <h2 id="weak-title">Worth another look</h2>
              <p>Low-confidence words will be selected first in your next quiz.</p>
            </div>
          </div>
          <ul className="weak-list">
            {data.weak.map((item) => {
              const topic = topicById.get(item.topicId);
              const entry = vocabularyById.get(item.sourceId);
              return entry ? (
                <li key={item.id}>
                  <span lang="ja">{entry.sharedForm.kanji ?? entry.sharedForm.kana}</span>
                  <span>{entry.meanings[0]}</span>
                  <Link to={topic ? `/topic/${topic.id}` : "/phrases"}>{topic?.shortTitle ?? "Essential phrases"}</Link>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      ) : null}

      <BottomSheet open={welcomeOpen} onClose={closeWelcome} title="Japanese, ready for the trip">
        <div className="welcome-sheet">
          <p>Language Learner stores every answer on this device. There is no account and nothing is sent to a server.</p>
          <div className="welcome-sheet__note">
            <CircleAlert aria-hidden="true" />
            <p>For Japanese-answer quizzes, add the Japanese keyboard in your phone or computer settings. Romaji answers are accepted only in the first tier.</p>
          </div>
          <button className="button button--wide" type="button" onClick={closeWelcome}>Start learning</button>
        </div>
      </BottomSheet>
    </div>
  );
}

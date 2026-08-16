import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Play } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { getVocabularyForm } from "../languages";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { buildPhraseQuizTopic, getPhraseQuizTier, PHRASE_QUIZ_TOPIC_ID } from "../quiz/phrases";
import { db } from "../storage/db";

export function PhraseKitPage() {
  const { pack, variantId } = useLanguagePack();
  const [searchParams] = useSearchParams();
  const base = `/${pack.code}`;
  const phraseSet = pack.sharedVocabularySets[0];
  const activeTab = searchParams.get("tab") === "practice" ? "practice" : "phrasebook";
  const phraseTopic = buildPhraseQuizTopic(pack);
  const quizTier = getPhraseQuizTier(pack);
  const progress = useLiveQuery(async () => {
    if (!phraseSet) return { study: [], attempts: [] };
    const [study, attempts] = await Promise.all([
      db.studyProgress.where("[languageCode+scopeId]").equals([pack.code, `phrases:${phraseSet.id}`]).toArray(),
      db.attempts.where("languageCode").equals(pack.code).filter((attempt) => attempt.topicId === PHRASE_QUIZ_TOPIC_ID && attempt.variantId === variantId && attempt.correct).toArray()
    ]);
    return { study, attempts };
  }, [pack.code, phraseSet?.id, variantId]);
  if (!phraseSet) return <Navigate to={`${base}/topics`} replace />;
  const entries = new Map(phraseSet.vocabulary.map((entry) => [entry.id, entry]));
  const quizPool = phraseTopic && quizTier ? pack.quiz.generate(phraseTopic, {
    languageCode: pack.code,
    topicId: phraseTopic.id,
    tierId: quizTier.id,
    variantId,
    seed: 0,
    count: Number.MAX_SAFE_INTEGER
  }) : [];
  const correctQuestionIds = new Set(progress?.attempts.map((attempt) => attempt.questionId) ?? []);
  const quizCompleted = quizPool.filter((question) => correctQuestionIds.has(question.id)).length;
  const studyCompleted = new Set(progress?.study.map((record) => record.sourceId) ?? []).size;
  const quickStudyCount = Math.min((phraseSet.vocabulary.length - studyCompleted) || phraseSet.vocabulary.length, 12);

  return (
    <div className="page phrase-kit-page">
      <ScreenHeader
        title={phraseSet.title}
        description={phraseSet.description}
        leading={<Link className="icon-button" to={`${base}/topics`} aria-label="Back to topics"><ArrowLeft aria-hidden="true" /></Link>}
      >
        <div className="topic-stats"><span>{phraseSet.vocabulary.length} shared phrases</span><span>One mastery record per language</span></div>
      </ScreenHeader>
      <nav className="topic-tabs" aria-label="Essential phrase sections">
        <Link className={activeTab === "phrasebook" ? "is-active" : undefined} aria-current={activeTab === "phrasebook" ? "page" : undefined} to={`${base}/phrases?tab=phrasebook`}>Phrasebook</Link>
        <Link className={activeTab === "practice" ? "is-active" : undefined} aria-current={activeTab === "practice" ? "page" : undefined} to={`${base}/phrases?tab=practice`}>Practice & quiz</Link>
      </nav>
      {activeTab === "phrasebook" ? <>
      <p className="topic-guidance" role="note">These phrases appear inside topic checkpoints, but progress is recorded only once within this language pack.</p>
      <section className="phrase-study-callout" aria-labelledby="phrase-study-title">
        <div>
          <h2 id="phrase-study-title">Practice the essentials</h2>
          <p>Start with a short active-recall round. The complete phrase kit remains available to browse at your own pace.</p>
        </div>
        <div className="study-action-group">
          <Link className="button" to={`${base}/phrases/study?mode=focus`}><Play aria-hidden="true" /> Quick study · {quickStudyCount}</Link>
          <Link className="text-link" to={`${base}/phrases/study?mode=all`}>Browse all {phraseSet.vocabulary.length}</Link>
        </div>
      </section>
      <div className="phrase-groups">
        {phraseSet.groups.map((group) => (
          <section className="phrase-group" key={group.id}>
            <div className="section-heading"><div><h2>{group.title}</h2><p>{group.description}</p></div></div>
            <ul className="vocabulary-list">
              {group.entryIds.map((entryId) => entries.get(entryId)).filter(Boolean).map((entry) => {
                if (!entry) return null;
                const form = getVocabularyForm(entry, variantId);
                const target = form.representations.target;
                const reading = form.representations.reading;
                return (
                  <li key={entry.id}>
                    <div className="vocabulary-list__japanese"><strong lang={pack.locale}>{target}</strong>{reading && reading !== target ? <span lang={pack.locale}>{reading}</span> : null}</div>
                    <div className="vocabulary-list__meaning"><span>{entry.meanings.join(" · ")}</span>{form.representations.romanization ? <small>{form.representations.romanization}</small> : null}</div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      </> : (
        <div className="phrase-practice-grid">
          <section className="phrase-practice-card" aria-labelledby="immersive-phrases-title">
            <BookOpen aria-hidden="true" />
            <span className="quiet-label">Immersive cards</span>
            <h2 id="immersive-phrases-title">Study one phrase at a time</h2>
            <p>{studyCompleted} of {phraseSet.vocabulary.length} phrases seen. New phrases stay at the front until you have seen the complete kit.</p>
            <div className="study-action-group">
              <Link className="button" to={`${base}/phrases/study?mode=focus`}><Play aria-hidden="true" /> Quick study</Link>
              <Link className="button button--secondary" to={`${base}/phrases/study?mode=all`}>Open all cards <ArrowRight aria-hidden="true" /></Link>
            </div>
          </section>
          <section className="phrase-practice-card" aria-labelledby="phrase-quiz-title">
            <Brain aria-hidden="true" />
            <span className="quiet-label">Active recall</span>
            <h2 id="phrase-quiz-title">Essential phrase quiz</h2>
            <p>{quizCompleted} of {quizPool.length} questions completed. Correct answers rotate out until the whole phrase set has been covered.</p>
            <Link className="button" to={`${base}/phrases/quiz`}>Start quiz <ArrowRight aria-hidden="true" /></Link>
          </section>
        </div>
      )}
    </div>
  );
}

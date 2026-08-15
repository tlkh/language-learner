import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, CheckCircle2, RotateCcw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { firstTryScore } from "../characters/engine";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { db, type CharacterSessionRecord } from "../storage/db";

export function CharacterResultsPage() {
  const { sessionId } = useParams();
  const { pack, indexes } = useLanguagePack();
  const base = `/${pack.code}`;
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const data = useLiveQuery(async () => {
    if (!sessionId) return null;
    const session = await db.characterSessions.get(sessionId);
    if (!session || session.languageCode !== pack.code) return null;
    const attempts = await db.characterAttempts.where("sessionId").equals(sessionId).toArray();
    return { session, attempts };
  }, [pack.code, sessionId]);

  if (data === undefined) return <div className="page quiz-loading" role="status"><span className="spinner" /> Building character results…</div>;
  if (!data) return <Navigate to={`${base}/characters`} replace />;
  if (!data.session.completed) return <Navigate to={`${base}/characters/practice/${data.session.id}`} replace />;
  const { session } = data;
  const course = pack.characterCourse;
  const mode = course.drillModes.find((item) => item.id === session.drillModeId);
  if (!mode) return <Navigate to={`${base}/characters`} replace />;
  const clean = firstTryScore(session.itemStates);
  const unresolved = session.itemStates.filter((state) => !state.completed);
  const weak = session.itemStates.filter((state) => !state.completed || state.failedAttempts > 0);
  const failures = session.itemStates.filter((state) => state.failedAttempts > 0);
  const selected = new Set(session.selectedItemIds);
  const stateById = new Map(session.itemStates.map((state) => [state.itemId, state]));

  const retry = async (itemIds: string[]) => {
    if (!itemIds.length || starting) return;
    setStarting(true);
    const next: CharacterSessionRecord = {
      id: crypto.randomUUID(),
      languageCode: pack.code,
      courseId: course.id,
      drillModeId: mode.id,
      selectedItemIds: itemIds,
      itemStates: itemIds.map((itemId) => ({ itemId, attempted: false, completed: false, failedAttempts: 0 })),
      seed: Date.now() & 0x7fffffff,
      completed: false,
      startedAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.characterSessions.put(next);
    navigate(`${base}/characters/practice/${next.id}`);
  };

  return (
    <div className="page character-results-page">
      <section className="character-result-hero">
        {unresolved.length ? <TriangleAlert aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
        <span className="quiet-label">{course.title} · {mode.title}</span>
        <h1>{clean} <small>/ {session.itemStates.length}</small></h1>
        <h2>First-try recall</h2>
        <p>{unresolved.length ? `${unresolved.length} unresolved ${unresolved.length === 1 ? "card" : "cards"}. Attempted weak cards had their clean streak reset.` : failures.length ? "Every card was resolved. Cards with retries had their clean streak reset." : "A completely clean session. Each card gained one clean recall."}</p>
        <div className="result-actions">
          <button className="button" type="button" disabled={!weak.length || starting} onClick={() => void retry(weak.map((state) => state.itemId))}><RotateCcw aria-hidden="true" /> Retry weak</button>
          <button className="button button--secondary" type="button" disabled={starting} onClick={() => void retry(session.selectedItemIds)}><RotateCcw aria-hidden="true" /> Retry all</button>
          <Link className="button button--secondary" to={`${base}/characters`}>Character chart <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="character-matrices" aria-labelledby="matrix-title">
        <div className="section-heading"><div><h2 id="matrix-title">Recall by group</h2><p>Clean recalls, recovered cards, and unresolved cards across the selected rows.</p></div></div>
        {course.collections.map((collection) => {
          const sections = collection.sections.map((section) => ({ ...section, groups: section.groups.map((group) => ({ ...group, itemIds: group.itemIds.filter((id) => selected.has(id)) })).filter((group) => group.itemIds.length) })).filter((section) => section.groups.length);
          return sections.length ? <article className="character-matrix" key={collection.id}><h3>{collection.title}</h3>{sections.map((section) => <div key={section.id}><h4>{section.title}</h4>{section.groups.map((group) => <div className="character-matrix__row" key={group.id}><strong>{group.title}</strong><div>{group.itemIds.map((itemId) => { const item = indexes.characters.get(itemId); const state = stateById.get(itemId); const status = !state?.completed ? "is-unresolved" : state.failedAttempts ? "is-recovered" : "is-clean"; return item ? <span className={status} key={itemId} title={`${item.representations[mode.answerRepresentationId]}: ${status.slice(3)}`}><b lang={pack.locale}>{item.representations[mode.promptRepresentationId]}</b><small>{state?.failedAttempts ? state.failedAttempts : "✓"}</small></span> : null; })}</div></div>)}</div>)}</article> : null;
        })}
      </section>

      {failures.length ? <section className="character-failure-summary" aria-labelledby="failure-title"><div className="section-heading"><div><h2 id="failure-title">Failed attempts</h2><p>The answer was withheld during practice; use this summary after the session.</p></div></div><ul>{failures.map((state) => { const item = indexes.characters.get(state.itemId); return item ? <li key={state.itemId}><strong lang={pack.locale}>{item.representations[mode.promptRepresentationId]}</strong><span>{item.representations[mode.answerRepresentationId]}</span><small>{state.failedAttempts} failed {state.failedAttempts === 1 ? "attempt" : "attempts"}</small></li> : null; })}</ul></section> : null}

      {unresolved.length ? <section className="character-unresolved" aria-labelledby="unresolved-title"><h2 id="unresolved-title">Unresolved</h2><div>{unresolved.map((state) => { const item = indexes.characters.get(state.itemId); return item ? <span key={state.itemId} lang={pack.locale}>{item.representations[mode.promptRepresentationId]}</span> : null; })}</div></section> : null}
    </div>
  );
}

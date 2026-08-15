import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Check, CircleX, Flag, LockKeyhole } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { gradeCharacterAnswer } from "../characters/engine";
import { ProgressFill } from "../components/ProgressFill";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { completeCharacterSession, db, saveCharacterAttempt, type CharacterSessionItemState } from "../storage/db";

export function CharacterPracticePage() {
  const { sessionId } = useParams();
  const { pack, indexes } = useLanguagePack();
  const base = `/${pack.code}`;
  const navigate = useNavigate();
  const finishDialog = useRef<HTMLDialogElement>(null);
  const [localStates, setLocalStates] = useState<CharacterSessionItemState[] | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect">>({});
  const [busy, setBusy] = useState(false);
  const loaded = useLiveQuery(async () => sessionId ? (await db.characterSessions.get(sessionId) ?? null) : null, [sessionId]);
  const session = loaded && loaded.languageCode === pack.code ? loaded : null;
  const states = localStates ?? session?.itemStates ?? [];
  const course = pack.characterCourse;
  const mode = session ? course.drillModes.find((item) => item.id === session.drillModeId) : undefined;
  const currentState = states.find((state) => !state.completed);
  const completedCount = states.filter((state) => state.completed).length;

  useEffect(() => {
    if (loaded && loaded.languageCode === pack.code) setLocalStates(loaded.itemStates);
  }, [loaded, pack.code]);

  if (loaded === undefined) return <div className="page quiz-loading" role="status"><span className="spinner" /> Restoring practice…</div>;
  if (!session || !mode) return <Navigate to={`${base}/characters`} replace />;
  if (session.completed) return <Navigate to={`${base}/characters/results/${session.id}`} replace />;

  const submitAnswer = async (event: FormEvent, itemId: string) => {
    event.preventDefault();
    if (busy) return;
    const value = inputs[itemId] ?? "";
    if (!value.trim()) return;
    const item = indexes.characters.get(itemId);
    if (!item) return;
    const correct = gradeCharacterAnswer(pack, item, mode.answerRepresentationId, value);
    const nextStates = states.map((state) => state.itemId === itemId ? {
      ...state,
      attempted: true,
      completed: correct || state.completed,
      failedAttempts: state.failedAttempts + (correct ? 0 : 1)
    } : state);
    setBusy(true);
    setLocalStates(nextStates);
    setFeedback((current) => ({ ...current, [itemId]: correct ? "correct" : "incorrect" }));
    setInputs((current) => ({ ...current, [itemId]: "" }));
    await saveCharacterAttempt({ ...session, itemStates: states }, itemId, value, correct, nextStates);
    setBusy(false);
  };

  const finish = async () => {
    if (busy) return;
    const unresolved = states.filter((state) => !state.completed).length;
    if (unresolved) {
      finishDialog.current?.showModal();
      return;
    }
    await finalize();
  };

  const finalize = async () => {
    setBusy(true);
    finishDialog.current?.close();
    await completeCharacterSession({ ...session, itemStates: states });
    navigate(`${base}/characters/results/${session.id}`, { replace: true });
  };

  return (
    <main className="page character-practice-page">
      <header className="character-practice-header">
        <Link className="icon-button" to={`${base}/characters`} aria-label="Leave character practice"><ArrowLeft aria-hidden="true" /></Link>
        <div><span>{course.title}</span><h1>{mode.title}</h1></div>
        <button className="button button--secondary button--compact" type="button" onClick={() => void finish()}><Flag aria-hidden="true" /> Finish</button>
        <span className="character-practice-header__progress"><ProgressFill value={states.length ? completedCount / states.length : 0} /></span>
      </header>

      <p className="character-practice-instruction">Type the {mode.answerLabel.toLocaleLowerCase("en")}. Incorrect cards stay available, and the answer remains hidden until you recall it.</p>

      {currentState ? (
        <section className="character-practice-grid" aria-label="Character recall cards">
          {states.map((state, index) => {
            const item = indexes.characters.get(state.itemId);
            if (!item) return null;
            const active = state.itemId === currentState.itemId;
            const status = feedback[state.itemId];
            return (
              <article className={`character-practice-card${active ? " is-active" : ""}${state.completed ? " is-complete" : ""}`} key={state.itemId}>
                <span className="character-practice-card__count">{index + 1} / {states.length}</span>
                <strong className="character-practice-card__glyph" lang={pack.locale}>{item.representations[mode.promptRepresentationId]}</strong>
                {state.completed ? <div className="character-practice-card__locked"><LockKeyhole aria-hidden="true" /><span>Recalled</span>{state.failedAttempts ? <small>{state.failedAttempts} failed {state.failedAttempts === 1 ? "attempt" : "attempts"}</small> : <small>Clean recall</small>}</div> : (
                  <form onSubmit={(event) => void submitAnswer(event, state.itemId)}>
                    <label htmlFor={`character-answer-${state.itemId}`}>{mode.answerLabel}</label>
                    <input id={`character-answer-${state.itemId}`} value={inputs[state.itemId] ?? ""} onChange={(event) => setInputs((current) => ({ ...current, [state.itemId]: event.target.value }))} lang={pack.representations.find((representation) => representation.id === mode.answerRepresentationId)?.languageTag} autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} placeholder={mode.answerPlaceholder} disabled={busy} />
                    <button className="button" type="submit" disabled={busy || !(inputs[state.itemId] ?? "").trim()}><Check aria-hidden="true" /> Check</button>
                    <p className={`character-practice-card__feedback${status === "incorrect" ? " is-error" : ""}`} aria-live="polite">{status === "incorrect" ? <><CircleX aria-hidden="true" /> Not yet—try this card again.</> : " "}</p>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <section className="character-practice-complete"><Check aria-hidden="true" /><h2>Every card is resolved</h2><p>Finish to see first-try recall and the groups that need another pass.</p><button className="button" type="button" onClick={() => void finish()}>See results</button></section>
      )}

      <footer className="character-practice-footer"><strong>{completedCount} of {states.length} recalled</strong><span>{states.reduce((sum, state) => sum + state.failedAttempts, 0)} failed attempts</span></footer>

      <dialog className="confirm-dialog" ref={finishDialog} onCancel={(event) => { event.preventDefault(); finishDialog.current?.close(); }}>
        <Flag aria-hidden="true" />
        <h2>Finish with unresolved cards?</h2>
        <p>{states.filter((state) => !state.completed).length} cards are still unresolved. They will appear in the failure summary and will not change mastery unless attempted.</p>
        <div className="confirm-dialog__actions"><button className="button button--secondary" type="button" onClick={() => finishDialog.current?.close()}>Keep practicing</button><button className="button" type="button" onClick={() => void finalize()}>Finish session</button></div>
      </dialog>
    </main>
  );
}

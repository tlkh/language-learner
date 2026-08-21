import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, CheckCircle2, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { selectCharacterItems, type CharacterSessionSize } from "../characters/engine";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguagePack } from "../languages/LanguagePackContext";
import type { CharacterItem, RepresentationId } from "../languages/types";
import { db, getCharacterMasteryMap, latestIncompleteCharacterSession, type CharacterSessionRecord } from "../storage/db";

const itemIdsForGroups = (groups: Array<{ itemIds: string[] }>) => Array.from(new Set(groups.flatMap((group) => group.itemIds)));

const pronunciationGuides: Record<string, string> = {
  vi: "The large symbol is the written unit. Letter name uses an ASCII romanization of the official Vietnamese name; Pronunciation hint gives a close English approximation. Some consonants vary by region.",
  th: "The large symbol is the written unit. Letter name uses the common romanized Thai mnemonic name; Initial sound hint and Final sound hint compare its syllable sounds with familiar English words.",
  id: "The large symbol is the written unit. Letter name uses the official Indonesian romanized name; Pronunciation hint compares its usual sound with a familiar English word."
};

export function CharacterPage() {
  const { pack, indexes } = useLanguagePack();
  const course = pack.characterCourse;
  const mode = course.drillModes.find((item) => item.id === course.defaultDrillModeId) ?? course.drillModes[0];
  const base = `/${pack.code}`;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "practice" ? "practice" : "reference";
  const beginnerPreset = pack.presentation.speechVariantMode === "primary-with-reference";
  const orderedItemIds = course.collections.flatMap((collection) => collection.sections.flatMap((section) => section.groups.flatMap((group) => group.itemIds)));
  const [selected, setSelected] = useState(() => new Set(beginnerPreset ? orderedItemIds.slice(0, 10) : course.items.map((item) => item.id)));
  const [sessionSize, setSessionSize] = useState<CharacterSessionSize>(beginnerPreset && course.sessionSizes.includes(10) ? 10 : course.sessionSizes.includes(20) ? 20 : course.sessionSizes[0]);
  const [starting, setStarting] = useState(false);
  const data = useLiveQuery(async () => {
    const [mastery, resume] = await Promise.all([
      getCharacterMasteryMap(pack.code, course.id, mode.id),
      latestIncompleteCharacterSession(pack.code, course.id)
    ]);
    return { mastery, resume };
  }, [course.id, mode.id, pack.code]);
  const mastered = Array.from(data?.mastery.values() ?? []).filter((item) => item.mastered).length;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const selectNextBeginnerSet = () => {
    const next = orderedItemIds.filter((id) => !data?.mastery.get(id)?.mastered).slice(0, 10);
    setSelected(new Set(next.length ? next : orderedItemIds.slice(0, 10)));
    setSessionSize(10);
  };

  const setItems = (itemIds: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      itemIds.forEach((itemId) => checked ? next.add(itemId) : next.delete(itemId));
      return next;
    });
  };

  const start = async () => {
    if (!selectedIds.length || starting) return;
    setStarting(true);
    const seed = Date.now() & 0x7fffffff;
    const mastery = data?.mastery ?? await getCharacterMasteryMap(pack.code, course.id, mode.id);
    const itemIds = selectCharacterItems(selectedIds, sessionSize, mastery, seed);
    const session: CharacterSessionRecord = {
      id: crypto.randomUUID(),
      languageCode: pack.code,
      courseId: course.id,
      drillModeId: mode.id,
      selectedItemIds: itemIds,
      itemStates: itemIds.map((itemId) => ({ itemId, attempted: false, completed: false, failedAttempts: 0 })),
      seed,
      completed: false,
      startedAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.characterSessions.put(session);
    navigate(`${base}/characters/practice/${session.id}`);
  };

  return (
    <div className="page character-page">
      <ScreenHeader title={course.title} description={course.description} />

      <nav className="topic-tabs character-tabs" aria-label={`${course.navLabel} sections`}>
        <Link className={activeTab === "reference" ? "is-active" : undefined} aria-current={activeTab === "reference" ? "page" : undefined} to={`${base}/characters?tab=reference`}>
          {course.navLabel} guide
        </Link>
        <Link className={activeTab === "practice" ? "is-active" : undefined} aria-current={activeTab === "practice" ? "page" : undefined} to={`${base}/characters?tab=practice`}>
          Practice sets
        </Link>
      </nav>

      {activeTab === "reference" ? (
        <section className="character-reference" aria-labelledby="character-reference-title">
          <div className="section-heading"><div><h2 id="character-reference-title">{course.navLabel} table & pronunciation</h2><p>Browse every character with its pack-authored pronunciation before practicing.</p></div></div>
          {pronunciationGuides[pack.code] ? <p className="character-reference__guide"><strong>How to read each card</strong><span>{pronunciationGuides[pack.code]}</span></p> : null}
          {course.collections.map((collection) => <details key={collection.id} open><summary>{collection.title}<small>{collectionIdsCount(collection.sections)} units</small></summary>{collection.sections.map((section) => <section key={section.id}><h3>{section.title}</h3>{section.groups.map((group) => {
            const items = group.itemIds.map((itemId) => indexes.characters.get(itemId)).filter((item): item is CharacterItem => Boolean(item));
            const hasDetails = items.some((item) => item.referenceDetails?.length);
            return <div className={`character-reference__row${hasDetails ? " character-reference__row--detailed" : ""}`} key={group.id}><strong>{group.title}</strong><div>{items.map((item) => <CharacterReferenceCard key={item.id} item={item} locale={pack.locale} promptRepresentationId={mode.promptRepresentationId} answerRepresentationId={mode.answerRepresentationId} mastered={Boolean(data?.mastery.get(item.id)?.mastered)} />)}</div></div>;
          })}</section>)}</details>)}
        </section>
      ) : (
        <div className="character-practice-sets">
          {data?.resume ? <section className="resume-panel" aria-labelledby="character-resume-title"><div><h2 id="character-resume-title">Continue character practice</h2><p>{data.resume.itemStates.filter((item) => item.completed).length} of {data.resume.itemStates.length} recalled</p></div><Link className="button" to={`${base}/characters/practice/${data.resume.id}`}><Play aria-hidden="true" /> Resume</Link></section> : null}

          <section className="character-summary" aria-label="Character progress">
            <CheckCircle2 aria-hidden="true" />
            <div><strong>{mastered} of {course.items.length} mastered</strong><span>Three clean recalls marks a character mastered.</span></div>
          </section>

          <section className="character-builder" aria-labelledby="character-builder-title">
            <div className="section-heading"><div><h2 id="character-builder-title">Build a practice set</h2><p>{beginnerPreset ? "Start with 10 kana in course order. As you master them, load the next unmastered set or customize the rows." : "Select collections, sections, or individual rows. Weak characters are selected first."}</p></div><strong>{selected.size} selected</strong></div>
            <div className="character-builder__actions">{beginnerPreset ? <button className="text-button" type="button" onClick={selectNextBeginnerSet}>Next 10 kana</button> : null}<button className="text-button" type="button" onClick={() => setSelected(new Set(course.items.map((item) => item.id)))}>Select all</button><button className="text-button" type="button" onClick={() => setSelected(new Set())}>Clear</button></div>
            <div className="character-selection">
              {course.collections.map((collection) => {
                const collectionIds = itemIdsForGroups(collection.sections.flatMap((section) => section.groups));
                return <article key={collection.id} className="character-selection__collection">
                  <label className="character-selection__heading"><input type="checkbox" checked={collectionIds.every((id) => selected.has(id))} onChange={(event) => setItems(collectionIds, event.target.checked)} /><span><strong>{collection.title}</strong><small>{collection.description}</small></span></label>
                  {collection.sections.map((section) => {
                    const sectionIds = itemIdsForGroups(section.groups);
                    return <div className="character-selection__section" key={section.id}>
                      <label><input type="checkbox" checked={sectionIds.every((id) => selected.has(id))} onChange={(event) => setItems(sectionIds, event.target.checked)} /><strong>{section.title}</strong><small>{sectionIds.filter((id) => selected.has(id)).length}/{sectionIds.length}</small></label>
                      <div className="character-row-options">{section.groups.map((group) => <label key={group.id}><input type="checkbox" checked={group.itemIds.every((id) => selected.has(id))} onChange={(event) => setItems(group.itemIds, event.target.checked)} /><span>{group.title}</span></label>)}</div>
                    </div>;
                  })}
                </article>;
              })}
            </div>

            <fieldset className="session-size-picker"><legend>Session size</legend>{course.sessionSizes.map((size) => <label key={size}><input type="radio" name="character-session-size" value={size} checked={sessionSize === size} onChange={() => setSessionSize(size)} /><span>{size === "all" ? `All selected (${selected.size})` : size}</span></label>)}</fieldset>
            <button className="button button--wide" type="button" disabled={!selected.size || starting} onClick={() => void start()}>{starting ? <RotateCcw className="is-spinning" aria-hidden="true" /> : <Play aria-hidden="true" />} Start recognition practice <ArrowRight aria-hidden="true" /></button>
          </section>
        </div>
      )}
    </div>
  );
}

function CharacterReferenceCard({ item, locale, promptRepresentationId, answerRepresentationId, mastered }: {
  item: CharacterItem;
  locale: string;
  promptRepresentationId: RepresentationId;
  answerRepresentationId: RepresentationId;
  mastered: boolean;
}) {
  const className = `character-reference__card${item.referenceDetails?.length ? " character-reference__card--detailed" : ""}${mastered ? " is-mastered" : ""}`;
  if (!item.referenceDetails?.length) return <span className={className}><b lang={locale}>{item.representations[promptRepresentationId]}</b><small>{item.representations[answerRepresentationId]}</small></span>;
  return <article className={className}>
    <b lang={locale}>{item.representations[promptRepresentationId]}</b>
    <dl className="character-reference__details">{item.referenceDetails.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl>
  </article>;
}

function collectionIdsCount(sections: Array<{ groups: Array<{ itemIds: string[] }> }>) {
  return new Set(sections.flatMap((section) => section.groups.flatMap((group) => group.itemIds))).size;
}

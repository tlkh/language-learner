import type { DialogueScenario, PartOfSpeech, ResponsePattern, SentencePattern, SpeechVariantId, Topic, VocabularyEntry } from "../types";
import { ESSENTIAL_PHRASE_SET_ID, priorityOverrides, topicCurriculum, type SceneSpec } from "./curriculum";

export type RawVocabulary = readonly [meaning: string, target: string, reading: string, partOfSpeech?: PartOfSpeech, aliases?: readonly string[]];
export interface TopicSeed { id: string; title: string; shortTitle: string; description: string; category: string; domain: readonly RawVocabulary[]; dialogues: readonly DialogueScenario[]; }

const slugify = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const v = (meaning: string, target: string, reading: string, partOfSpeech: PartOfSpeech = "noun", aliases: readonly string[] = []): RawVocabulary => [meaning, target, reading, partOfSpeech, aliases];

const coreVocabulary: readonly RawVocabulary[] = [
  v("hello", "halo", "ha-lo", "phrase"), v("good morning", "selamat pagi", "se-la-mat pa-gi", "phrase"), v("good afternoon", "selamat siang", "se-la-mat si-ang", "phrase"), v("good evening", "selamat sore", "se-la-mat so-re", "phrase"), v("goodbye", "selamat tinggal", "se-la-mat ting-gal", "phrase"),
  v("thank you", "terima kasih", "te-ri-ma ka-sih", "phrase"), v("thank you very much", "terima kasih banyak", "te-ri-ma ka-sih ba-nyak", "phrase"), v("you are welcome", "sama-sama", "sa-ma sa-ma", "phrase"), v("sorry", "maaf", "ma-af", "phrase"), v("excuse me", "permisi", "per-mi-si", "phrase"),
  v("please / help", "tolong", "to-long", "phrase"), v("please / go ahead", "silakan", "si-la-kan", "phrase"), v("yes", "ya", "ya", "phrase"), v("no", "tidak", "ti-dak", "phrase"), v("can / possible", "bisa", "bi-sa", "phrase"),
  v("cannot", "tidak bisa", "ti-dak bi-sa", "phrase"), v("I understand", "saya mengerti", "sa-ya me-nger-ti", "phrase"), v("I do not understand", "saya tidak mengerti", "sa-ya ti-dak me-nger-ti", "phrase"), v("please say it again", "bisa ulangi?", "bi-sa u-la-ngi", "phrase"), v("please speak slowly", "tolong bicara pelan", "to-long bi-ca-ra pe-lan", "phrase"),
  v("I speak English", "saya berbicara bahasa Inggris", "sa-ya ber-bi-ca-ra ba-ha-sa Ing-gris", "phrase"), v("do you speak English?", "Apakah Anda bisa bahasa Inggris?", "a-pa-kah An-da bi-sa ba-ha-sa Ing-gris", "phrase"), v("I am learning Indonesian", "saya sedang belajar bahasa Indonesia", "sa-ya se-dang be-la-jar ba-ha-sa In-do-ne-sia", "phrase"), v("my name is", "nama saya", "na-ma sa-ya", "phrase"), v("what is your name?", "siapa nama Anda?", "si-a-pa na-ma An-da", "phrase"),
  v("I am from", "saya dari", "sa-ya da-ri", "phrase"), v("nice to meet you", "senang bertemu dengan Anda", "se-nang ber-te-mu de-ngan An-da", "phrase"), v("see you again", "sampai jumpa lagi", "sam-pai jum-pa la-gi", "phrase"), v("have a good day", "semoga harimu menyenangkan", "se-mo-ga ha-ri-mu me-nye-nang-kan", "phrase"), v("please help me", "tolong bantu saya", "to-long ban-tu sa-ya", "phrase"),
  v("this", "ini", "i-ni", "pronoun"), v("that", "itu", "i-tu", "pronoun"), v("where", "di mana", "di ma-na", "adverb"), v("when", "kapan", "ka-pan", "adverb"), v("what", "apa", "a-pa", "pronoun"), v("how much / how many", "berapa", "be-ra-pa", "adverb"), v("today", "hari ini", "ha-ri i-ni", "noun"), v("tomorrow", "besok", "be-sok", "noun"), v("now", "sekarang", "se-ka-rang", "adverb"), v("later", "nanti", "nan-ti", "adverb")
];

const makeEntry = (topicId: string, item: RawVocabulary, index: number, tag: string): VocabularyEntry => {
  const [meaning, target, reading, partOfSpeech = "noun", aliases = []] = item;
  const id = `${topicId}-${String(index + 1).padStart(3, "0")}-${slugify(meaning)}`;
  return { id, topicId, masteryKey: id, primarySceneId: "", priority: "useful", meanings: meaning.split(" / "), baseForm: { representations: { target, reading }, aliases: { target: [...aliases], reading: [] } }, partOfSpeech, tags: [topicId, tag] };
};

export const essentialPhraseVocabulary = coreVocabulary.map((item, index) => ({ ...makeEntry(ESSENTIAL_PHRASE_SET_ID, item, index, "travel-core"), primarySceneId: ESSENTIAL_PHRASE_SET_ID, priority: "must-know" as const }));
export const formFor = (entry: VocabularyEntry, _variantId: SpeechVariantId) => entry.baseForm;
export const renderPattern = (template: string, entry: VocabularyEntry, variantId: SpeechVariantId, representation: "source" | "target", sourceLabel = entry.meanings[0]) => template.replaceAll("{meaning}", sourceLabel).replaceAll("{term}", representation === "target" ? formFor(entry, variantId).representations.target : sourceLabel);

export const dialogue = (id: string, title: string, context: string, turns: Array<["traveler" | "local", string, string]>): DialogueScenario => ({
  id, title, context, turns: turns.map(([speaker, sourceText, targetText]) => ({ speaker, sourceText, targetTextByVariant: { standard: targetText } }))
});

const sceneEntryRanges = (entries: VocabularyEntry[], sceneIndex: number) => entries.slice(sceneIndex * 8, sceneIndex * 8 + 8);
const scenePattern = (seed: TopicSeed, scene: SceneSpec, entries: VocabularyEntry[], sceneIndex: number): SentencePattern => {
  const sceneEntries = sceneEntryRanges(entries, sceneIndex);
  return { id: `${seed.id}-${scene.id}-sentence-slots`, sceneId: scene.id, sourceText: "Please help me with {meaning}.", targetTextByVariant: { standard: "Tolong bantu saya dengan {term}." }, slotEntryIds: sceneEntries.map((entry) => entry.id), slotSourceText: Object.fromEntries(sceneEntries.map((entry) => [entry.id, entry.meanings[0]])) };
};
const responsePattern = (seed: TopicSeed, scene: SceneSpec, entries: VocabularyEntry[], sceneIndex: number): ResponsePattern => ({ id: `${seed.id}-${scene.id}-response-slots`, sceneId: scene.id, promptTargetTextByVariant: { standard: "Bisakah Anda membantu saya?" }, answerTargetTextByVariant: { standard: "Saya membutuhkan {term}." }, slotEntryIds: sceneEntryRanges(entries, sceneIndex).map((entry) => entry.id) });

export const buildTopic = (seed: TopicSeed): Topic => {
  if (seed.domain.length !== 24) throw new Error(`${seed.id} must provide exactly 24 domain entries`);
  const curriculum = topicCurriculum[seed.id];
  if (!curriculum) throw new Error(`${seed.id} is missing Indonesian curriculum metadata`);
  if (seed.dialogues.length !== 3) throw new Error(`${seed.id} must provide one dialogue per scene`);
  const domain = seed.domain.map((item, index) => ({ ...makeEntry(seed.id, item, index, "domain"), primarySceneId: curriculum.scenes[Math.min(2, Math.floor(index / 8))].id, priority: priorityOverrides[item[1]] ?? (index < 8 ? "must-know" : index < 16 ? "useful" : "reference") }));
  const core = essentialPhraseVocabulary.filter((entry) => !domain.some((item) => item.baseForm.representations.target === entry.baseForm.representations.target));
  const vocabulary = [...domain, ...core];
  const sentencePatterns: SentencePattern[] = curriculum.scenes.flatMap((scene, sceneIndex) => [scenePattern(seed, scene, domain, sceneIndex), ...seed.dialogues[sceneIndex].turns.map((turn, turnIndex) => ({ id: `${seed.id}-${scene.id}-dialogue-sentence-${turnIndex + 1}`, sceneId: scene.id, sourceText: turn.sourceText, targetTextByVariant: { standard: turn.targetTextByVariant.standard }, slotEntryIds: [] }))]);
  const responsePatterns: ResponsePattern[] = curriculum.scenes.flatMap((scene, sceneIndex) => [responsePattern(seed, scene, domain, sceneIndex), ...seed.dialogues[sceneIndex].turns.slice(0, -1).map((turn, turnIndex) => ({ id: `${seed.id}-${scene.id}-dialogue-response-${turnIndex + 1}`, sceneId: scene.id, promptTargetTextByVariant: { standard: turn.targetTextByVariant.standard }, answerTargetTextByVariant: { standard: seed.dialogues[sceneIndex].turns[turnIndex + 1].targetTextByVariant.standard }, slotEntryIds: [] }))]);
  const scenes = curriculum.scenes.map((scene, sceneIndex) => ({ ...scene, vocabularyIds: sceneEntryRanges(domain, sceneIndex).map((entry) => entry.id), dialogueIds: [seed.dialogues[sceneIndex].id], sentencePatternIds: sentencePatterns.filter((pattern) => pattern.sceneId === scene.id).map((pattern) => pattern.id), responsePatternIds: responsePatterns.filter((pattern) => pattern.sceneId === scene.id).map((pattern) => pattern.id) }));
  return { id: seed.id, title: seed.title, shortTitle: seed.shortTitle, description: seed.description, categoryId: seed.category, collectionId: curriculum.collectionId, scenes, relatedTopicIds: curriculum.relatedTopicIds, sharedVocabularySetIds: [ESSENTIAL_PHRASE_SET_ID], vocabulary, dialogues: [...seed.dialogues], sentencePatterns, responsePatterns, quizTierIds: ["pronunciation-recall", "word-recall", "sentence-production", "response-production"] };
};

import type {
  DialogueScenario,
  PartOfSpeech,
  ResponsePattern,
  SentencePattern,
  SpeechVariantId,
  Topic,
  VocabularyEntry
} from "../types";
import { ESSENTIAL_PHRASE_SET_ID, priorityOverrides, topicCurriculum, type SceneSpec } from "./curriculum";

export type RawVocabulary = readonly [
  meaning: string,
  target: string,
  reading: string,
  partOfSpeech?: PartOfSpeech,
  aliases?: readonly string[]
];

export interface TopicSeed {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  domain: readonly RawVocabulary[];
  dialogues: readonly DialogueScenario[];
}

const slugify = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const v = (
  meaning: string,
  target: string,
  reading: string,
  partOfSpeech: PartOfSpeech = "noun",
  aliases: readonly string[] = []
): RawVocabulary => [meaning, target, reading, partOfSpeech, aliases];

const coreVocabulary: readonly RawVocabulary[] = [
  v("hello", "สวัสดี", "sa-wat-dee", "phrase"),
  v("good morning", "อรุณสวัสดิ์", "a-roon-sa-wat", "phrase"),
  v("goodbye", "ลาก่อน", "la-gon", "phrase"),
  v("thank you", "ขอบคุณ", "khop-khun", "phrase", ["ขอบคุณครับ", "ขอบคุณค่ะ"]),
  v("thank you very much", "ขอบคุณมาก", "khop-khun mak", "phrase"),
  v("you are welcome", "ไม่เป็นไร", "mai-pen-rai", "phrase"),
  v("sorry / excuse me", "ขอโทษ", "kho-thot", "phrase"),
  v("please / may I", "ขออนุญาต", "kho-a-nu-yat", "phrase"),
  v("please", "กรุณา", "ka-ru-na", "phrase"),
  v("yes", "ใช่", "chai", "phrase"),
  v("no", "ไม่ใช่", "mai-chai", "phrase"),
  v("okay / can", "ได้", "dai", "phrase"),
  v("cannot", "ไม่ได้", "mai-dai", "phrase"),
  v("I understand", "เข้าใจแล้ว", "khao-jai-laeo", "phrase"),
  v("I do not understand", "ไม่เข้าใจ", "mai-khao-jai", "phrase"),
  v("please say it again", "พูดอีกครั้งได้ไหม", "phut-eek-khrang-dai-mai", "phrase"),
  v("please speak slowly", "พูดช้าๆหน่อยได้ไหม", "phut-cha-cha-noi-dai-mai", "phrase"),
  v("I speak English", "ฉันพูดภาษาอังกฤษ", "chan-phut-phasa-ang-krit", "phrase"),
  v("do you speak English?", "คุณพูดภาษาอังกฤษได้ไหม", "khun-phut-phasa-ang-krit-dai-mai", "phrase"),
  v("I am learning Thai", "ฉันกำลังเรียนภาษาไทย", "chan-kam-lang-rian-phasa-thai", "phrase"),
  v("my name is", "ฉันชื่อ", "chan-chue", "phrase"),
  v("what is your name?", "คุณชื่ออะไร", "khun-chue-a-rai", "phrase"),
  v("I am from", "ฉันมาจาก", "chan-ma-chak", "phrase"),
  v("nice to meet you", "ยินดีที่ได้รู้จัก", "yin-dee-thi-dai-roo-chak", "phrase"),
  v("see you again", "แล้วพบกันใหม่", "laeo-phop-kan-mai", "phrase"),
  v("have a good day", "ขอให้เป็นวันที่ดี", "kho-hai-pen-wan-thi-dee", "phrase"),
  v("please help me", "ช่วยฉันหน่อย", "chuai-chan-noi", "phrase"),
  v("this", "นี่", "nee", "pronoun"),
  v("that", "นั่น", "nan", "pronoun"),
  v("where", "ที่ไหน", "thi-nai", "adverb"),
  v("when", "เมื่อไร", "muea-rai", "adverb"),
  v("what", "อะไร", "a-rai", "pronoun"),
  v("how much", "เท่าไร", "thao-rai", "adverb"),
  v("how many", "กี่", "gee", "adverb"),
  v("today", "วันนี้", "wan-nee", "noun"),
  v("tomorrow", "พรุ่งนี้", "phrung-nee", "noun"),
  v("now", "ตอนนี้", "ton-nee", "adverb"),
  v("later", "ภายหลัง", "phai-lang", "adverb"),
  v("open", "เปิด", "poet", "adjective"),
  v("closed", "ปิด", "pit", "adjective")
];

const makeEntry = (topicId: string, item: RawVocabulary, index: number, tag: string): VocabularyEntry => {
  const [meaning, target, reading, partOfSpeech = "noun", aliases = []] = item;
  const id = `${topicId}-${String(index + 1).padStart(3, "0")}-${slugify(meaning)}`;
  return {
    id,
    topicId,
    masteryKey: id,
    primarySceneId: "",
    priority: "useful",
    meanings: meaning.split(" / "),
    baseForm: { representations: { target, reading }, aliases: { target: [...aliases], reading: [] } },
    partOfSpeech,
    tags: [topicId, tag]
  };
};

export const essentialPhraseVocabulary = coreVocabulary.map((item, index) => ({
  ...makeEntry(ESSENTIAL_PHRASE_SET_ID, item, index, "travel-core"),
  primarySceneId: ESSENTIAL_PHRASE_SET_ID,
  priority: "must-know" as const
}));

export const formFor = (entry: VocabularyEntry, _variantId: SpeechVariantId) => entry.baseForm;

export const renderPattern = (
  template: string,
  entry: VocabularyEntry,
  variantId: SpeechVariantId,
  representation: "source" | "target",
  sourceLabel = entry.meanings[0]
) => template.replaceAll("{meaning}", sourceLabel).replaceAll("{term}", representation === "target" ? formFor(entry, variantId).representations.target : sourceLabel);

export const dialogue = (
  id: string,
  title: string,
  context: string,
  turns: Array<["traveler" | "local", string, string]>
): DialogueScenario => ({
  id,
  title,
  context,
  turns: turns.map(([speaker, sourceText, targetText]) => ({ speaker, sourceText, targetTextByVariant: { standard: targetText } }))
});

const sceneEntryRanges = (entries: VocabularyEntry[], sceneIndex: number) => entries.slice(sceneIndex * 8, sceneIndex * 8 + 8);

const scenePattern = (seed: TopicSeed, scene: SceneSpec, entries: VocabularyEntry[], sceneIndex: number): SentencePattern => {
  const sceneEntries = sceneEntryRanges(entries, sceneIndex);
  return {
    id: `${seed.id}-${scene.id}-sentence-slots`,
    sceneId: scene.id,
    sourceText: "Please help me with {meaning}.",
    targetTextByVariant: { standard: "ช่วยฉันเรื่อง{term}หน่อย" },
    slotEntryIds: sceneEntries.map((entry) => entry.id),
    slotSourceText: Object.fromEntries(sceneEntries.map((entry) => [entry.id, entry.meanings[0]]))
  };
};

const responsePattern = (seed: TopicSeed, scene: SceneSpec, entries: VocabularyEntry[], sceneIndex: number): ResponsePattern => ({
  id: `${seed.id}-${scene.id}-response-slots`,
  sceneId: scene.id,
  promptTargetTextByVariant: { standard: "ช่วยฉันได้ไหม" },
  answerTargetTextByVariant: { standard: "ฉันต้องการ{term}" },
  slotEntryIds: sceneEntryRanges(entries, sceneIndex).map((entry) => entry.id)
});

export const buildTopic = (seed: TopicSeed): Topic => {
  if (seed.domain.length !== 24) throw new Error(`${seed.id} must provide exactly 24 domain entries`);
  const curriculum = topicCurriculum[seed.id];
  if (!curriculum) throw new Error(`${seed.id} is missing Thai curriculum metadata`);
  if (seed.dialogues.length !== 3) throw new Error(`${seed.id} must provide one dialogue per scene`);

  const domain = seed.domain.map((item, index) => ({
    ...makeEntry(seed.id, item, index, "domain"),
    primarySceneId: curriculum.scenes[Math.min(2, Math.floor(index / 8))].id,
    priority: priorityOverrides[item[1]] ?? (index < 8 ? "must-know" : index < 16 ? "useful" : "reference")
  }));
  const core = essentialPhraseVocabulary.filter((entry) => !domain.some((item) => item.baseForm.representations.target === entry.baseForm.representations.target));
  const vocabulary = [...domain, ...core];
  const sentencePatterns: SentencePattern[] = curriculum.scenes.flatMap((scene, sceneIndex) => [
    scenePattern(seed, scene, domain, sceneIndex),
    ...seed.dialogues[sceneIndex].turns.map((turn, turnIndex) => ({
      id: `${seed.id}-${scene.id}-dialogue-sentence-${turnIndex + 1}`,
      sceneId: scene.id,
      sourceText: turn.sourceText,
      targetTextByVariant: { standard: turn.targetTextByVariant.standard },
      slotEntryIds: []
    }))
  ]);
  const responsePatterns: ResponsePattern[] = curriculum.scenes.flatMap((scene, sceneIndex) => [
    responsePattern(seed, scene, domain, sceneIndex),
    ...seed.dialogues[sceneIndex].turns.slice(0, -1).map((turn, turnIndex) => ({
      id: `${seed.id}-${scene.id}-dialogue-response-${turnIndex + 1}`,
      sceneId: scene.id,
      promptTargetTextByVariant: { standard: turn.targetTextByVariant.standard },
      answerTargetTextByVariant: { standard: seed.dialogues[sceneIndex].turns[turnIndex + 1].targetTextByVariant.standard },
      slotEntryIds: []
    }))
  ]);
  const scenes = curriculum.scenes.map((scene, sceneIndex) => ({
    ...scene,
    vocabularyIds: sceneEntryRanges(domain, sceneIndex).map((entry) => entry.id),
    dialogueIds: [seed.dialogues[sceneIndex].id],
    sentencePatternIds: sentencePatterns.filter((pattern) => pattern.sceneId === scene.id).map((pattern) => pattern.id),
    responsePatternIds: responsePatterns.filter((pattern) => pattern.sceneId === scene.id).map((pattern) => pattern.id)
  }));

  return {
    id: seed.id,
    title: seed.title,
    shortTitle: seed.shortTitle,
    description: seed.description,
    categoryId: seed.category,
    collectionId: curriculum.collectionId,
    scenes,
    relatedTopicIds: curriculum.relatedTopicIds,
    sharedVocabularySetIds: [ESSENTIAL_PHRASE_SET_ID],
    vocabulary,
    dialogues: [...seed.dialogues],
    sentencePatterns,
    responsePatterns,
    quizTierIds: ["pronunciation-recall", "word-recall", "sentence-production", "response-production"]
  };
};

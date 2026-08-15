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

const slugify = (value: string) => value
  .normalize("NFKD")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

export const v = (
  meaning: string,
  target: string,
  reading: string,
  partOfSpeech: PartOfSpeech = "noun",
  aliases: readonly string[] = []
): RawVocabulary => [meaning, target, reading, partOfSpeech, aliases];

const coreVocabulary: readonly RawVocabulary[] = [
  v("hello", "xin chào", "sin chow", "phrase"),
  v("good morning", "chào buổi sáng", "chow boo-oy sahng", "phrase"),
  v("good evening", "chào buổi tối", "chow boo-oy toy", "phrase"),
  v("goodbye", "tạm biệt", "tahm byet", "phrase"),
  v("thank you", "cảm ơn", "gahm uhn", "phrase"),
  v("thank you very much", "cảm ơn nhiều", "gahm uhn nyew", "phrase"),
  v("you are welcome", "không có gì", "khom gaw zee", "phrase"),
  v("sorry", "xin lỗi", "sin loy", "phrase"),
  v("it is okay", "không sao", "khom sow", "phrase"),
  v("please", "làm ơn", "lahm uhn", "phrase"),
  v("yes", "vâng", "vuhng", "phrase"),
  v("no", "không", "khom", "phrase"),
  v("okay / can", "được", "duh-uhk", "phrase"),
  v("I understand", "tôi hiểu", "toy hyew", "phrase"),
  v("I do not understand", "tôi không hiểu", "toy khom hyew", "phrase"),
  v("please say it again", "nói lại được không?", "noy lie duhk khom", "phrase"),
  v("please speak slowly", "nói chậm một chút", "noy chum moht choot", "phrase"),
  v("I speak English", "tôi nói tiếng Anh", "toy noy tyeng ang", "phrase"),
  v("do you speak English?", "bạn nói tiếng Anh không?", "ban noy tyeng ang khom", "phrase"),
  v("I am learning Vietnamese", "tôi đang học tiếng Việt", "toy dang hawk tyeng vyet", "phrase"),
  v("my name is", "tôi tên là", "toy ten lah", "phrase"),
  v("what is your name?", "bạn tên là gì?", "ban ten lah zee", "phrase"),
  v("I am from", "tôi đến từ", "toy den too", "phrase"),
  v("nice to meet you", "rất vui được gặp bạn", "zut voo-ee duhk gap ban", "phrase"),
  v("see you again", "hẹn gặp lại", "hen gap lie", "phrase"),
  v("have a good day", "chúc một ngày tốt lành", "chook moht ngai tot lanh", "phrase"),
  v("please help me", "làm ơn giúp tôi với", "lahm uhn zoop toy voy", "phrase"),
  v("this", "cái này", "guy nay", "pronoun"),
  v("that", "cái đó", "guy daw", "pronoun"),
  v("where", "ở đâu", "uh dow", "adverb"),
  v("when", "khi nào", "khee now", "adverb"),
  v("what", "cái gì", "guy zee", "pronoun"),
  v("how much / how many", "bao nhiêu", "bow nyew", "adverb"),
  v("how many items", "bao nhiêu cái", "bow nyew guy", "phrase"),
  v("today", "hôm nay", "home nay", "noun"),
  v("tomorrow", "ngày mai", "ngai my", "noun"),
  v("now", "bây giờ", "bay zuh", "adverb"),
  v("later", "sau này", "sow nay", "adverb"),
  v("open", "mở cửa", "muh koo-uh", "adjective"),
  v("closed", "đóng cửa", "dong koo-uh", "adjective")
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
    baseForm: {
      representations: { target, reading },
      aliases: { target: [...aliases], reading: [] }
    },
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
) => template
  .replaceAll("{meaning}", sourceLabel)
  .replaceAll("{term}", representation === "target" ? formFor(entry, variantId).representations.target : sourceLabel);

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

const sceneEntryRanges = (entries: VocabularyEntry[], sceneIndex: number) => {
  const start = sceneIndex * 8;
  return entries.slice(start, start + 8);
};

const scenePattern = (seed: TopicSeed, scene: SceneSpec, entries: VocabularyEntry[], sceneIndex: number): SentencePattern => {
  const sceneEntries = sceneEntryRanges(entries, sceneIndex);
  return {
    id: `${seed.id}-${scene.id}-sentence-slots`,
    sceneId: scene.id,
    sourceText: "Please help me with {meaning}.",
    targetTextByVariant: { standard: "Làm ơn giúp tôi về {term}." },
    slotEntryIds: sceneEntries.map((entry) => entry.id),
    slotSourceText: Object.fromEntries(sceneEntries.map((entry) => [entry.id, entry.meanings[0]]))
  };
};

const responsePattern = (seed: TopicSeed, scene: SceneSpec, entries: VocabularyEntry[], sceneIndex: number): ResponsePattern => ({
  id: `${seed.id}-${scene.id}-response-slots`,
  sceneId: scene.id,
  promptTargetTextByVariant: { standard: "Bạn có thể giúp tôi không?" },
  answerTargetTextByVariant: { standard: "Tôi cần {term}." },
  slotEntryIds: sceneEntryRanges(entries, sceneIndex).map((entry) => entry.id)
});

export const buildTopic = (seed: TopicSeed): Topic => {
  if (seed.domain.length < 24) throw new Error(`${seed.id} must provide at least 24 domain entries`);
  const curriculum = topicCurriculum[seed.id];
  if (!curriculum) throw new Error(`${seed.id} is missing Vietnamese curriculum metadata`);
  if (seed.domain.length !== 24) throw new Error(`${seed.id} must provide exactly 24 domain entries`);
  if (seed.dialogues.length !== 3) throw new Error(`${seed.id} must provide one dialogue per scene`);

  const domain = seed.domain.map((item, index) => {
    const sceneIndex = Math.min(2, Math.floor(index / 8));
    return {
      ...makeEntry(seed.id, item, index, "domain"),
      primarySceneId: curriculum.scenes[sceneIndex].id,
      priority: priorityOverrides[item[1]] ?? (index < 8 ? "must-know" : index < 16 ? "useful" : "reference")
    };
  });
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

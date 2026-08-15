import type {
  DialogueScenario,
  PartOfSpeech,
  SpeechVariantId,
  ResponsePattern,
  SentencePattern,
  Topic,
  VocabularyEntry
} from "../types";
import { ESSENTIAL_PHRASE_SET_ID, priorityOverrides, topicCurriculum } from "./curriculum";

type RawVocabulary = readonly [
  meaning: string,
  kana: string,
  kanji: string,
  romaji: string,
  partOfSpeech?: PartOfSpeech,
  scriptAliases?: string,
  romajiAliases?: string
];

export interface TopicSeed {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  category: Topic["categoryId"];
  domain: RawVocabulary[];
  slotMeanings: Array<string | readonly [meaning: string, englishLabel: string]>;
  dialogues: DialogueScenario[];
  sentence: {
    english: string;
    formal: string;
    informal: string;
  };
  response: {
    promptFormal: string;
    promptInformal: string;
    answerFormal: string;
    answerInformal: string;
  };
}

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const raw = (...entries: RawVocabulary[]) => entries;

export const makeEntry = (topicId: string, item: RawVocabulary, index: number, tag: string): VocabularyEntry => {
  const [meaning, kana, kanji, romaji, partOfSpeech = "noun", scriptAliases = "", romajiAliases = ""] = item;
  const id = `${topicId}-${String(index + 1).padStart(3, "0")}-${slugify(meaning)}`;
  return {
    id,
    topicId,
    masteryKey: id,
    primarySceneId: "",
    priority: "useful",
    meanings: meaning.split(" / "),
    baseForm: {
      representations: {
        target: kanji || kana,
        reading: kana,
        romanization: romaji
      },
      aliases: {
        target: scriptAliases ? scriptAliases.split(";") : [],
        romanization: romajiAliases ? romajiAliases.split(";") : []
      }
    },
    partOfSpeech,
    tags: [topicId, tag]
  };
};

export const coreVocabulary: RawVocabulary[] = raw(
  ["please", "おねがいします", "お願いします", "onegaishimasu", "phrase"],
  ["thank you", "ありがとうございます", "ありがとうございます", "arigatou gozaimasu", "phrase", "ありがとう", "arigato gozaimasu;arigatō gozaimasu"],
  ["excuse me", "すみません", "すみません", "sumimasen", "phrase"],
  ["yes", "はい", "はい", "hai", "phrase"],
  ["no", "いいえ", "いいえ", "iie", "phrase"],
  ["I understand", "わかります", "分かります", "wakarimasu", "phrase", "わかります"],
  ["I do not understand", "わかりません", "分かりません", "wakarimasen", "phrase", "わかりません"],
  ["please say it again", "もういちどおねがいします", "もう一度お願いします", "mou ichido onegaishimasu", "phrase", "もういちどお願いします", "mō ichido onegaishimasu"],
  ["please speak slowly", "ゆっくりはなしてください", "ゆっくり話してください", "yukkuri hanashite kudasai", "phrase"],
  ["English", "えいご", "英語", "eigo"],
  ["Japanese", "にほんご", "日本語", "nihongo"],
  ["where", "どこ", "どこ", "doko", "adverb"],
  ["when", "いつ", "いつ", "itsu", "adverb"],
  ["what", "なに", "何", "nani", "adverb", "なん"],
  ["which", "どれ", "どれ", "dore", "adverb"],
  ["who", "だれ", "誰", "dare", "adverb"],
  ["how much", "いくら", "いくら", "ikura", "adverb"],
  ["how many", "いくつ", "いくつ", "ikutsu", "adverb"],
  ["this", "これ", "これ", "kore"],
  ["that", "それ", "それ", "sore"],
  ["over there", "あそこ", "あそこ", "asoko"],
  ["here", "ここ", "ここ", "koko"],
  ["today", "きょう", "今日", "kyou", "noun", "きょう", "kyō"],
  ["tomorrow", "あした", "明日", "ashita"],
  ["now", "いま", "今", "ima"],
  ["later", "あとで", "後で", "atode", "adverb"],
  ["one", "いち", "一", "ichi", "counter"],
  ["two", "に", "二", "ni", "counter"],
  ["three", "さん", "三", "san", "counter"],
  ["person", "ひと", "人", "hito"],
  ["place", "ばしょ", "場所", "basho"],
  ["entrance", "いりぐち", "入口", "iriguchi"],
  ["exit", "でぐち", "出口", "deguchi"],
  ["right", "みぎ", "右", "migi"],
  ["left", "ひだり", "左", "hidari"],
  ["straight ahead", "まっすぐ", "まっすぐ", "massugu", "adverb"],
  ["near", "ちかい", "近い", "chikai", "adjective"],
  ["far", "とおい", "遠い", "tooi", "adjective"],
  ["open", "あいています", "開いています", "aiteimasu", "phrase", "開いてる;あいてる"],
  ["closed", "しまっています", "閉まっています", "shimatteimasu", "phrase", "閉まってる;しまってる"]
);

const informalCore: Record<string, { kana: string; kanji?: string; romaji: string }> = {
  please: { kana: "おねがい", kanji: "お願い", romaji: "onegai" },
  "thank you": { kana: "ありがとう", kanji: "ありがとう", romaji: "arigatou" },
  "I understand": { kana: "わかる", kanji: "分かる", romaji: "wakaru" },
  "I do not understand": { kana: "わからない", kanji: "分からない", romaji: "wakaranai" },
  "please say it again": { kana: "もういちどいって", kanji: "もう一度言って", romaji: "mou ichido itte" },
  "please speak slowly": { kana: "ゆっくりはなして", kanji: "ゆっくり話して", romaji: "yukkuri hanashite" }
};

const applyRegisterForms = (entry: VocabularyEntry): VocabularyEntry => {
  const informal = informalCore[entry.meanings[0]];
  if (!informal) return entry;
  return {
    ...entry,
    variantForms: {
      formal: entry.baseForm,
      informal: {
        representations: {
          target: informal.kanji ?? informal.kana,
          reading: informal.kana,
          romanization: informal.romaji
        },
        aliases: entry.baseForm.aliases
      }
    }
  };
};

export const essentialPhraseVocabulary = coreVocabulary.map((item, index) =>
  applyRegisterForms({
    ...makeEntry(ESSENTIAL_PHRASE_SET_ID, item, index, "travel-core"),
    primarySceneId: ESSENTIAL_PHRASE_SET_ID,
    priority: "must-know"
  })
);

export const formFor = (entry: VocabularyEntry, variantId: SpeechVariantId) =>
  entry.variantForms?.[variantId] ?? entry.baseForm;

const fill = (template: string, english: string, japanese: string) =>
  template.replaceAll("{term}", japanese).replaceAll("{meaning}", english);

export const buildTopic = (seed: TopicSeed): Topic => {
  if (seed.domain.length < 80) {
    throw new Error(`${seed.id} must provide at least 80 domain entries; received ${seed.domain.length}`);
  }
  const curriculum = topicCurriculum[seed.id];
  if (!curriculum) throw new Error(`${seed.id} is missing curriculum metadata`);
  if (seed.dialogues.length !== curriculum.scenes.length) {
    throw new Error(`${seed.id} must provide one dialogue for each curriculum scene`);
  }
  const sceneCounts = [0, 0, 0];
  const domain: VocabularyEntry[] = seed.domain.map((item, index): VocabularyEntry => {
    const sceneIndex = Math.min(2, Math.floor((index * 3) / seed.domain.length));
    const localIndex = sceneCounts[sceneIndex]++;
    const entry = makeEntry(seed.id, item, index, "domain");
    return {
      ...entry,
      primarySceneId: curriculum.scenes[sceneIndex].id,
      priority: priorityOverrides[entry.meanings[0]] ?? (localIndex < 10 ? "must-know" : localIndex < 20 ? "useful" : "reference")
    };
  });
  const domainForms = new Set(domain.map((entry) => entry.baseForm.representations.target));
  const domainMeanings = new Set(domain.flatMap((entry) => entry.meanings.map((meaning) => meaning.toLocaleLowerCase("en"))));
  const core = essentialPhraseVocabulary
    .filter((entry) => !domainMeanings.has(entry.meanings[0].toLocaleLowerCase("en")) && !domainForms.has(entry.baseForm.representations.target));
  const vocabulary = [...domain, ...core];
  const entriesByMeaning = new Map(domain.map((entry) => [entry.meanings[0], entry]));
  const slotSpecs = seed.slotMeanings.map((slot) =>
    typeof slot === "string" ? { meaning: slot, english: slot } : { meaning: slot[0], english: slot[1] }
  );
  const slotEntries = slotSpecs.map(({ meaning }) => entriesByMeaning.get(meaning)).filter((entry): entry is VocabularyEntry => Boolean(entry));
  if (slotEntries.length !== seed.slotMeanings.length) {
    const missing = slotSpecs.filter(({ meaning }) => !entriesByMeaning.has(meaning)).map(({ meaning }) => meaning);
    throw new Error(`${seed.id} has missing authored quiz slots: ${missing.join(", ")}`);
  }
  if (new Set(slotEntries.map((entry) => entry.id)).size < 24) throw new Error(`${seed.id} needs at least 24 unique compatible slots`);

  const englishByEntry = Object.fromEntries(slotEntries.map((entry, index) => [entry.id, slotSpecs[index].english]));
  const sentencePatterns: SentencePattern[] = curriculum.scenes.flatMap((scene, sceneIndex) => {
    const sceneSlots = slotEntries.filter((entry) => entry.primarySceneId === scene.id);
    const generated = sceneSlots.length ? [{
      id: `${seed.id}-${scene.id}-sentence-slots`,
      sceneId: scene.id,
      sourceText: seed.sentence.english,
      targetTextByVariant: { formal: seed.sentence.formal, informal: seed.sentence.informal },
      slotEntryIds: sceneSlots.map((entry) => entry.id),
      slotSourceText: Object.fromEntries(sceneSlots.map((entry) => [entry.id, englishByEntry[entry.id]]))
    }] : [];
    const dialoguePatterns = seed.dialogues[sceneIndex].turns.map((turn, turnIndex) => ({
      id: `${seed.id}-${scene.id}-dialogue-sentence-${turnIndex + 1}`,
      sceneId: scene.id,
      sourceText: turn.sourceText,
      targetTextByVariant: turn.targetTextByVariant,
      slotEntryIds: []
    }));
    return [...generated, ...dialoguePatterns];
  });
  const responsePatterns: ResponsePattern[] = curriculum.scenes.flatMap((scene, sceneIndex) => {
    const sceneSlots = slotEntries.filter((entry) => entry.primarySceneId === scene.id);
    const generated = sceneSlots.length ? [{
      id: `${seed.id}-${scene.id}-response-slots`,
      sceneId: scene.id,
      promptTargetTextByVariant: { formal: seed.response.promptFormal, informal: seed.response.promptInformal },
      answerTargetTextByVariant: { formal: seed.response.answerFormal, informal: seed.response.answerInformal },
      slotEntryIds: sceneSlots.map((entry) => entry.id)
    }] : [];
    const turns = seed.dialogues[sceneIndex].turns;
    const dialoguePatterns = turns.slice(0, -1).map((turn, turnIndex) => ({
      id: `${seed.id}-${scene.id}-dialogue-response-${turnIndex + 1}`,
      sceneId: scene.id,
      promptTargetTextByVariant: turn.targetTextByVariant,
      answerTargetTextByVariant: turns[turnIndex + 1].targetTextByVariant,
      slotEntryIds: []
    }));
    return [...generated, ...dialoguePatterns];
  });

  const scenes = curriculum.scenes.map((scene, index) => ({
    ...scene,
    vocabularyIds: domain.filter((entry) => entry.primarySceneId === scene.id).map((entry) => entry.id),
    dialogueIds: [seed.dialogues[index].id],
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
    dialogues: seed.dialogues,
    sentencePatterns,
    responsePatterns,
    quizTierIds: ["romaji-recall", "script-recall", "sentence-production", "response-production"]
  };
};

export const renderPattern = (
  template: string,
  entry: VocabularyEntry,
  variantId: SpeechVariantId,
  representation: "source" | "target",
  sourceLabel = entry.meanings[0]
) => {
  const form = formFor(entry, variantId);
  return fill(template, sourceLabel, representation === "target" ? form.representations.target : sourceLabel);
};

export const dialogue = (
  id: string,
  title: string,
  context: string,
  turns: Array<["traveler" | "local", string, string, string]>
): DialogueScenario => ({
  id,
  title,
  context,
  turns: turns.map(([speaker, english, formal, informal]) => ({
    speaker,
    sourceText: english,
    targetTextByVariant: { formal, informal }
  }))
});

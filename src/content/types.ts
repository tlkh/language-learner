export type Register = "formal" | "informal";

export type QuizTier =
  | "romaji-recall"
  | "script-recall"
  | "sentence-production"
  | "response-production";

export type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "phrase" | "counter";

export type VocabularyPriority = "must-know" | "useful" | "reference";

export interface JapaneseForm {
  kana: string;
  kanji?: string;
  romaji: string;
}

export interface VocabularyEntry {
  id: string;
  topicId: string;
  masteryKey: string;
  primarySceneId: string;
  priority: VocabularyPriority;
  meanings: string[];
  sharedForm: JapaneseForm;
  registerForms?: Partial<Record<Register, JapaneseForm>>;
  aliases: {
    script: string[];
    romaji: string[];
  };
  partOfSpeech: PartOfSpeech;
  tags: string[];
}

export interface RegisterText {
  formal: string;
  informal: string;
}

export interface DialogueTurn {
  speaker: "traveler" | "local";
  english: string;
  japanese: RegisterText;
}

export interface DialogueScenario {
  id: string;
  title: string;
  context: string;
  turns: DialogueTurn[];
}

export interface SentencePattern {
  id: string;
  sceneId: string;
  english: string;
  japanese: RegisterText;
  slotEntryIds: string[];
  slotEnglish?: Record<string, string>;
}

export interface ResponsePattern {
  id: string;
  sceneId: string;
  promptJapanese: RegisterText;
  answerJapanese: RegisterText;
  slotEntryIds: string[];
}

export interface TopicScene {
  id: string;
  title: string;
  description: string;
  vocabularyIds: string[];
  dialogueIds: string[];
  sentencePatternIds: string[];
  responsePatternIds: string[];
}

export interface LearningCollection {
  id: string;
  title: string;
  description: string;
  topicIds: string[];
  phraseSetIds?: string[];
  pinned?: boolean;
  optional?: boolean;
}

export interface SharedVocabularySet {
  id: string;
  title: string;
  description: string;
  vocabulary: VocabularyEntry[];
}

export interface RecommendedTracks {
  journey: string[];
  safety: string[];
  interests: string[];
}

export interface Topic {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  category: "essentials" | "transit" | "daily" | "interests";
  collectionId: string;
  scenes: TopicScene[];
  relatedTopicIds: string[];
  sharedVocabularySetIds: string[];
  vocabulary: VocabularyEntry[];
  dialogues: DialogueScenario[];
  sentencePatterns: SentencePattern[];
  responsePatterns: ResponsePattern[];
  tierAvailability: QuizTier[];
}

export interface LanguagePack {
  code: string;
  name: string;
  nativeName: string;
  registers: Register[];
  recommendedPath: string[];
  recommendedTracks: RecommendedTracks;
  collections: LearningCollection[];
  sharedVocabularySets: SharedVocabularySet[];
  topics: Topic[];
  normalizer: (value: string) => string;
  quizGenerators: {
    generate: (topic: Topic, options: GenerateQuizOptions) => QuizQuestion[];
    grade: (question: QuizQuestion, input: string) => GradeResult;
  };
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  sourceId: string;
  sceneId: string;
  tier: QuizTier;
  register: Register;
  prompt: string;
  promptLanguage: "en" | "ja";
  canonicalAnswer: string;
  acceptedAnswers: string[];
  helper: string;
}

export interface GradeResult {
  status: "correct" | "near-miss" | "incorrect";
  canonicalAnswer: string;
  normalizedInput: string;
  diff: Array<{ value: string; kind: "same" | "missing" | "extra" }>;
}

export interface GenerateQuizOptions {
  topicId: string;
  tier: QuizTier;
  register: Register;
  seed: number;
  count?: number;
  mastery?: Record<string, number>;
}

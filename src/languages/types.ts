export type LanguageCode = string;
export type SpeechVariantId = string;
export type QuizTierId = string;
export type RepresentationId = string;

// Compatibility aliases for consumers that still use the old vocabulary while
// packs migrate. Values are intentionally open strings and are owned by packs.
export type Register = SpeechVariantId;
export type QuizTier = QuizTierId;
export type PartOfSpeech = string;

export type VocabularyPriority = "must-know" | "useful" | "reference";

export interface RepresentationDefinition {
  id: RepresentationId;
  label: string;
  languageTag: string;
  inputMode?: "text" | "latin" | "target-script";
}

export interface SpeechVariantDefinition {
  id: SpeechVariantId;
  label: string;
  nativeLabel?: string;
  compactNativeLabel?: string;
  description?: string;
}

export interface LanguageForm {
  representations: Record<RepresentationId, string>;
  aliases: Partial<Record<RepresentationId, string[]>>;
}

export interface VocabularyEntry {
  id: string;
  topicId: string;
  masteryKey: string;
  primarySceneId: string;
  priority: VocabularyPriority;
  meanings: string[];
  baseForm: LanguageForm;
  variantForms?: Partial<Record<SpeechVariantId, LanguageForm>>;
  partOfSpeech: PartOfSpeech;
  tags: string[];
}

export interface DialogueTurn {
  speaker: "traveler" | "local";
  sourceText: string;
  targetTextByVariant: Record<SpeechVariantId, string>;
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
  sourceText: string;
  targetTextByVariant: Record<SpeechVariantId, string>;
  slotEntryIds: string[];
  slotSourceText?: Record<string, string>;
}

export interface ResponsePattern {
  id: string;
  sceneId: string;
  promptTargetTextByVariant: Record<SpeechVariantId, string>;
  answerTargetTextByVariant: Record<SpeechVariantId, string>;
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
  presentation?: "path" | "featured" | "optional";
}

export interface VocabularyGroup {
  id: string;
  title: string;
  description: string;
  entryIds: string[];
}

export interface SharedVocabularySet {
  id: string;
  title: string;
  description: string;
  vocabulary: VocabularyEntry[];
  groups: VocabularyGroup[];
}

export interface LearningTrack {
  id: string;
  title: string;
  description: string;
  topicIds: string[];
  presentation: "path" | "featured" | "optional";
}

export interface Topic {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  categoryId: string;
  collectionId: string;
  scenes: TopicScene[];
  relatedTopicIds: string[];
  sharedVocabularySetIds: string[];
  vocabulary: VocabularyEntry[];
  dialogues: DialogueScenario[];
  sentencePatterns: SentencePattern[];
  responsePatterns: ResponsePattern[];
  quizTierIds: QuizTierId[];
}

export interface QuizTierDefinition {
  id: QuizTierId;
  step: number;
  title: string;
  shortTitle: string;
  description: string;
  sessionSize: number;
  passScore: number;
}

export interface QuizQuestion {
  id: string;
  languageCode: LanguageCode;
  topicId: string;
  sourceId: string;
  sceneId: string;
  tierId: QuizTierId;
  variantId: SpeechVariantId;
  prompt: string;
  promptLanguage: string;
  canonicalAnswer: string;
  acceptedAnswers: string[];
  answerLanguage: string;
  answerRepresentationId: RepresentationId;
  answerLabel: string;
  answerPlaceholder: string;
  helper: string;
}

export interface GradeResult {
  status: "correct" | "near-miss" | "incorrect";
  canonicalAnswer: string;
  normalizedInput: string;
  diff: Array<{ value: string; kind: "same" | "missing" | "extra" }>;
}

export interface GenerateQuizOptions {
  languageCode: LanguageCode;
  topicId: string;
  tierId: QuizTierId;
  variantId: SpeechVariantId;
  seed: number;
  count?: number;
  mastery?: Record<string, number>;
  correctQuestionIds?: ReadonlySet<string>;
}

export interface CharacterItem {
  id: string;
  representations: Record<RepresentationId, string>;
  aliases?: Partial<Record<RepresentationId, string[]>>;
  referenceDetails?: Array<{ label: string; value: string }>;
}

export interface CharacterGroup {
  id: string;
  title: string;
  itemIds: string[];
}

export interface CharacterSection {
  id: string;
  title: string;
  description: string;
  groups: CharacterGroup[];
}

export interface CharacterCollection {
  id: string;
  title: string;
  description: string;
  sections: CharacterSection[];
}

export interface CharacterDrillMode {
  id: string;
  title: string;
  description: string;
  promptRepresentationId: RepresentationId;
  answerRepresentationId: RepresentationId;
  answerLabel: string;
  answerPlaceholder: string;
}

export interface CharacterCourse {
  id: string;
  title: string;
  navLabel: string;
  description: string;
  collections: CharacterCollection[];
  items: CharacterItem[];
  drillModes: CharacterDrillMode[];
  defaultDrillModeId: string;
  sessionSizes: Array<10 | 20 | "all">;
}

export interface PackPresentation {
  tagline: string;
  welcomeTitle: string;
  welcomeDescription: string;
  keyboardTitle: string;
  keyboardHelp: string;
  startTopicId: string;
  weakVocabularyTitle: string;
}

export interface LanguagePack {
  code: LanguageCode;
  name: string;
  nativeName: string;
  locale: string;
  sourceLocale: string;
  mark: string;
  targetFontFamily: string;
  representations: RepresentationDefinition[];
  speechVariants: SpeechVariantDefinition[];
  defaultSpeechVariantId: SpeechVariantId;
  presentation: PackPresentation;
  tracks: LearningTrack[];
  collections: LearningCollection[];
  sharedVocabularySets: SharedVocabularySet[];
  topics: Topic[];
  characterCourse: CharacterCourse;
  defineVocabulary?: (topic: Topic | undefined, entry: VocabularyEntry) => { target: string; source: string };
  normalizeRepresentation: (representationId: RepresentationId, value: string) => string;
  searchNormalizer: (value: string) => string;
  quiz: {
    tiers: QuizTierDefinition[];
    generate: (topic: Topic, options: GenerateQuizOptions) => QuizQuestion[];
    grade: (question: QuizQuestion, input: string) => GradeResult;
  };
}

export interface LanguageCatalogEntry {
  code: LanguageCode;
  name: string;
  nativeName: string;
  locale: string;
  mark: string;
  load: () => Promise<LanguagePack>;
}

export interface LanguagePackIndexes {
  topics: Map<string, Topic>;
  collections: Map<string, LearningCollection>;
  vocabulary: Map<string, VocabularyEntry>;
  sharedVocabularyIds: Set<string>;
  quizTiers: Map<string, QuizTierDefinition>;
  characters: Map<string, CharacterItem>;
}

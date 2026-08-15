import type { LanguageCatalogEntry, LanguageCode, LanguagePack, LanguagePackIndexes } from "./types";

export const languageCatalog: LanguageCatalogEntry[] = [
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    locale: "ja",
    mark: "あ",
    load: async () => (await import("./ja/japanese")).japanesePack
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    locale: "vi",
    mark: "đ",
    load: async () => (await import("./vi/vietnamese")).vietnamesePack
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
    locale: "th",
    mark: "ก",
    load: async () => (await import("./th/thai")).thaiPack
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    locale: "id",
    mark: "A",
    load: async () => (await import("./id/indonesian")).indonesianPack
  }
];

const catalogByCode = new Map(languageCatalog.map((entry) => [entry.code, entry]));
const packPromises = new Map<LanguageCode, Promise<LanguagePack>>();

export function getLanguageCatalogEntry(code: string | undefined) {
  return code ? catalogByCode.get(code) : undefined;
}

export function isSupportedLanguage(code: string | undefined): code is LanguageCode {
  return Boolean(code && catalogByCode.has(code));
}

export function loadLanguagePack(code: LanguageCode): Promise<LanguagePack> {
  const entry = catalogByCode.get(code);
  if (!entry) return Promise.reject(new Error(`Unknown language pack: ${code}`));
  const existing = packPromises.get(code);
  if (existing) return existing;
  const pending = entry.load();
  packPromises.set(code, pending);
  return pending;
}

export function buildPackIndexes(pack: LanguagePack): LanguagePackIndexes {
  const vocabulary = [
    ...pack.sharedVocabularySets.flatMap((set) => set.vocabulary),
    ...pack.topics.flatMap((topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain")))
  ];
  return {
    topics: new Map(pack.topics.map((topic) => [topic.id, topic])),
    collections: new Map(pack.collections.map((collection) => [collection.id, collection])),
    vocabulary: new Map(vocabulary.map((entry) => [entry.id, entry])),
    sharedVocabularyIds: new Set(pack.sharedVocabularySets.flatMap((set) => set.vocabulary.map((entry) => entry.masteryKey))),
    quizTiers: new Map(pack.quiz.tiers.map((tier) => [tier.id, tier])),
    characters: new Map(pack.characterCourse.items.map((item) => [item.id, item]))
  };
}

# Authoring language packs

Language packs are first-party TypeScript modules compiled with the application. They are modular and lazily loaded, but they are not runtime JSON, downloaded extensions, or external plugins. A pack owns its language-specific content, presentation, normalization, speech variants, quiz rules, and character course. The shared application owns routing, deterministic selection, storage, and reusable UI.

Japanese, Vietnamese, Thai, and Indonesian are currently registered. Do not add an entry to the selector until its pack is complete and validated.

## Folder layout

Use one folder per BCP-47 language code:

```text
src/languages/
  types.ts                    shared contracts
  forms.ts                    neutral form lookup
  registry.ts                 installed-pack catalog and lazy loaders
  <code>/
    <language>.ts             LanguagePack assembly and default export
    characters.ts             required character course
    quiz.ts                   generation, grading, and normalization
    curriculum.ts             collections and tracks
    helpers.ts                pack-local content builders
    topics-*.ts               authored content
```

Keep language-specific assumptions inside the pack folder. Shared pages must not import a concrete pack.

## Registry entry

Add lightweight selector metadata and a dynamic import in `src/languages/registry.ts` only after validation succeeds:

```ts
{
  code: "id",
  name: "Indonesian",
  nativeName: "Bahasa Indonesia",
  locale: "id",
  mark: "A",
  load: async () => (await import("./id/indonesian")).indonesianPack
}
```

The catalog must remain lightweight. Do not statically import pack content there. Vite emits each pack as a separate chunk; the PWA precache includes every registered chunk so installed packs remain available offline.

## Recommended authoring workflow

1. Create the pack folder and keep all language-specific modules below `src/languages/<code>`.
2. Implement the pack contract with a small fixture before importing the full curriculum. Start with one topic, one tier, one speech variant, and one character drill mode.
3. Add the pack to `src/languages/registry.ts` only after the fixture and generic validator pass. Keep the registry entry metadata-only apart from its dynamic loader.
4. Expand topics, scenes, vocabulary, quiz generation, and the character hierarchy in small batches. Add pack-specific tests for normalization and any orthographic distinctions that the generic tests cannot express.
5. Run all acceptance commands before opening a pull request. Do not rely on the TypeScript compiler alone: the content validator exercises generated sessions and cross-references that compile successfully even when the data is incomplete.

The pack is compiled into the application; adding or changing content requires a new application build. A language pack is not downloaded at runtime and cannot be installed independently by an end user.

## Required contract

`LanguagePack` is defined in `src/languages/types.ts`. A pack provides:

- identity: `code`, English and native names, BCP-47 `locale` and `sourceLocale`, and a short selector mark;
- typography: a target-script font stack assigned to `--font-target`;
- representations: stable IDs, labels, language tags, and optional input hints;
- speech variants: at least one stable string ID and a default;
- presentation: shell copy, keyboard guidance, tracks, collections, and vocabulary groups;
- curriculum: topics, scenes, dialogue, patterns, vocabulary, and shared sets;
- quiz adapter: tier metadata, session size, pass score, generation, grading, and normalization;
- character course: collections, sections, row-like groups, items, and at least one drill mode.

### IDs and language forms

IDs are persistence keys. Use lowercase ASCII slugs, never array positions or translated labels, and never change a released ID without a migration. `languageCode`, `tierId`, and `variantId` are stored with progress. Topic, source, character, course, and drill-mode IDs are also namespaced by language in IndexedDB.

Vocabulary forms use representation IDs rather than fixed Japanese fields:

```ts
const entry = {
  baseForm: {
    representations: {
      target: "selamat pagi",
      pronunciation: "səlamat paɡi"
    },
    aliases: {
      target: ["selamat pagi!"]
    }
  }
};
```

Variant-specific forms belong in `variantForms[variantId]`. Dialogue and pattern target text belongs in `targetTextByVariant`; source-language copy uses `sourceText`. A pack with one speech variant still supplies one variant record. The switch is hidden automatically.

All prompt and answer language tags must be valid BCP-47 tags. Use the most specific tag needed for input and segmentation, but do not invent private tags merely to describe a representation.

## Complete minimal pack

This example is intentionally small but contains every required part. Real packs need enough unique candidates to satisfy each tier’s `sessionSize`.

```ts
import { gradeQuestion, selectSceneBalancedQuestions } from "../../quiz/engine";
import type { LanguagePack, QuizQuestion, Topic } from "../types";

const topic: Topic = {
  id: "introductions",
  title: "Introductions",
  shortTitle: "Introductions",
  description: "Say hello and introduce yourself.",
  categoryId: "essentials",
  collectionId: "start",
  scenes: [{
    id: "hello",
    title: "Say hello",
    description: "A first greeting.",
    vocabularyIds: ["hello"],
    dialogueIds: [],
    sentencePatternIds: [],
    responsePatternIds: []
  }],
  relatedTopicIds: [],
  sharedVocabularySetIds: [],
  vocabulary: [{
    id: "hello",
    topicId: "introductions",
    masteryKey: "hello",
    primarySceneId: "hello",
    priority: "must-know",
    meanings: ["hello"],
    baseForm: { representations: { target: "halo" }, aliases: {} },
    partOfSpeech: "interjection",
    tags: ["domain"]
  }],
  dialogues: [],
  sentencePatterns: [],
  responsePatterns: [],
  quizTierIds: ["spelling"]
};

const normalize = (value: string) =>
  value.normalize("NFC").trim().toLocaleLowerCase("id");

const question = (variantId: string): QuizQuestion => ({
  id: `spelling:${variantId}:hello`,
  languageCode: "id",
  topicId: topic.id,
  sourceId: "hello",
  sceneId: "hello",
  tierId: "spelling",
  variantId,
  prompt: "hello",
  promptLanguage: "en",
  canonicalAnswer: "halo",
  acceptedAnswers: ["halo"],
  answerLanguage: "id",
  answerRepresentationId: "target",
  answerLabel: "Indonesian answer",
  answerPlaceholder: "Type Indonesian",
  helper: "Write the Indonesian word."
});

export const minimalPack: LanguagePack = {
  code: "id",
  name: "Indonesian",
  nativeName: "Bahasa Indonesia",
  locale: "id",
  sourceLocale: "en",
  mark: "A",
  targetFontFamily: "system-ui, sans-serif",
  representations: [
    { id: "target", label: "Indonesian", languageTag: "id", inputMode: "latin" },
    { id: "glyph", label: "Letter or unit", languageTag: "id" },
    { id: "reading", label: "Reading", languageTag: "id", inputMode: "latin" }
  ],
  speechVariants: [{ id: "standard", label: "Standard" }],
  defaultSpeechVariantId: "standard",
  presentation: {
    tagline: "Practical Indonesian.",
    welcomeTitle: "Indonesian is ready",
    welcomeDescription: "Use your regular keyboard.",
    keyboardTitle: "Indonesian input",
    keyboardHelp: "A standard Latin keyboard is sufficient.",
    startTopicId: topic.id,
    weakVocabularyTitle: "Worth another look"
  },
  tracks: [{ id: "path", title: "Start here", description: "Essentials", topicIds: [topic.id], presentation: "path" }],
  collections: [{ id: "start", title: "Start", description: "Essentials", topicIds: [topic.id], presentation: "path" }],
  sharedVocabularySets: [],
  topics: [topic],
  characterCourse: {
    id: "alphabet",
    title: "Alphabet and sounds",
    navLabel: "Alphabet",
    description: "Connect spelling units with their readings.",
    items: [{ id: "letter-a", representations: { glyph: "A", reading: "a" } }],
    collections: [{
      id: "latin",
      title: "Latin alphabet",
      description: "Indonesian spelling units.",
      sections: [{
        id: "vowels",
        title: "Vowels",
        description: "Vowel letters and sounds.",
        groups: [{ id: "vowels-a", title: "A", itemIds: ["letter-a"] }]
      }]
    }],
    drillModes: [{
      id: "recognition",
      title: "Read the unit",
      description: "Type its reading.",
      promptRepresentationId: "glyph",
      answerRepresentationId: "reading",
      answerLabel: "Reading",
      answerPlaceholder: "Type the reading"
    }],
    defaultDrillModeId: "recognition",
    sessionSizes: [10, 20, "all"]
  },
  normalizeRepresentation: (_representationId, value) => normalize(value),
  searchNormalizer: normalize,
  quiz: {
    tiers: [{ id: "spelling", step: 1, title: "Spell the word", shortTitle: "Spelling", description: "Recall Indonesian spelling.", sessionSize: 1, passScore: 1 }],
    generate: (_topic, options) => selectSceneBalancedQuestions([question(options.variantId)], { count: options.count ?? 1, seed: options.seed, mastery: options.mastery }),
    grade: (item, input) => gradeQuestion(item, input, normalize, item.answerLanguage)
  }
};
```

## Quiz and normalization rules

Quiz tiers are entirely pack-owned. The shared engine only provides deterministic seeded selection, scene balancing, variant-safe merging, grapheme segmentation, comparison, and confidence updates.

- Generate exactly `count ?? tier.sessionSize` unique questions.
- Put BCP-47 tags and input metadata on every prompt and answer.
- Include the canonical answer in `acceptedAnswers` and add only deliberately accepted aliases.
- Normalize per representation. Do not remove meaningful accents, tone marks, spacing, or punctuation unless the language’s orthography permits it.
- Use `Intl.Segmenter` through the shared engine for comparison. Never assume one JavaScript code unit, Unicode scalar value, or grapheme equals one learning item.
- Keep compatibility or alternate spellings explicit. The shared engine does not reject Latin input globally.

Normalization should normally establish a Unicode normalization form first. NFC preserves distinctions while treating canonically equivalent composed and decomposed sequences alike. NFKC is appropriate only when compatibility folding is intentional for that representation.

## Character-course contract

Every pack has a character course, even when its writing system is already familiar to many learners:

```text
course
  collections[]
    sections[]
      groups[]
        itemIds[] → items[]
```

A group is typically a row or coherent drill set, but the contract does not impose that label. Each item contains arbitrary Unicode strings in `representations`. A display unit may be one code point, a base plus combining marks, a digraph, or a longer orthographic unit.

A recognition mode connects two representations:

```ts
{
  id: "recognition",
  promptRepresentationId: "glyph",
  answerRepresentationId: "reading",
  answerLabel: "Reading",
  answerPlaceholder: "Type the reading"
}
```

Practice prioritizes unmastered and low-clean-streak items, then deterministically shuffles ties. Wrong answers increment failures, reveal no answer, and stay retryable. A first-try success increases the mode-specific clean streak; any failed attempt in that session resets it. Three consecutive clean sessions marks the item mastered. Unattempted items do not change mastery.

The Japanese course follows the selection, repeated-recall, withheld-answer, and post-session failure-summary ideas described in [Tofugu’s Kana Quiz guide](https://www.tofugu.com/japanese/tofugu-learn-kana-quiz/). It does not copy Tofugu’s text, mnemonics, design, or assets.

## Guidance for planned packs

### Indonesian

Use one standard speech variant unless the curriculum truly requires variant-specific target forms. A useful character course can teach Latin-letter spelling and pronunciation rather than pretending the script itself is unfamiliar. Consider vowels, consonants, common digraphs such as `ng`, `ny`, `sy`, and `kh`, and spelling-to-sound contrasts as arbitrary display units. Keep colloquial alternatives explicit rather than silently normalizing them into standard forms.

### Vietnamese

Model the alphabet, vowel letters, `đ`, and tone-bearing combinations. Use [Unicode CLDR’s Vietnamese repertoire](https://unicode.org/cldr/charts/44/summary/vi.html) as the repertoire reference. Normalize to NFC so canonically equivalent sequences such as a precomposed vowel and its decomposed base-plus-combining-marks form compare equally. Do not strip diacritics: vowel-quality marks and tone marks distinguish words, so `má`, `mà`, `mả`, `mã`, `mạ`, and `ma` must remain distinct.

Character items may deliberately use decomposed strings in fixtures to prove canonical equivalence. Display, selection, storage IDs, and grading must never infer that one visible unit is one code point.

### Thai

Follow [Unicode’s Thai-script model](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-16/) when structuring content. Separate pedagogical sections for consonant classes, positional vowels, and tone marks, while allowing groups that combine them in useful reading units. Thai vowels can appear before, after, above, or below a consonant; tone marks and other signs combine with the base. Represent the complete visible or pedagogical unit as one item string, even when it contains multiple code points.

Do not reorder Thai text by visual position, split a unit with `Array.from`, or remove tone marks during normalization. Use grapheme-aware comparison and explicit aliases where orthographic input sequences genuinely permit them.

## Validation and testing

Run:

```sh
npm test
npm run validate:content
npm run test:responsive
npm run build
```

The registry-wide validator checks IDs, locales, representations, hierarchy references, speech variants, tiers, generated sessions, accepted answers, and character groups. Add in-memory compatibility fixtures before registration and cover:

- pack loading and unknown-code routing;
- dynamic navigation labels and a hidden speech switch for one-variant packs;
- search across pack-authored representations and aliases;
- language- and variant-isolated storage;
- normalization edge cases in both composed and decomposed forms;
- 10, 20, all, and fewer-available character selection;
- wrong-answer retry, answer withholding, early finish, resumability, results, and three-clean-recall mastery;
- phone and desktop selector and practice layouts.

Run `npm run validate:content` after every registry or curriculum change. Run `npm test` for pack, engine, storage, and page behavior, then run `npm run test:responsive` when selector, practice, navigation, or responsive content changes. The production `npm run build` repeats content validation before compiling the application and service-worker precache.

For a new pack, inspect the generated build output once to confirm that its dynamic chunk is present and that the pack loads after an offline reload. Use the app's Settings screen to verify that progress reset behavior remains language-scoped; never use a reset as a substitute for a storage migration when changing released IDs.

## Authoring checklist

- [ ] Use a stable BCP-47 code and valid language tags.
- [ ] Keep all language-specific code beneath `src/languages/<code>`.
- [ ] Define stable IDs for representations, variants, tiers, topics, sources, and character items.
- [ ] Supply at least one speech variant and one quiz tier.
- [ ] Supply pack-authored tracks, collections, vocabulary groups, keyboard help, and typography.
- [ ] Generate enough unique, scene-balanced questions for every topic/tier/variant combination.
- [ ] Include canonical answers and only intentional aliases.
- [ ] Test representation-specific Unicode normalization and meaningful distinctions.
- [ ] Build a complete character hierarchy and at least one recognition mode.
- [ ] Verify arbitrary multi-codepoint character units.
- [ ] Add fixture, validator, storage, routing, search, UI, and responsive tests.
- [ ] Run all four acceptance commands.
- [ ] Register the pack only after every check passes.

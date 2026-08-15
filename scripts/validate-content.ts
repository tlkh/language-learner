import { languageCatalog, loadLanguagePack } from "../src/languages/registry";
import type { LanguagePack, VocabularyEntry } from "../src/languages/types";

const errors: string[] = [];

const unique = (values: string[], label: string) => {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value) errors.push(`${label}: empty id`);
    else if (seen.has(value)) errors.push(`${label}: duplicate id ${value}`);
    seen.add(value);
  }
};

const validLocale = (value: string, label: string) => {
  try { new Intl.Locale(value); } catch { errors.push(`${label}: invalid BCP-47 tag ${value}`); }
};

const validateForm = (pack: LanguagePack, entry: VocabularyEntry, label: string) => {
  const representationIds = new Set(pack.representations.map((item) => item.id));
  for (const [id, value] of Object.entries(entry.baseForm.representations)) {
    if (!representationIds.has(id)) errors.push(`${label}: unknown representation ${id}`);
    if (!value) errors.push(`${label}: empty ${id} representation`);
  }
  for (const id of Object.keys(entry.baseForm.aliases)) if (!representationIds.has(id)) errors.push(`${label}: aliases use unknown representation ${id}`);
  for (const [variantId, form] of Object.entries(entry.variantForms ?? {})) {
    if (!pack.speechVariants.some((variant) => variant.id === variantId)) errors.push(`${label}: unknown speech variant ${variantId}`);
    if (!form) continue;
    for (const id of Object.keys(form.representations)) if (!representationIds.has(id)) errors.push(`${label}: unknown variant representation ${id}`);
    for (const id of Object.keys(form.aliases)) if (!representationIds.has(id)) errors.push(`${label}: variant aliases use unknown representation ${id}`);
  }
};

function validatePack(pack: LanguagePack) {
  const prefix = `[${pack.code}]`;
  validLocale(pack.locale, `${prefix} locale`);
  validLocale(pack.sourceLocale, `${prefix} source locale`);
  unique(pack.representations.map((item) => item.id), `${prefix} representations`);
  pack.representations.forEach((item) => validLocale(item.languageTag, `${prefix} representation ${item.id}`));
  unique(pack.speechVariants.map((item) => item.id), `${prefix} speech variants`);
  if (!pack.speechVariants.some((item) => item.id === pack.defaultSpeechVariantId)) errors.push(`${prefix} default speech variant is missing`);
  unique(pack.quiz.tiers.map((item) => item.id), `${prefix} quiz tiers`);
  unique(pack.topics.map((item) => item.id), `${prefix} topics`);
  unique(pack.collections.map((item) => item.id), `${prefix} collections`);
  unique(pack.tracks.map((item) => item.id), `${prefix} tracks`);
  unique(pack.sharedVocabularySets.map((item) => item.id), `${prefix} shared vocabulary sets`);

  const topicIds = new Set(pack.topics.map((topic) => topic.id));
  const collectionIds = new Set(pack.collections.map((collection) => collection.id));
  const tierIds = new Set(pack.quiz.tiers.map((tier) => tier.id));
  const sharedSetIds = new Set(pack.sharedVocabularySets.map((set) => set.id));
  for (const collection of pack.collections) {
    collection.topicIds.forEach((id) => { if (!topicIds.has(id)) errors.push(`${prefix} collection ${collection.id}: missing topic ${id}`); });
    collection.phraseSetIds?.forEach((id) => { if (!sharedSetIds.has(id)) errors.push(`${prefix} collection ${collection.id}: missing phrase set ${id}`); });
  }
  for (const track of pack.tracks) track.topicIds.forEach((id) => { if (!topicIds.has(id)) errors.push(`${prefix} track ${track.id}: missing topic ${id}`); });

  const vocabularySignatures = new Map<string, string>();
  for (const set of pack.sharedVocabularySets) {
    unique(set.groups.map((group) => group.id), `${prefix} ${set.id} vocabulary groups`);
    const ids = new Set(set.vocabulary.map((entry) => entry.id));
    unique([...ids], `${prefix} ${set.id} vocabulary`);
    set.vocabulary.forEach((entry) => validateForm(pack, entry, `${prefix} ${entry.id}`));
    set.groups.flatMap((group) => group.entryIds).forEach((id) => { if (!ids.has(id)) errors.push(`${prefix} ${set.id}: group references missing entry ${id}`); });
  }

  for (const topic of pack.topics) {
    if (!topic.categoryId) errors.push(`${prefix} ${topic.id}: empty category id`);
    if (!collectionIds.has(topic.collectionId)) errors.push(`${prefix} ${topic.id}: missing collection ${topic.collectionId}`);
    else if (!pack.collections.find((collection) => collection.id === topic.collectionId)?.topicIds.includes(topic.id)) errors.push(`${prefix} ${topic.id}: collection does not reference the topic`);
    topic.relatedTopicIds.forEach((id) => { if (!topicIds.has(id)) errors.push(`${prefix} ${topic.id}: missing related topic ${id}`); });
    topic.sharedVocabularySetIds.forEach((id) => { if (!sharedSetIds.has(id)) errors.push(`${prefix} ${topic.id}: missing shared vocabulary set ${id}`); });
    topic.quizTierIds.forEach((id) => { if (!tierIds.has(id)) errors.push(`${prefix} ${topic.id}: missing quiz tier ${id}`); });
    unique(topic.scenes.map((item) => item.id), `${prefix} ${topic.id} scenes`);
    unique(topic.dialogues.map((item) => item.id), `${prefix} ${topic.id} dialogues`);
    unique(topic.sentencePatterns.map((item) => item.id), `${prefix} ${topic.id} sentence patterns`);
    unique(topic.responsePatterns.map((item) => item.id), `${prefix} ${topic.id} response patterns`);
    const entries = new Map(topic.vocabulary.map((entry) => [entry.id, entry]));
    const scenes = new Set(topic.scenes.map((scene) => scene.id));
    const dialogues = new Set(topic.dialogues.map((dialogue) => dialogue.id));
    const sentences = new Set(topic.sentencePatterns.map((pattern) => pattern.id));
    const responses = new Set(topic.responsePatterns.map((pattern) => pattern.id));
    for (const entry of topic.vocabulary) {
      if (!entry.partOfSpeech) errors.push(`${prefix} ${entry.id}: empty part-of-speech id`);
      validateForm(pack, entry, `${prefix} ${topic.id}/${entry.id}`);
      const signature = JSON.stringify([entry.meanings, entry.baseForm, entry.variantForms]);
      const previous = vocabularySignatures.get(entry.id);
      if (previous && previous !== signature) errors.push(`${prefix} conflicting vocabulary id ${entry.id}`);
      vocabularySignatures.set(entry.id, signature);
      if (entry.tags.includes("domain") && !scenes.has(entry.primarySceneId)) errors.push(`${prefix} ${entry.id}: missing primary scene ${entry.primarySceneId}`);
    }
    for (const scene of topic.scenes) {
      scene.vocabularyIds.forEach((id) => { if (!entries.has(id)) errors.push(`${prefix} ${topic.id}/${scene.id}: missing vocabulary ${id}`); });
      scene.dialogueIds.forEach((id) => { if (!dialogues.has(id)) errors.push(`${prefix} ${topic.id}/${scene.id}: missing dialogue ${id}`); });
      scene.sentencePatternIds.forEach((id) => { if (!sentences.has(id)) errors.push(`${prefix} ${topic.id}/${scene.id}: missing sentence pattern ${id}`); });
      scene.responsePatternIds.forEach((id) => { if (!responses.has(id)) errors.push(`${prefix} ${topic.id}/${scene.id}: missing response pattern ${id}`); });
    }
    for (const dialogue of topic.dialogues) for (const turn of dialogue.turns) {
      for (const variant of pack.speechVariants) if (!turn.targetTextByVariant[variant.id]) errors.push(`${prefix} ${dialogue.id}: missing ${variant.id} text`);
    }
    for (const pattern of topic.sentencePatterns) {
      pattern.slotEntryIds.forEach((id) => { if (!entries.has(id)) errors.push(`${prefix} ${pattern.id}: missing slot ${id}`); });
      for (const variant of pack.speechVariants) if (!pattern.targetTextByVariant[variant.id]) errors.push(`${prefix} ${pattern.id}: missing ${variant.id} text`);
    }
    for (const pattern of topic.responsePatterns) {
      pattern.slotEntryIds.forEach((id) => { if (!entries.has(id)) errors.push(`${prefix} ${pattern.id}: missing slot ${id}`); });
      for (const variant of pack.speechVariants) if (!pattern.promptTargetTextByVariant[variant.id] || !pattern.answerTargetTextByVariant[variant.id]) errors.push(`${prefix} ${pattern.id}: missing ${variant.id} prompt or answer`);
    }
    for (const tierId of topic.quizTierIds) for (const variant of pack.speechVariants) {
      const tier = pack.quiz.tiers.find((item) => item.id === tierId);
      if (!tier) continue;
      const questions = pack.quiz.generate(topic, { languageCode: pack.code, topicId: topic.id, tierId, variantId: variant.id, seed: 42, count: tier.sessionSize });
      if (questions.length !== tier.sessionSize) errors.push(`${prefix} ${topic.id}/${tierId}/${variant.id}: expected ${tier.sessionSize} questions, received ${questions.length}`);
      unique(questions.map((question) => question.id), `${prefix} ${topic.id}/${tierId}/${variant.id} generated questions`);
      for (const question of questions) {
        validLocale(question.promptLanguage, `${prefix} ${question.id} prompt language`);
        validLocale(question.answerLanguage, `${prefix} ${question.id} answer language`);
        if (question.languageCode !== pack.code || question.tierId !== tierId || question.variantId !== variant.id) errors.push(`${prefix} ${question.id}: incorrect pack metadata`);
        if (!pack.representations.some((representation) => representation.id === question.answerRepresentationId)) errors.push(`${prefix} ${question.id}: unknown answer representation ${question.answerRepresentationId}`);
        if (!question.acceptedAnswers.includes(question.canonicalAnswer)) errors.push(`${prefix} ${question.id}: canonical answer is not accepted`);
        if (!question.acceptedAnswers.length) errors.push(`${prefix} ${question.id}: no accepted answers`);
      }
    }
  }

  const course = pack.characterCourse;
  unique(course.items.map((item) => item.id), `${prefix} character items`);
  unique(course.collections.map((item) => item.id), `${prefix} character collections`);
  unique(course.drillModes.map((item) => item.id), `${prefix} character modes`);
  const representationIds = new Set(pack.representations.map((item) => item.id));
  const itemIds = new Set(course.items.map((item) => item.id));
  const hierarchyIds: string[] = [];
  const sectionIds: string[] = [];
  const groupIds: string[] = [];
  for (const collection of course.collections) for (const section of collection.sections) {
    sectionIds.push(section.id);
    for (const group of section.groups) {
      groupIds.push(group.id);
      hierarchyIds.push(...group.itemIds);
      group.itemIds.forEach((id) => { if (!itemIds.has(id)) errors.push(`${prefix} ${group.id}: missing character item ${id}`); });
    }
  }
  unique(sectionIds, `${prefix} character sections`);
  unique(groupIds, `${prefix} character groups`);
  if (hierarchyIds.length !== itemIds.size || new Set(hierarchyIds).size !== itemIds.size) errors.push(`${prefix} character hierarchy must reference every item exactly once`);
  for (const mode of course.drillModes) {
    if (!representationIds.has(mode.answerRepresentationId) && !course.items.some((item) => mode.answerRepresentationId in item.representations)) errors.push(`${prefix} ${mode.id}: unknown answer representation`);
    if (!course.items.every((item) => item.representations[mode.promptRepresentationId] && item.representations[mode.answerRepresentationId])) errors.push(`${prefix} ${mode.id}: incomplete item representations`);
  }
  if (!course.drillModes.some((mode) => mode.id === course.defaultDrillModeId)) errors.push(`${prefix} character default mode is missing`);
}

unique(languageCatalog.map((entry) => entry.code), "language registry");
for (const entry of languageCatalog) {
  validLocale(entry.locale, `[registry] ${entry.code}`);
  const pack = await loadLanguagePack(entry.code);
  if (pack.code !== entry.code) errors.push(`[registry] ${entry.code}: loaded pack code is ${pack.code}`);
  validatePack(pack);

  if (pack.code === "ja") {
    if (pack.topics.length !== 16) errors.push(`[ja] expected 16 topics, received ${pack.topics.length}`);
    if (pack.collections.length !== 5) errors.push(`[ja] expected 5 collections, received ${pack.collections.length}`);
    if (pack.topics.flatMap((topic) => topic.scenes).length !== 48) errors.push(`[ja] expected 48 scenes`);
    const uniqueVocabulary = new Set(pack.topics.flatMap((topic) => topic.vocabulary.map((item) => item.id)));
    if (uniqueVocabulary.size !== 1389) errors.push(`[ja] expected 1,389 vocabulary records, received ${uniqueVocabulary.size}`);
    if (pack.quiz.tiers.length !== 4) errors.push(`[ja] expected 4 quiz tiers`);
    for (const topic of pack.topics) {
      if (topic.scenes.length !== 3) errors.push(`[ja] ${topic.id}: expected 3 scenes`);
      if (topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length < 80) errors.push(`[ja] ${topic.id}: expected at least 80 domain words`);
      for (const tier of pack.quiz.tiers) if (tier.sessionSize !== 24) errors.push(`[ja] ${tier.id}: expected 24 questions`);
    }
    if (pack.characterCourse.items.length !== 214) errors.push(`[ja] expected 214 kana, received ${pack.characterCourse.items.length}`);
    for (const collection of pack.characterCourse.collections) {
      const expected = new Map([["main", 46], ["dakuten", 25], ["combination", 36]]);
      for (const section of collection.sections) {
        const kind = section.id.split("-").at(-1) ?? "";
        const count = section.groups.flatMap((group) => group.itemIds).length;
        if (count !== expected.get(kind)) errors.push(`[ja] ${section.id}: expected ${expected.get(kind)} units, received ${count}`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${languageCatalog.length} registered language pack, including generic quiz and character-course contracts.`);

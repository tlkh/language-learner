import type { LanguageForm, SpeechVariantId, VocabularyEntry } from "./types";

export function getVocabularyForm(entry: VocabularyEntry, variantId: SpeechVariantId): LanguageForm {
  return entry.variantForms?.[variantId] ?? entry.baseForm;
}

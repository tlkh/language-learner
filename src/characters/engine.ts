import type { CharacterItem, LanguagePack, RepresentationId } from "../languages";
import type { CharacterMasteryRecord } from "../storage/db";
import { seededRandom } from "../quiz/engine";

export type CharacterSessionSize = 10 | 20 | "all";

export function selectCharacterItems(
  candidateIds: string[],
  size: CharacterSessionSize,
  mastery: Map<string, CharacterMasteryRecord>,
  seed: number
) {
  const random = seededRandom(seed);
  const ranked = Array.from(new Set(candidateIds)).map((itemId) => {
    const record = mastery.get(itemId);
    return {
      itemId,
      mastered: record?.mastered ? 1 : 0,
      cleanStreak: record?.cleanStreak ?? 0,
      tie: random()
    };
  }).sort((a, b) => a.mastered - b.mastered || a.cleanStreak - b.cleanStreak || a.tie - b.tie);
  const count = size === "all" ? ranked.length : Math.min(size, ranked.length);
  return ranked.slice(0, count).map(({ itemId }) => itemId);
}

export function acceptedCharacterAnswers(item: CharacterItem, representationId: RepresentationId) {
  return Array.from(new Set([
    item.representations[representationId],
    ...(item.aliases?.[representationId] ?? [])
  ].filter(Boolean)));
}

export function gradeCharacterAnswer(
  pack: LanguagePack,
  item: CharacterItem,
  answerRepresentationId: RepresentationId,
  input: string
) {
  const normalize = (value: string) => pack.normalizeRepresentation(answerRepresentationId, value);
  const normalizedInput = normalize(input);
  return acceptedCharacterAnswers(item, answerRepresentationId).some((answer) => normalize(answer) === normalizedInput);
}

export function firstTryScore(states: Array<{ completed: boolean; failedAttempts: number }>) {
  return states.filter((state) => state.completed && state.failedAttempts === 0).length;
}

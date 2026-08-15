import type { VocabularyEntry, VocabularyPriority } from "../languages/types";

export type StudyMode = "focus" | "all";

export interface VocabularyReviewSignal {
  confidence: number;
  latestAttemptAt: number;
}

export interface VocabularyMasterySignalSource {
  sourceId: string;
  confidence: number;
  updatedAt: number;
}

const priorityRank: Record<VocabularyPriority, number> = {
  "must-know": 0,
  useful: 1,
  reference: 2
};

export function aggregateVocabularyReviewSignals(records: VocabularyMasterySignalSource[]) {
  const signals = new Map<string, VocabularyReviewSignal>();
  records.forEach((record) => {
    const current = signals.get(record.sourceId);
    signals.set(record.sourceId, {
      confidence: Math.min(current?.confidence ?? record.confidence, record.confidence),
      latestAttemptAt: Math.max(current?.latestAttemptAt ?? record.updatedAt, record.updatedAt)
    });
  });
  return signals;
}

export function selectStudyQueue(
  vocabulary: VocabularyEntry[],
  signals: ReadonlyMap<string, VocabularyReviewSignal>,
  limit = 12
) {
  if (limit <= 0) return [];

  return vocabulary
    .map((entry, authoredIndex) => ({ entry, authoredIndex, signal: signals.get(entry.id) }))
    .sort((left, right) => {
      const leftGroup = left.signal ? (left.signal.confidence < 3 ? 0 : 2) : 1;
      const rightGroup = right.signal ? (right.signal.confidence < 3 ? 0 : 2) : 1;
      if (leftGroup !== rightGroup) return leftGroup - rightGroup;

      if (leftGroup === 1) {
        const priorityDifference = priorityRank[left.entry.priority] - priorityRank[right.entry.priority];
        if (priorityDifference) return priorityDifference;
      } else if (left.signal && right.signal) {
        const confidenceDifference = left.signal.confidence - right.signal.confidence;
        if (confidenceDifference) return confidenceDifference;
        const attemptDifference = left.signal.latestAttemptAt - right.signal.latestAttemptAt;
        if (attemptDifference) return attemptDifference;
      }

      return left.authoredIndex - right.authoredIndex;
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}

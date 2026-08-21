import "fake-indexeddb/auto";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { QuizQuestion } from "../languages/types";
import { japanesePack } from "../languages/ja/japanese";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { AppStateProvider } from "../state/AppState";
import { db } from "../storage/db";
import { ResultsPage } from "./ResultsPage";

const missedQuestion: QuizQuestion = {
  id: "missed-question",
  languageCode: "ja",
  topicId: "greetings-small-talk",
  sourceId: "greetings-small-talk:konnichiwa",
  sceneId: "greeting-basics",
  tierId: "recall",
  variantId: "formal",
  prompt: "hello",
  promptLanguage: "en",
  canonicalAnswer: "こんにちは",
  acceptedAnswers: ["こんにちは"],
  answerLanguage: "ja",
  answerRepresentationId: "target",
  answerLabel: "Japanese answer",
  answerPlaceholder: "日本語で入力",
  helper: ""
};

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await Promise.all([
    db.preferences.clear(),
    db.sessions.clear(),
    db.attempts.clear(),
    db.tierProgress.clear()
  ]);
});

describe("Results page", () => {
  it("offers a focused weak-word review when answers were missed", async () => {
    await db.sessions.put({
      id: "results-session",
      languageCode: "ja",
      topicId: "greetings-small-talk",
      tierId: "recall",
      variantId: "formal",
      seed: 1,
      questions: [missedQuestion],
      currentIndex: 1,
      correct: 0,
      completed: true,
      startedAt: 1,
      updatedAt: 2
    });
    await db.attempts.add({
      sessionId: "results-session",
      languageCode: "ja",
      topicId: "greetings-small-talk",
      sourceId: missedQuestion.sourceId,
      tierId: "recall",
      variantId: "formal",
      questionId: missedQuestion.id,
      response: "wrong",
      correct: false,
      nearMiss: false,
      answeredAt: 2
    });

    render(
      <AppStateProvider>
        <LanguagePackProvider pack={japanesePack}>
          <MemoryRouter initialEntries={["/ja/results/results-session"]}>
            <Routes><Route path="/ja/results/:sessionId" element={<ResultsPage />} /></Routes>
          </MemoryRouter>
        </LanguagePackProvider>
      </AppStateProvider>
    );

    expect(await screen.findByRole("heading", { name: "Review the misses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review weak words" })).toHaveAttribute(
      "href",
      "/ja/topic/greetings-small-talk/study?mode=focus"
    );
  });
});

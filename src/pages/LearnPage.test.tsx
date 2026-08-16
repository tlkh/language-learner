import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import type { QuizQuestion } from "../languages/types";
import { AppStateProvider } from "../state/AppState";
import { db, masteryId } from "../storage/db";
import { LearnPage } from "./LearnPage";

vi.mock("../components/PwaNotice", () => ({
  OfflineBadge: () => <span>Offline</span>
}));

function renderLearnPage() {
  return render(
    <AppStateProvider>
      <LanguagePackProvider pack={japanesePack}>
        <MemoryRouter>
          <LearnPage />
        </MemoryRouter>
      </LanguagePackProvider>
    </AppStateProvider>
  );
}

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await Promise.all([
    db.preferences.clear(),
    db.characterMastery.clear(),
    db.mastery.clear(),
    db.sessions.clear(),
    db.tierProgress.clear()
  ]);
});

const question: QuizQuestion = {
  id: "resume-question",
  languageCode: "ja",
  topicId: "greetings-small-talk",
  sourceId: "resume-source",
  sceneId: "greeting-basics",
  tierId: "romaji-recall",
  variantId: "formal",
  prompt: "Hello",
  promptLanguage: "en",
  canonicalAnswer: "こんにちは",
  acceptedAnswers: ["こんにちは"],
  answerLanguage: "ja",
  answerRepresentationId: "target",
  answerLabel: "Japanese",
  answerPlaceholder: "Type Japanese",
  helper: ""
};

describe("Learn page", () => {
  it("starts with the authored topic when no quiz activity exists", async () => {
    localStorage.setItem("ll-welcome-by-language", JSON.stringify({ ja: true }));
    renderLearnPage();

    expect(await screen.findByRole("heading", { name: "Start with conversation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open topic" })).toHaveAttribute("href", "/ja/topic/greetings-small-talk");
  });

  it("chooses the topic containing the most weak words", async () => {
    localStorage.setItem("ll-welcome-by-language", JSON.stringify({ ja: true }));
    const topic = japanesePack.topics.find((item) => item.id === "aircraft-jsdf");
    const entries = topic?.vocabulary.filter((entry) => entry.tags.includes("domain")).slice(0, 2) ?? [];
    await db.mastery.bulkPut(entries.map((entry, index) => ({
      id: masteryId("ja", topic?.id ?? "", entry.id, "romaji-recall", "formal"),
      languageCode: "ja",
      topicId: topic?.id ?? "",
      sourceId: entry.id,
      tierId: "romaji-recall",
      variantId: "formal",
      confidence: 1,
      correct: 0,
      incorrect: 1,
      updatedAt: 10 + index
    })));

    renderLearnPage();

    expect(await screen.findByRole("heading", { name: `Review weak words in ${topic?.shortTitle}` })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review now" })).toHaveAttribute("href", "/ja/topic/aircraft-jsdf/study?mode=focus");
  });

  it("prioritizes a resumable quiz over a weak-word review", async () => {
    localStorage.setItem("ll-welcome-by-language", JSON.stringify({ ja: true }));
    const weakEntry = japanesePack.topics.find((item) => item.id === "aircraft-jsdf")?.vocabulary.find((entry) => entry.tags.includes("domain"));
    if (!weakEntry) throw new Error("Expected aircraft vocabulary");
    await Promise.all([
      db.mastery.put({
        id: masteryId("ja", "aircraft-jsdf", weakEntry.id, "romaji-recall", "formal"),
        languageCode: "ja",
        topicId: "aircraft-jsdf",
        sourceId: weakEntry.id,
        tierId: "romaji-recall",
        variantId: "formal",
        confidence: 1,
        correct: 0,
        incorrect: 1,
        updatedAt: 10
      }),
      db.sessions.put({
        id: "resume-session",
        languageCode: "ja",
        topicId: "greetings-small-talk",
        tierId: "romaji-recall",
        variantId: "formal",
        seed: 1,
        questions: [question],
        currentIndex: 0,
        correct: 0,
        completed: false,
        startedAt: 20,
        updatedAt: 20
      })
    ]);

    renderLearnPage();

    expect(await screen.findByRole("link", { name: "Resume" })).toHaveAttribute(
      "href",
      "/ja/topic/greetings-small-talk/quiz/romaji-recall?resume=resume-session"
    );
    expect(screen.queryByRole("link", { name: "Review now" })).not.toBeInTheDocument();
  });

  it("dismisses the character-course card and remembers the choice", async () => {
    localStorage.setItem("ll-welcome-by-language", JSON.stringify({ ja: true }));
    renderLearnPage();

    expect(screen.getByRole("heading", { name: "Safety kit" })).toBeInTheDocument();
    expect(screen.queryByText("Food restrictions, weather warnings, and urgent help stay open without prerequisites."))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Learn Kana" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss Learn Kana card" }));

    expect(screen.queryByRole("heading", { name: "Learn Kana" })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("ll-character-callout-by-language") ?? "{}"))
      .toEqual({ ja: true });

    await waitFor(async () => {
      await expect(db.preferences.get("language:ja:characterCalloutDismissed")).resolves.toMatchObject({
        value: "true"
      });
    });

    cleanup();
    renderLearnPage();
    expect(screen.queryByRole("heading", { name: "Learn Kana" })).not.toBeInTheDocument();
  });

  it("dismisses the safety kit and keeps it dismissed for this language", async () => {
    localStorage.setItem("ll-welcome-by-language", JSON.stringify({ ja: true }));
    renderLearnPage();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss Safety kit" }));
    expect(screen.queryByRole("heading", { name: "Safety kit" })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("ll-safety-kit-by-language") ?? "{}")).toEqual({ ja: true });
    await waitFor(async () => {
      await expect(db.preferences.get("language:ja:safetyKitDismissed")).resolves.toMatchObject({ value: "true" });
    });
  });
});

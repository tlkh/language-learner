import "fake-indexeddb/auto";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { japanesePack } from "../languages/ja/japanese";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { AppStateProvider } from "../state/AppState";
import { db } from "../storage/db";
import { ProgressPage } from "./ProgressPage";

function renderProgress() {
  return render(
    <AppStateProvider>
      <LanguagePackProvider pack={japanesePack}>
        <MemoryRouter><ProgressPage /></MemoryRouter>
      </LanguagePackProvider>
    </AppStateProvider>
  );
}

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await Promise.all([
    db.preferences.clear(),
    db.mastery.clear(),
    db.attempts.clear(),
    db.sessions.clear(),
    db.tierProgress.clear(),
    db.characterMastery.clear()
  ]);
});

describe("Progress page", () => {
  it("shows a useful first-session state instead of zero statistics", async () => {
    renderProgress();

    expect(await screen.findByRole("heading", { name: "Your learning record starts with a checkpoint" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Learning statistics" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Conversation" })).toHaveAttribute("href", "/ja/topic/greetings-small-talk");
    expect(screen.getByRole("link", { name: "Practice Kana" })).toHaveAttribute("href", "/ja/characters");
    expect(screen.queryByRole("heading", { name: "Recall breakdown" })).not.toBeInTheDocument();
  });

  it("restores statistics and activity once quiz answers exist", async () => {
    await db.attempts.add({
      sessionId: "session",
      languageCode: "ja",
      topicId: "greetings-small-talk",
      sourceId: "source",
      tierId: "romaji-recall",
      variantId: "formal",
      questionId: "question",
      response: "answer",
      correct: true,
      nearMiss: false,
      answeredAt: Date.now()
    });

    renderProgress();

    expect(await screen.findByLabelText("Learning statistics")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recall breakdown" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent activity" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Your learning record starts with a checkpoint" })).not.toBeInTheDocument();
  });
});

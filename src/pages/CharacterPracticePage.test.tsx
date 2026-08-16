import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import { AppStateProvider } from "../state/AppState";
import { db, type CharacterSessionRecord } from "../storage/db";
import { CharacterPage } from "./CharacterPage";
import { CharacterPracticePage } from "./CharacterPracticePage";
import { CharacterResultsPage } from "./CharacterResultsPage";

const makeSession = (overrides: Partial<CharacterSessionRecord> = {}): CharacterSessionRecord => ({
  id: "character-session",
  languageCode: "ja",
  courseId: "kana",
  drillModeId: "recognition",
  selectedItemIds: ["hiragana-main-a-1"],
  itemStates: [{ itemId: "hiragana-main-a-1", attempted: false, completed: false, failedAttempts: 0 }],
  seed: 1,
  completed: false,
  startedAt: 1,
  updatedAt: 1,
  ...overrides
});

const renderRoute = (initial: string) => render(
  <AppStateProvider><LanguagePackProvider pack={japanesePack}><MemoryRouter initialEntries={[initial]}><Routes>
    <Route path="/ja/characters" element={<CharacterPage />} />
    <Route path="/ja/characters/practice/:sessionId" element={<CharacterPracticePage />} />
    <Route path="/ja/characters/results/:sessionId" element={<CharacterResultsPage />} />
  </Routes></MemoryRouter></LanguagePackProvider></AppStateProvider>
);

afterEach(async () => {
  cleanup();
  await Promise.all([db.characterSessions.clear(), db.characterAttempts.clear(), db.characterMastery.clear()]);
});

describe("character practice UI", () => {
  it("separates the pronunciation table from practice-set controls", async () => {
    renderRoute("/ja/characters");

    expect(screen.getByRole("link", { name: "Kana & pronunciation" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "Kana table & pronunciation" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Build a practice set" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Practice sets" }));
    expect(await screen.findByRole("heading", { name: "Build a practice set" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Practice sets" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("heading", { name: "Kana table & pronunciation" })).not.toBeInTheDocument();
  });

  it("withholds wrong answers, keeps the card retryable, and locks it after recall", async () => {
    await db.characterSessions.put(makeSession());
    renderRoute("/ja/characters/practice/character-session");
    const input = await screen.findByRole("textbox", { name: "Romaji reading" });
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByText("Not yet—try this card again.");
    expect(screen.queryByText(/^a$/)).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Romaji reading" })).toBeEnabled());

    fireEvent.change(screen.getByRole("textbox", { name: "Romaji reading" }), { target: { value: "a" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByRole("heading", { name: "Every card is resolved" });
    expect(await db.characterAttempts.where("sessionId").equals("character-session").count()).toBe(2);
    expect((await db.characterSessions.get("character-session"))?.itemStates[0].failedAttempts).toBe(1);
  });

  it("confirms early finish and lists unresolved items without changing mastery", async () => {
    await db.characterSessions.put(makeSession({ selectedItemIds: ["hiragana-main-a-1", "hiragana-main-a-2"], itemStates: [
      { itemId: "hiragana-main-a-1", attempted: false, completed: false, failedAttempts: 0 },
      { itemId: "hiragana-main-a-2", attempted: false, completed: false, failedAttempts: 0 }
    ] }));
    renderRoute("/ja/characters/practice/character-session");
    expect(await screen.findAllByRole("textbox", { name: "Romaji reading" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(screen.getByRole("heading", { name: "Finish with unresolved cards?" })).toBeInTheDocument();
    expect(screen.getByText(/2 cards are still unresolved/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish session" }));
    await screen.findByRole("heading", { name: "First-try recall" });
    expect(screen.getByRole("heading", { name: "Unresolved" })).toBeInTheDocument();
    expect(await db.characterMastery.count()).toBe(0);
  });

  it("resumes incomplete sessions and can retry only weak result cards", async () => {
    await db.characterSessions.put(makeSession());
    renderRoute("/ja/characters?tab=practice");
    expect(await screen.findByRole("heading", { name: "Continue character practice" })).toBeInTheDocument();
    cleanup();

    await db.characterSessions.put(makeSession({ completed: true, itemStates: [{ itemId: "hiragana-main-a-1", attempted: true, completed: true, failedAttempts: 2 }] }));
    renderRoute("/ja/characters/results/character-session");
    const retry = await screen.findByRole("button", { name: "Retry weak" });
    fireEvent.click(retry);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Romaji reading" })).toBeInTheDocument());
    expect((await db.characterSessions.toArray()).filter((session) => !session.completed)).toHaveLength(1);
  });
});

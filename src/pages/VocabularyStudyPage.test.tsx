import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "../state/AppState";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import { db } from "../storage/db";
import { projectedSwipeOffset, VocabularyStudyPage } from "./VocabularyStudyPage";

const renderStudy = (search = "?scene=types-roles") => render(
  <AppStateProvider>
    <LanguagePackProvider pack={japanesePack}>
      <MemoryRouter initialEntries={[`/ja/topic/aircraft-jsdf/study${search}`]}>
        <Routes><Route path="/ja/topic/:topicId/study" element={<VocabularyStudyPage />} /></Routes>
      </MemoryRouter>
    </LanguagePackProvider>
  </AppStateProvider>
);

const renderPhraseStudy = (search = "") => render(
  <AppStateProvider>
    <LanguagePackProvider pack={japanesePack}>
      <MemoryRouter initialEntries={[`/ja/phrases/study${search}`]}>
        <Routes><Route path="/ja/phrases/study" element={<VocabularyStudyPage source="phrases" />} /></Routes>
      </MemoryRouter>
    </LanguagePackProvider>
  </AppStateProvider>
);

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await Promise.all([db.mastery.clear(), db.preferences.clear(), db.studyProgress.clear()]);
});

describe("focused vocabulary study", () => {
  it("defaults to a 12-card round and requires a flip before rating", async () => {
    renderStudy();

    expect(await screen.findByRole("heading", { name: "Aircraft types and roles" })).toBeInTheDocument();
    expect(screen.getByLabelText("0 of 12 cards resolved")).toBeInTheDocument();
    expect(screen.getByText("軍用機")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Again" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Got it/ })).not.toBeInTheDocument();

    const card = screen.getByRole("button", { name: /Japanese side for 軍用機/ });
    fireEvent.click(card);
    expect(screen.getByRole("button", { name: "Again" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Got it/ })).toBeInTheDocument();
    expect(screen.getByText("military aircraft")).toBeInTheDocument();
    expect(screen.getByText("ぐんようき")).toBeInTheDocument();
    expect(screen.queryByText("gunyouki")).not.toBeInTheDocument();
    expect(screen.getByText("Distinguish fighters, transports, support aircraft, helicopters, and service branches.")).toBeInTheDocument();
  });

  it("supports focus-mode keyboard controls without allowing an unflipped rating", async () => {
    renderStudy();
    await screen.findByLabelText("0 of 12 cards resolved");

    fireEvent.keyDown(window, { key: "2" });
    expect(screen.getByLabelText("0 of 12 cards resolved")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByRole("button", { name: /Translation side for 軍用機/ })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "2" });
    await waitFor(() => expect(screen.getByLabelText("1 of 12 cards resolved")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Japanese side for 戦闘機/ })).toBeInTheDocument();
  });

  it("requeues one miss once, then reports a second miss as unresolved", async () => {
    renderStudy();
    await screen.findByLabelText("0 of 12 cards resolved");

    fireEvent.click(screen.getByRole("button", { name: /Japanese side for 軍用機/ }));
    fireEvent.click(screen.getByRole("button", { name: "Again" }));

    for (let cardIndex = 0; cardIndex < 11; cardIndex += 1) {
      fireEvent.click(screen.getByRole("button", { name: /Japanese side/ }));
      fireEvent.click(screen.getByRole("button", { name: /Got it/ }));
    }

    await waitFor(() => expect(screen.getByRole("button", { name: /Japanese side for 軍用機/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Japanese side for 軍用機/ }));
    fireEvent.click(screen.getByRole("button", { name: "Again" }));

    expect(await screen.findByRole("heading", { name: "Round complete" })).toBeInTheDocument();
    expect(screen.getByText("Recalled").nextElementSibling).toHaveTextContent("11");
    expect(screen.getByText("Unresolved").nextElementSibling).toHaveTextContent("1");
    expect(screen.getByText("Extra passes").nextElementSibling).toHaveTextContent("1");
    expect(screen.getByText(/Quiz answers—not this round—remain your saved mastery record/)).toBeInTheDocument();
  });

  it("swaps one face in place without overlapping front and back content", async () => {
    renderStudy();
    const card = await screen.findByRole("button", { name: /Japanese side for 軍用機/ });

    expect(card.querySelectorAll(".study-card__face")).toHaveLength(1);
    expect(card.querySelector(".study-card__face--front")).toBeInTheDocument();
    fireEvent.click(card);
    const flippedCard = await screen.findByRole("button", { name: /Translation side for 軍用機/ });
    expect(flippedCard.querySelectorAll(".study-card__face")).toHaveLength(1);
    expect(flippedCard.querySelector(".study-card__face--front")).not.toBeInTheDocument();
  });
});

describe("browse-all vocabulary study", () => {
  it("preserves free navigation, arrow keys, and the complete topic deck", async () => {
    renderStudy("?scene=types-roles&mode=all");
    await screen.findByLabelText("Card 1 of 36");

    fireEvent.click(screen.getByRole("button", { name: /Japanese side for 軍用機/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next card" }));
    await waitFor(() => expect(screen.getByLabelText("Card 2 of 36")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Japanese side for 戦闘機/ })).toHaveAttribute("aria-pressed", "false");

    fireEvent.keyDown(window, { key: "ArrowRight" });
    await waitFor(() => expect(screen.getByLabelText("Card 3 of 36")).toBeInTheDocument());
  });

  it("offers both a focused and complete essential phrase deck", async () => {
    renderPhraseStudy();
    expect(await screen.findByLabelText("0 of 12 cards resolved")).toBeInTheDocument();
    cleanup();

    renderPhraseStudy("?mode=all");
    expect(screen.getByRole("heading", { name: "Essential Phrase Kit" })).toBeInTheDocument();
    expect(screen.getByLabelText("Card 1 of 40")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Close vocabulary study" })).toHaveAttribute("href", "/ja/phrases?tab=practice");
  });

  it("projects flick velocity into the swipe decision", () => {
    expect(projectedSwipeOffset(0, -800)).toBeLessThan(-72);
    expect(projectedSwipeOffset(0, 800)).toBeGreaterThan(72);
  });
});

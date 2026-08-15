import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "../state/AppState";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import { projectedSwipeOffset, VocabularyStudyPage } from "./VocabularyStudyPage";

const renderStudy = () => render(
  <AppStateProvider>
    <LanguagePackProvider pack={japanesePack}>
      <MemoryRouter initialEntries={["/ja/topic/aircraft-jsdf/study?scene=types-roles"]}>
        <Routes><Route path="/ja/topic/:topicId/study" element={<VocabularyStudyPage />} /></Routes>
      </MemoryRouter>
    </LanguagePackProvider>
  </AppStateProvider>
);

const renderPhraseStudy = () => render(
  <AppStateProvider>
    <LanguagePackProvider pack={japanesePack}>
      <MemoryRouter initialEntries={["/ja/phrases/study"]}>
        <Routes><Route path="/ja/phrases/study" element={<VocabularyStudyPage source="phrases" />} /></Routes>
      </MemoryRouter>
    </LanguagePackProvider>
  </AppStateProvider>
);

afterEach(cleanup);

describe("immersive vocabulary study", () => {
  it("opens a scene-scoped Japanese card and reveals paired translations", async () => {
    renderStudy();

    expect(screen.getByRole("heading", { name: "Aircraft types and roles" })).toBeInTheDocument();
    expect(screen.getByLabelText("Card 1 of 36")).toBeInTheDocument();
    expect(screen.getByText("軍用機")).toBeInTheDocument();
    expect(screen.getByText("航空機の種類や役割を説明するときに使う名詞。")).toBeInTheDocument();
    expect(screen.queryByText("military aircraft")).not.toBeInTheDocument();

    const card = screen.getByRole("button", { name: /Japanese side for 軍用機/ });
    fireEvent.click(card);
    await waitFor(() => expect(card).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByText("military aircraft")).toBeInTheDocument();
    expect(screen.getByText("gunyouki")).toBeInTheDocument();
    expect(screen.getByText(/The Japanese noun for “military aircraft,”/)).toBeInTheDocument();
  });

  it("moves with controls and arrow keys while resetting to the Japanese face", async () => {
    renderStudy();
    fireEvent.click(screen.getByRole("button", { name: /Japanese side for 軍用機/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next card" }));
    await waitFor(() => expect(screen.getByLabelText("Card 2 of 36")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Japanese side for 戦闘機/ })).toHaveAttribute("aria-pressed", "false");

    fireEvent.keyDown(window, { key: "ArrowRight" });
    await waitFor(() => expect(screen.getByLabelText("Card 3 of 36")).toBeInTheDocument());
  });

  it("opens the complete essential phrase kit in the same immersive learner", async () => {
    renderPhraseStudy();

    expect(screen.getByRole("heading", { name: "Essential Phrase Kit" })).toBeInTheDocument();
    expect(screen.getByLabelText("Card 1 of 40")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Close vocabulary study" })).toHaveAttribute("href", "/ja/phrases");

    fireEvent.click(screen.getByRole("button", { name: /Japanese side for お願いします/ }));
    await waitFor(() => expect(screen.getByText("please")).toBeInTheDocument());
  });

  it("projects flick velocity into the swipe decision", () => {
    expect(projectedSwipeOffset(0, -800)).toBeLessThan(-72);
    expect(projectedSwipeOffset(0, 800)).toBeGreaterThan(72);
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "../state/AppState";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import { db } from "../storage/db";
import { PhraseKitPage } from "./PhraseKitPage";
import { TopicPage } from "./TopicPage";
import { TopicsPage } from "./TopicsPage";

afterEach(async () => {
  cleanup();
  await Promise.all([db.preferences.clear(), db.tierProgress.clear()]);
});

const renderWithState = (node: React.ReactNode) => render(<AppStateProvider><LanguagePackProvider pack={japanesePack}>{node}</LanguagePackProvider></AppStateProvider>);

describe("trip-based curriculum UI", () => {
  it("groups topics into the five collections and finds matches inside scene descriptions", async () => {
    renderWithState(<MemoryRouter><TopicsPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Start & Connect" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Arrive & Get Around" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Safety & Conditions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Aircraft & Japanese Military Aviation" })).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Essential Phrase Kit/ })).toHaveAttribute("href", "/ja/phrases");

    fireEvent.change(screen.getByRole("textbox", { name: "Search topics and vocabulary" }), { target: { value: "border control" } });
    await waitFor(() => expect(screen.getByRole("heading", { name: "Airports & Flights" })).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: "Hotels" })).not.toBeInTheDocument();
  });

  it("opens a scene route with one dialogue and its filtered vocabulary", async () => {
    renderWithState(
      <MemoryRouter initialEntries={["/ja/topic/airports-flights/scene/checkin-border"]}>
        <Routes><Route path="/ja/topic/:topicId/scene/:sceneId" element={<TopicPage />} /></Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Check-in, baggage and border control" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Checking in" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Finding the gate" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scene vocabulary" })).toBeInTheDocument();
    expect(screen.getByText("29 unique topic entries. The shared phrase kit is linked separately.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quick study · 12" })).toHaveAttribute("href", "/ja/topic/airports-flights/study?scene=checkin-border&mode=focus");
    expect(screen.getByRole("link", { name: "Browse all 29" })).toHaveAttribute("href", "/ja/topic/airports-flights/study?scene=checkin-border&mode=all");

    const words = screen.getByRole("heading", { name: "Scene vocabulary" });
    const dialogue = screen.getByRole("heading", { name: "Dialogue in context" });
    const scenes = screen.getByRole("heading", { name: "What this scene prepares you to do" });
    const checkpoint = screen.getByRole("heading", { name: "4-step topic checkpoint" });
    expect(words.compareDocumentPosition(dialogue) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(dialogue.compareDocumentPosition(scenes) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(scenes.compareDocumentPosition(checkpoint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("links the essential phrase kit to immersive study", () => {
    renderWithState(<MemoryRouter><PhraseKitPage /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Quick study · 12" })).toHaveAttribute("href", "/ja/phrases/study?mode=focus");
    expect(screen.getByRole("link", { name: "Browse all 40" })).toHaveAttribute("href", "/ja/phrases/study?mode=all");
  });
});

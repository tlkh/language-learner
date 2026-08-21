import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "../state/AppState";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import { db } from "../storage/db";
import { PhraseKitPage } from "./PhraseKitPage";
import { QuizPage } from "./QuizPage";
import { TopicPage } from "./TopicPage";
import { TopicsPage } from "./TopicsPage";

afterEach(async () => {
  cleanup();
  await Promise.all([db.preferences.clear(), db.tierProgress.clear(), db.attempts.clear(), db.sessions.clear(), db.mastery.clear(), db.studyProgress.clear()]);
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
    expect(screen.getByRole("link", { name: "Quick study · 10" })).toHaveAttribute("href", "/ja/topic/airports-flights/study?scene=checkin-border&priority=must-know&mode=focus");
    expect(screen.getByRole("link", { name: "Browse all 10" })).toHaveAttribute("href", "/ja/topic/airports-flights/study?scene=checkin-border&priority=must-know&mode=all");
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByRole("link", { name: "Browse all 29" })).toHaveAttribute("href", "/ja/topic/airports-flights/study?scene=checkin-border&mode=all");

    const words = screen.getByRole("heading", { name: "Scene vocabulary" });
    const dialogue = screen.getByRole("heading", { name: "Dialogue in context" });
    const scenes = screen.getByRole("heading", { name: "What this scene prepares you to do" });
    expect(scenes.compareDocumentPosition(words) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(words.compareDocumentPosition(dialogue) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "3-step topic checkpoint" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Checkpoint" }));
    expect(await screen.findByRole("heading", { name: "3-step topic checkpoint" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Scene vocabulary" })).not.toBeInTheDocument();
  });

  it("links the essential phrase kit to immersive study", () => {
    renderWithState(<MemoryRouter><PhraseKitPage /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Quick study · 12" })).toHaveAttribute("href", "/ja/phrases/study?mode=focus");
    expect(screen.getByRole("link", { name: "Browse all 40" })).toHaveAttribute("href", "/ja/phrases/study?mode=all");
    fireEvent.click(screen.getByRole("link", { name: "Practice & quiz" }));
    expect(screen.getByRole("heading", { name: "Study one phrase at a time" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start quiz" })).toHaveAttribute("href", "/ja/phrases/quiz");
  });

  it("opens an essential-phrase quiz with the shared vocabulary pool", async () => {
    renderWithState(
      <MemoryRouter initialEntries={["/ja/phrases/quiz"]}>
        <Routes><Route path="/ja/phrases/quiz" element={<QuizPage source="phrases" />} /></Routes>
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { level: 1, name: "Essential phrases · Recall" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Japanese answer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leave quiz" })).toHaveAttribute("href", "/ja/phrases?tab=practice");
  });

  it("presents four keyboard-free choices for the first Japanese checkpoint", async () => {
    renderWithState(
      <MemoryRouter initialEntries={["/ja/topic/greetings-small-talk/quiz/recognition"]}>
        <Routes><Route path="/ja/topic/:topicId/quiz/:tierId" element={<QuizPage />} /></Routes>
      </MemoryRouter>
    );
    const choices = await screen.findByRole("group", { name: "Choose the meaning" });
    expect(within(choices).getAllByRole("button")).toHaveLength(4);
    const session = (await db.sessions.toArray())[0];
    const question = session.questions[0];
    const correctText = question.options?.find((option) => option.id === question.correctOptionId)?.text;
    if (!correctText) throw new Error("Expected a correct recognition option");
    fireEvent.click(within(choices).getByRole("button", { name: correctText }));
    fireEvent.click(screen.getByRole("button", { name: /Check answer/ }));
    expect(await screen.findByRole("heading", { name: "Correct" })).toBeInTheDocument();
  });
});

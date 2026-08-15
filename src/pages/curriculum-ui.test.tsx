import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "../state/AppState";
import { db } from "../storage/db";
import { TopicPage } from "./TopicPage";
import { TopicsPage } from "./TopicsPage";

afterEach(async () => {
  cleanup();
  await Promise.all([db.preferences.clear(), db.tierProgress.clear()]);
});

const renderWithState = (node: React.ReactNode) => render(<AppStateProvider>{node}</AppStateProvider>);

describe("trip-based curriculum UI", () => {
  it("groups topics into the five collections and finds matches inside scene descriptions", async () => {
    renderWithState(<MemoryRouter><TopicsPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Start & Connect" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Arrive & Get Around" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Safety & Conditions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Aircraft & Japanese Military Aviation" })).toBeInTheDocument();
    expect(screen.getByText("Safety kit")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Essential Phrase Kit/ })).toHaveAttribute("href", "/phrases");

    fireEvent.change(screen.getByRole("textbox", { name: "Search topics and vocabulary" }), { target: { value: "border control" } });
    await waitFor(() => expect(screen.getByRole("heading", { name: "Airports & Flights" })).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: "Hotels" })).not.toBeInTheDocument();
  });

  it("opens a scene route with one dialogue and its filtered vocabulary", async () => {
    renderWithState(
      <MemoryRouter initialEntries={["/topic/airports-flights/scene/checkin-border"]}>
        <Routes><Route path="/topic/:topicId/scene/:sceneId" element={<TopicPage />} /></Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Check-in, baggage and border control" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Checking in" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Finding the gate" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scene vocabulary" })).toBeInTheDocument();
    expect(screen.getByText("29 unique topic entries. The shared phrase kit is linked separately.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Study 29" })).toHaveAttribute("href", "/topic/airports-flights/study?scene=checkin-border");
  });
});

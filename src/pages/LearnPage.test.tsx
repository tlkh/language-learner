import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import { AppStateProvider } from "../state/AppState";
import { db } from "../storage/db";
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
  await Promise.all([db.preferences.clear(), db.characterMastery.clear()]);
});

describe("Learn page", () => {
  it("dismisses the character-course card and remembers the choice", async () => {
    localStorage.setItem("ll-welcome-by-language", JSON.stringify({ ja: true }));
    renderLearnPage();

    expect(screen.getByRole("heading", { name: "Safety kit" })).toBeInTheDocument();
    expect(screen.queryByText("Food restrictions, weather warnings, and urgent help stay open without prerequisites."))
      .not.toBeInTheDocument();
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
});

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppNav } from "../components/AppNav";
import { RegisterSwitch } from "../components/RegisterSwitch";
import { LanguageSelectorPage } from "../pages/LanguageSelectorPage";
import { AppStateProvider } from "../state/AppState";
import { indonesianCompatibilityFixture } from "./compatibilityFixtures";
import { LanguagePackProvider, LanguagePackRoute } from "./LanguagePackContext";

const pwaState = vi.hoisted(() => ({
  checkForUpdate: vi.fn(() => Promise.resolve()),
  needRefresh: false,
  update: vi.fn(() => Promise.resolve())
}));

vi.mock("../pwa/PwaState", () => ({ usePwaState: () => pwaState }));

afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

const state = (children: React.ReactNode) => <AppStateProvider>{children}</AppStateProvider>;

describe("language routing and navigation", () => {
  it("always shows the selector at the root, even when a language was opened before", () => {
    localStorage.setItem("ll-last-language", "ja");
    render(state(<MemoryRouter initialEntries={["/"]}><LanguageSelectorPage /></MemoryRouter>));
    expect(screen.getByRole("heading", { name: "Choose what you’re learning" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Last opened/ })).toHaveAttribute("href", "/ja/learn");
  });

  it("returns unknown language codes to the selector with an explanation", async () => {
    render(state(<MemoryRouter initialEntries={["/xx/learn"]}><Routes>
      <Route path="/" element={<LanguageSelectorPage />} />
      <Route path="/:languageCode" element={<LanguagePackRoute />}><Route path="learn" element={<Outlet />} /></Route>
    </Routes></MemoryRouter>));
    expect(await screen.findByText(/“xx” is not an installed language pack/)).toBeInTheDocument();
  });

  it("loads Japanese through the registry and builds language-prefixed, pack-labelled navigation", async () => {
    render(state(<MemoryRouter initialEntries={["/ja/learn"]}><Routes>
      <Route path="/:languageCode" element={<LanguagePackRoute />}><Route path="learn" element={<AppNav />} /></Route>
    </Routes></MemoryRouter>));
    expect((await screen.findAllByRole("link", { name: "Kana" }))[0]).toHaveAttribute("href", "/ja/characters");
    expect(screen.getAllByRole("link", { name: "Learn" })[0]).toHaveAttribute("href", "/ja/learn");
  });

  it("hides the speech-variant switch for a one-variant pack", () => {
    render(state(<LanguagePackProvider pack={indonesianCompatibilityFixture}><RegisterSwitch /></LanguagePackProvider>));
    expect(screen.queryByRole("group", { name: "Speech style" })).not.toBeInTheDocument();
  });
});

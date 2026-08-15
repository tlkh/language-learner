import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RegisterSwitch } from "../components/RegisterSwitch";
import { LanguagePackProvider } from "../languages/LanguagePackContext";
import { japanesePack } from "../languages/ja/japanese";
import { db } from "../storage/db";
import { AppStateProvider } from "./AppState";

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await db.preferences.clear();
  delete document.documentElement.dataset.theme;
  document.documentElement.style.removeProperty("color-scheme");
});

describe("system appearance", () => {
  it("follows live system-theme changes", () => {
    let dark = true;
    let onChange: (() => void) | undefined;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query: string) => ({
        get matches() {
          return dark;
        },
        media: query,
        onchange: null,
        addEventListener: (_event: string, listener: () => void) => {
          onChange = listener;
        },
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false
      })
    });
    render(<AppStateProvider><span>App</span></AppStateProvider>);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    dark = false;
    act(() => onChange?.());

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});

describe("global register preference", () => {
  const renderSwitch = (compact = false) => render(<AppStateProvider><LanguagePackProvider pack={japanesePack}><RegisterSwitch compact={compact} /></LanguagePackProvider></AppStateProvider>);

  it("uses compact Japanese labels without changing the accessible names", () => {
    renderSwitch(true);
    expect(screen.getByRole("button", { name: /formal/i })).toHaveTextContent("丁寧");
    expect(screen.getByRole("button", { name: /casual/i })).toHaveTextContent("普通");
    expect(screen.queryByText("カジュアル")).not.toBeInTheDocument();
  });

  it("persists an informal selection locally and in IndexedDB", async () => {
    renderSwitch();
    const casual = screen.getByRole("button", { name: /casual/i });
    fireEvent.click(casual);
    expect(casual).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(localStorage.getItem("ll-speech-variants") ?? "{}")).toEqual({ ja: "informal" });
    await waitFor(async () => expect((await db.preferences.get("language:ja:speechVariant"))?.value).toBe("informal"));
  });

  it("restores the register on a new provider launch", () => {
    localStorage.setItem("ll-register", "informal");
    renderSwitch();
    expect(screen.getByRole("button", { name: /casual/i })).toHaveAttribute("aria-pressed", "true");
  });
});

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RegisterSwitch } from "../components/RegisterSwitch";
import { LanguagePackProvider, useLanguagePack } from "../languages/LanguagePackContext";
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
  const selectablePack = { ...japanesePack, presentation: { ...japanesePack.presentation, speechVariantMode: "selectable" as const } };

  it("hides the Japanese register switch because polite language is the teaching target", () => {
    renderSwitch(true);
    expect(screen.queryByRole("button", { name: /formal|casual/i })).not.toBeInTheDocument();
  });

  it("keeps the reusable switch behavior for selectable language packs", async () => {
    render(<AppStateProvider><LanguagePackProvider pack={selectablePack}><RegisterSwitch /></LanguagePackProvider></AppStateProvider>);
    const casual = screen.getByRole("button", { name: /casual/i });
    fireEvent.click(casual);
    expect(casual).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(localStorage.getItem("ll-speech-variants") ?? "{}")).toEqual({ ja: "informal" });
    await waitFor(async () => expect((await db.preferences.get("language:ja:speechVariant"))?.value).toBe("informal"));
  });

  it("clears a legacy Japanese casual selection and exposes the polite variant", async () => {
    const ActiveVariant = () => <span>{useLanguagePack().variantId}</span>;
    localStorage.setItem("ll-register", "informal");
    localStorage.setItem("ll-speech-variants", JSON.stringify({ ja: "informal" }));
    await db.preferences.put({ key: "language:ja:speechVariant", value: "informal" });
    render(<AppStateProvider><LanguagePackProvider pack={japanesePack}><ActiveVariant /></LanguagePackProvider></AppStateProvider>);
    expect(screen.getByText("formal")).toBeInTheDocument();
    expect(localStorage.getItem("ll-register")).toBeNull();
    expect(JSON.parse(localStorage.getItem("ll-speech-variants") ?? "{}")).toEqual({});
    await waitFor(async () => expect(await db.preferences.get("language:ja:speechVariant")).toBeUndefined());
  });
});

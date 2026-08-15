import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RegisterSwitch } from "../components/RegisterSwitch";
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
  it("uses compact Japanese labels without changing the accessible names", () => {
    render(<AppStateProvider><RegisterSwitch compact /></AppStateProvider>);
    expect(screen.getByRole("button", { name: /formal/i })).toHaveTextContent("丁寧");
    expect(screen.getByRole("button", { name: /casual/i })).toHaveTextContent("普通");
    expect(screen.queryByText("カジュアル")).not.toBeInTheDocument();
  });

  it("persists an informal selection locally and in IndexedDB", async () => {
    render(<AppStateProvider><RegisterSwitch /></AppStateProvider>);
    const casual = screen.getByRole("button", { name: /casual/i });
    fireEvent.click(casual);
    expect(casual).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("ll-register")).toBe("informal");
    await waitFor(async () => expect((await db.preferences.get("register"))?.value).toBe("informal"));
  });

  it("restores the register on a new provider launch", () => {
    localStorage.setItem("ll-register", "informal");
    render(<AppStateProvider><RegisterSwitch /></AppStateProvider>);
    expect(screen.getByRole("button", { name: /casual/i })).toHaveAttribute("aria-pressed", "true");
  });
});

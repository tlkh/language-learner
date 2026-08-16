import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageSelectorPage } from "./LanguageSelectorPage";

const pwaState = vi.hoisted(() => ({
  checkForUpdate: vi.fn<() => Promise<void>>(() => Promise.resolve()),
  needRefresh: false as boolean,
  update: vi.fn<() => Promise<void>>(() => Promise.resolve()),
  online: true
}));

vi.mock("../pwa/PwaState", () => ({ usePwaState: () => pwaState }));

function renderSelector() {
  return render(<MemoryRouter><LanguageSelectorPage /></MemoryRouter>);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  pwaState.needRefresh = false;
  vi.clearAllMocks();
  pwaState.checkForUpdate.mockResolvedValue();
  pwaState.update.mockResolvedValue();
});

describe("Language selector update gate", () => {
  it("checks for an app update every time the selector loads", async () => {
    renderSelector();

    await waitFor(() => expect(pwaState.checkForUpdate).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("heading", { name: "Choose what you’re learning" })).toBeInTheDocument();
  });

  it("blocks language selection until a detected update is applied", async () => {
    pwaState.needRefresh = true;
    renderSelector();

    expect(await screen.findByRole("heading", { name: "A new version is ready" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Installed language packs" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Japanese/ })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: "Update and continue" }));
    await waitFor(() => expect(pwaState.update).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Updating…" })).toBeDisabled();
  });

  it("keeps the mandatory gate open and offers a retry when updating fails", async () => {
    pwaState.needRefresh = true;
    pwaState.update.mockRejectedValueOnce(new Error("offline"));
    renderSelector();

    fireEvent.click(await screen.findByRole("button", { name: "Update and continue" }));

    expect(await screen.findByText("The update could not be applied. Check your connection and try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try update again" })).toBeEnabled();
    expect(screen.queryByRole("link", { name: /Japanese/ })).not.toBeInTheDocument();
  });

  it("does not expose language links when an online update check fails", async () => {
    pwaState.checkForUpdate.mockRejectedValueOnce(new Error("network"));
    renderSelector();

    expect(await screen.findByRole("heading", { name: "Couldn’t verify this version" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Japanese/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Check again" }));
    expect(await screen.findByRole("heading", { name: "Choose what you’re learning" })).toBeInTheDocument();
  });
});

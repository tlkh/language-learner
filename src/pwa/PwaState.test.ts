import { describe, expect, it, vi } from "vitest";
import { checkForAppUpdate } from "./update";

describe("app update checks", () => {
  it("asks the active service-worker registration to check for a newer version", async () => {
    const update = vi.fn(() => Promise.resolve());
    const registration = { update } as unknown as ServiceWorkerRegistration;

    await expect(checkForAppUpdate(registration)).resolves.toBe(registration);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("does not block startup when no service worker is registered", async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
    const getRegistration = vi.fn(() => Promise.resolve(undefined));
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration,
        get ready() {
          throw new Error("the update check must not wait for service-worker readiness");
        }
      }
    });

    try {
      await expect(checkForAppUpdate()).resolves.toBeUndefined();
      expect(getRegistration).toHaveBeenCalledTimes(1);
    } finally {
      if (original) Object.defineProperty(navigator, "serviceWorker", original);
      else delete (navigator as unknown as { serviceWorker?: ServiceWorkerContainer }).serviceWorker;
    }
  });
});

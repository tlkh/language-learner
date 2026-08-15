import { describe, expect, it, vi } from "vitest";
import { checkForAppUpdate } from "./update";

describe("app update checks", () => {
  it("asks the active service-worker registration to check for a newer version", async () => {
    const update = vi.fn(() => Promise.resolve());
    const registration = { update } as unknown as ServiceWorkerRegistration;

    await expect(checkForAppUpdate(registration)).resolves.toBe(registration);
    expect(update).toHaveBeenCalledTimes(1);
  });
});

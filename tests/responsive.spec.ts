import { expect, test } from "@playwright/test";

for (const viewport of [{ name: "phone", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 900 }]) {
  test(`language selector fits the ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/#/");
    await expect(page.getByRole("heading", { name: "Choose what you’re learning" })).toBeVisible();
    await expect(page.getByRole("link", { name: /日本語 Japanese/ })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("character practice adapts one session from a phone card to a desktop grid", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/ja/characters");
  await expect(page.getByRole("heading", { level: 1, name: "Kana", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "10", exact: true }).check();
  await page.getByRole("button", { name: /Start recognition practice/ }).click();
  await expect(page).toHaveURL(/#\/ja\/characters\/practice\//);
  await expect(page.locator(".character-practice-card:visible")).toHaveCount(1);

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator(".character-practice-card:visible")).toHaveCount(10);
  await expect(page.getByText("0 of 10 recalled")).toBeVisible();
});

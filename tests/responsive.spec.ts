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
  await page.goto("/#/ja/characters?tab=practice");
  await expect(page.getByRole("heading", { level: 1, name: "Kana", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "10", exact: true }).check();
  await page.getByRole("button", { name: /Start recognition practice/ }).click();
  await expect(page).toHaveURL(/#\/ja\/characters\/practice\//);
  await expect(page.locator(".character-practice-card:visible")).toHaveCount(1);

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator(".character-practice-card:visible")).toHaveCount(10);
  await expect(page.getByText("0 of 10 recalled")).toBeVisible();
});

for (const width of [320, 375, 414, 768]) {
  test(`focused study fits at ${width}px with one-line rating controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1024 });
    await page.goto("/#/ja/topic/aircraft-jsdf/study?scene=types-roles&priority=must-know&mode=focus");
    await expect(page.getByRole("heading", { name: "Aircraft types and roles" })).toBeVisible();
    await expect(page.getByLabel(/0 of \d+ cards resolved/)).toBeVisible();
    await page.getByRole("button", { name: "Flip to answer" }).click();

    const again = page.getByRole("button", { name: "Again" });
    const gotIt = page.getByRole("button", { name: "Got it" });
    await expect(again).toBeVisible();
    await expect(gotIt).toBeVisible();
    expect(await again.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("nowrap");
    expect(await gotIt.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("nowrap");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("topic navigation keeps the leading back control and both sections inside a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/#/ja/topic/directions-navigation");
  await expect(page.getByRole("heading", { level: 1, name: "Directions & Navigation" })).toBeVisible();
  const back = await page.getByRole("link", { name: "Back to topics" }).boundingBox();
  expect(back?.x).toBeLessThan(40);
  await page.getByRole("link", { name: "Checkpoint" }).click();
  await expect(page.getByRole("heading", { name: "3-step topic checkpoint" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("quiz submit controls remain visible in a short phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/#/ja/topic/directions-navigation/quiz/recall");
  const input = page.getByRole("textbox", { name: "Japanese answer" });
  await input.focus();
  const submit = page.getByRole("button", { name: "Check answer" });
  await expect(submit).toBeVisible();
  const bounds = await submit.boundingBox();
  expect((bounds?.y ?? 600) + (bounds?.height ?? 0)).toBeLessThanOrEqual(600);
});

for (const width of [320, 375, 414, 768]) {
  test(`Japanese recognition choices fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1024 });
    await page.goto("/#/ja/topic/greetings-small-talk/quiz/recognition");
    await expect(page.getByRole("heading", { level: 1, name: "Conversation · Recognize" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Choose the meaning" }).getByRole("button")).toHaveCount(4);
    await expect(page.getByRole("button", { name: "I don’t know" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Check answer" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("switching languages on a deep link never renders the old pack", async ({ page }) => {
  await page.goto("/#/vi/learn");
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();

  await page.goto("/#/ja/topic/greetings-small-talk/quiz/recognition");

  await expect(page).toHaveURL(/#\/ja\/topic\/greetings-small-talk\/quiz\/recognition$/);
  await expect(page.getByRole("heading", { level: 1, name: "Conversation · Recognize" })).toBeVisible();
});

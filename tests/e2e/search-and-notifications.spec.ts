import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test.describe("global search and notifications", () => {
  test("leader global search finds members, expeditions, meetings, and documents", async ({ page }) => {
    await login(page, USERS.leader);
    await page.goto("/");

    const header = page.getByRole("banner");
    const searchInput = page.getByRole("textbox", { name: "Globální vyhledávání" });
    await expect(searchInput).toHaveCount(1);
    await searchInput.fill(TEST_PREFIX);

    await expect(header.getByText("Členové a uživatelé")).toBeVisible();
    await expect(header.getByText("Akce a výpravy")).toBeVisible();
    await expect(header.getByText("Schůzky")).toBeVisible();
    await expect(header.getByText("Dokumenty")).toBeVisible();

    await page.getByRole("button", { name: "Vymazat vyhledávání" }).click();
    await expect(searchInput).toHaveValue("");
  });

  test("member global search hides user directory results", async ({ page }) => {
    await login(page, USERS.member);
    await page.goto("/");

    const searchInput = page.getByRole("textbox", { name: "Globální vyhledávání" }).and(page.locator(":visible"));
    await searchInput.fill(TEST_PREFIX);

    await expect(page.getByText("Akce a výpravy").and(page.locator(":visible"))).toBeVisible();
    await expect(page.getByText("Členové a uživatelé").and(page.locator(":visible"))).toHaveCount(0);
  });

  test("creating an expedition sends a notification that a member can read", async ({ page }) => {
    await login(page, USERS.leader);
    await page.goto("/expedition");

    await page.getByRole("button", { name: "Přidat akci" }).click();
    const notifEventTitle = `${TEST_PREFIX} Notifikovaná Akce`;
    await page.locator("input#title").fill(notifEventTitle);
    await page.locator("textarea#description").fill("Test notifikace");
    await page.locator("input#location").fill("Brno");
    await page.locator("input#date").fill("2099-12-20");
    await page.locator("input#targetPatrol").fill("Všichni");
    await page.getByRole("button", { name: "Vytvořit akci" }).click();
    await expect(page.getByTestId("event-card").filter({ hasText: notifEventTitle })).toBeVisible();

    await page.context().clearCookies();
    await login(page, USERS.member);
    await page.goto("/");

    const bellButton = page.getByRole("button", { name: /Upozornění/ }).and(page.locator(":visible"));
    await bellButton.click();

    await expect(page.getByText("🏕️ Nová výprava!").and(page.locator(":visible")).first()).toBeVisible();
    await expect(page.getByText(new RegExp(notifEventTitle)).and(page.locator(":visible")).first()).toBeVisible();

    const markReadButton = page
      .getByRole("button", { name: /Označit upozornění .* jako přečtené/ })
      .and(page.locator(":visible"))
      .first();
    await markReadButton.click();
  });
});

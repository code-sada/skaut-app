import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test.describe("attendance dashboard and analytics", () => {
  test("leader can filter activities, inspect patrol and member stats, and record categorized absence", async ({ page }) => {
    await login(page, USERS.leader);
    await page.goto("/attendance");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Centrála docházky" })).toBeVisible();
    await expect(page.getByText("Průměrná účast")).toBeVisible();
    await expect(page.getByText("Zobrazeno akcí")).toBeVisible();
    await expect(page.getByText("Počet členů")).toBeVisible();

    await page.getByRole("button", { name: "Výpravy" }).click();
    await expect(page.locator("th").filter({ hasText: `${TEST_PREFIX} Expedition` })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: `${TEST_PREFIX} Meeting` })).toHaveCount(0);

    await page.getByRole("button", { name: "Schůzky" }).click();
    await expect(page.locator("th").filter({ hasText: `${TEST_PREFIX} Meeting` })).toBeVisible();

    await page.getByRole("button", { name: "Všechno" }).click();
    await expect(page.locator("th").filter({ hasText: `${TEST_PREFIX} Expedition` })).toBeVisible();

    await page.getByRole("button", { name: new RegExp(`${TEST_PREFIX} Patrol`) }).first().click();
    await expect(page.getByRole("heading", { name: `${TEST_PREFIX} Patrol` })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: `${TEST_PREFIX} Patrol` })).toHaveCount(0);

    const memberRow = page.locator("tr").filter({ hasText: `${TEST_PREFIX} Member` });
    await memberRow.getByRole("button", { name: `${TEST_PREFIX} Member` }).click();
    await expect(page.getByRole("heading", { name: `${TEST_PREFIX} Member` })).toBeVisible();
    await expect(page.getByText("Poměr účasti a důvodů absencí")).toBeVisible();

    await page
      .locator("div")
      .filter({ hasText: `${TEST_PREFIX} Expedition` })
      .getByRole("button", { name: "Upravit" })
      .first()
      .click();

    await page.getByRole("button", { name: "Nejel / Nepřijel" }).click();
    await page.getByRole("button", { name: "🤒 Nemoc / Lékař" }).click();
    await page.getByRole("button", { name: "Uložit docházku" }).click();

    await expect(page.getByText(/🤒 Nemoc: 1×/).first()).toBeVisible();
  });
});

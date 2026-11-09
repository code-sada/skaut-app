import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test.describe("expeditions management and member restrictions", () => {
  test("leader can create, edit, inspect participants, and delete an expedition", async ({ page }) => {
    await login(page, USERS.leader);
    await page.goto("/expedition");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Přidat akci" }).click();
    await expect(page.getByRole("heading", { name: "Vytvořit novou akci" })).toBeVisible();

    const customTitle = `${TEST_PREFIX} Zimní Výprava`;
    const updatedTitle = `${TEST_PREFIX} Zimní Výprava Upraveno`;

    await page.locator("input#title").fill(customTitle);
    await page.locator("textarea#description").fill("Testovací popis zimní výpravy do hor");
    await page.locator("input#location").fill("Krkonoše");
    await page.locator("input#date").fill("2099-12-10");
    await page.locator("input#targetPatrol").fill("Všichni");
    await page.getByRole("button", { name: "Vytvořit akci" }).click();

    const createdCard = page.getByTestId("event-card").filter({ hasText: customTitle });
    await expect(createdCard).toBeVisible();

    await createdCard.getByTitle("Upravit akci").click();
    await expect(page.getByRole("heading", { name: "Úprava akce" })).toBeVisible();
    await page.locator("input#title").fill(updatedTitle);
    await page.locator("input#location").fill("Jeseníky");
    await page.locator("input#priceChildren").fill("650");
    await page.locator("input#priceOlder").fill("750");
    await page.getByRole("button", { name: "Uložit změny" }).click();

    await expect(page).toHaveURL(/\/expedition$/);
    await expect(page.getByRole("heading", { name: "Úprava akce" })).toHaveCount(0);
    const updatedCard = page.getByTestId("event-card").filter({ hasText: updatedTitle });
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.getByText("Jeseníky")).toBeVisible();
    await expect(updatedCard.getByText("650 Kč")).toBeVisible();

    await updatedCard.click();
    await page.getByRole("button", { name: /Účastníci/ }).click();
    await expect(page.getByRole("heading", { name: /Přihlášení/ })).toBeVisible();
    await page.getByRole("button", { name: "Zavřít detaily" }).click();

    await updatedCard.getByTitle("Smazat akci").click();
    await expect(page.getByTestId("event-card").filter({ hasText: updatedTitle })).toHaveCount(0);
  });

  test("member cannot see create, edit, or delete expedition controls", async ({ page }) => {
    await login(page, USERS.member);
    await page.goto("/expedition");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: "Přidat akci" })).toHaveCount(0);
    const card = page.getByTestId("event-card").filter({ hasText: `${TEST_PREFIX} Expedition` });
    await expect(card).toBeVisible();
    await expect(card.getByTitle("Upravit akci")).toHaveCount(0);
    await expect(card.getByTitle("Smazat akci")).toHaveCount(0);
  });
});

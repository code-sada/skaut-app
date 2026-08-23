import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test.describe("management workflows", () => {
  test("member submits expedition attendance and sees it after reopening", async ({ page }) => {
    await login(page, USERS.member);
    await page.goto("/expedition");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("event-card").filter({ hasText: `${TEST_PREFIX} Expedition` }).click();
    await page.getByRole("button", { name: "Jedu!" }).click();
    await page.locator('textarea[name="note"]').fill("E2E attendance note");
    await page.getByRole("button", { name: "Uložit moje rozhodnutí" }).click();
    await expect(page.getByRole("button", { name: "Jedu!" })).toHaveClass(/border-\[#00c853\]/);
    await page.getByRole("button", { name: "Zavřít detaily" }).click();
    await page.getByTestId("event-card").filter({ hasText: `${TEST_PREFIX} Expedition` }).click();
    await expect(page.locator('textarea[name="note"]')).toHaveValue("E2E attendance note");
  });

  test("leader can update patrol schedule and see the saved value", async ({ page }) => {
    await login(page, USERS.leader);
    await page.goto("/patrols");
    await page.waitForLoadState("networkidle");
    const patrol = page.locator("text=E2E QA Patrol").first();
    await expect(patrol).toBeVisible();
    await page.getByLabel("Upravit schůzky E2E QA Patrol").click();
    await page.getByPlaceholder("Např. Středa 16:30 - 18:00").fill("Pátek 17:00 - 18:30");
    await page.getByPlaceholder("Např. Hlavní klubovna").fill("E2E Nová klubovna");
    await page.getByRole("button", { name: "Uložit nastavení" }).click();
    await expect(page.getByText("Pátek 17:00 - 18:30")).toBeVisible();
    await expect(page.getByText("E2E Nová klubovna")).toBeVisible();
  });

  test("leader can create and delete a document", async ({ page }) => {
    await login(page, USERS.leader);
    await page.goto("/documents");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Přidat dokument" }).click();
    await page.getByPlaceholder("Např. Přihláška na tábor").fill(`${TEST_PREFIX} Created Document`);
    await page.getByPlaceholder("https://...").fill("https://example.com/created");
    await page.getByPlaceholder("Např. Formuláře").fill(TEST_PREFIX);
    await page.getByRole("button", { name: "Uložit dokument" }).click();
    await expect(page.getByText(`${TEST_PREFIX} Created Document`, { exact: true })).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("document-card").filter({ hasText: `${TEST_PREFIX} Created Document` }).getByRole("button", { name: /Smazat dokument/ }).click();
    await expect(page.getByText(`${TEST_PREFIX} Created Document`, { exact: true })).toHaveCount(0);
  });
});

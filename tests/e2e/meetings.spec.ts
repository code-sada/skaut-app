import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test("leader generates a meeting series and can submit attendance and chat", async ({ page }) => {
  await login(page, USERS.leader);
  await page.goto("/meetings");
  await page.getByRole("button", { name: "Přidat schůzky" }).click();
  await page.getByPlaceholder("Např. Schůzka Vlků").fill(`${TEST_PREFIX} Generated Meetings`);
  await page.locator('select[name="patrolId"]').selectOption({ label: `${TEST_PREFIX} Patrol` });
  await page.locator('input[name="startDate"]').fill("2099-11-02");
  await page.locator('input[name="endDate"]').fill("2099-11-16");
  await page.locator('input[name="startTime"]').fill("16:00");
  await page.locator('input[name="endTime"]').fill("18:00");
  await page.getByRole("button", { name: "Vygenerovat sérii schůzek" }).click();
  await expect(page.getByText(`${TEST_PREFIX} Generated Meetings`, { exact: true }).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("heading", { name: `${TEST_PREFIX} Generated Meetings`, exact: true }).first().click();
  await page.getByRole("button", { name: "Přijdu", exact: true }).click();
  await page.getByRole("button", { name: "Uložit rozhodnutí" }).click();
  await page.getByRole("button", { name: /Chat/ }).click();
  await page.locator('input[name="text"]').fill("E2E meeting message");
  await page.getByRole("button", { name: "Odeslat zprávu" }).click();
  await expect(page.getByText("E2E meeting message", { exact: true })).toBeVisible();
});

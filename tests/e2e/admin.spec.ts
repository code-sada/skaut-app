import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test("admin creates and deletes a user account", async ({ page }) => {
  await login(page, USERS.admin);
  await page.goto("/admin");
  await page.getByRole("button", { name: "Vytvořit účet" }).click();
  await page.getByPlaceholder("Jméno a příjmení").fill(`${TEST_PREFIX} Created User`);
  await page.getByPlaceholder("E-mail").fill("e2e-created@skaut.test");
  await page.getByPlaceholder("Heslo").fill("CreatedPass123!");
  await page.getByRole("button", { name: "Uložit účet" }).click();
  await expect(page.getByText(`${TEST_PREFIX} Created User`, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Smazat účet ${TEST_PREFIX} Created User` }).click();
  await expect(page.getByText(`${TEST_PREFIX} Created User`, { exact: true })).toHaveCount(0);
});

test("admin cannot delete the account currently in use", async ({ page }) => {
  await login(page, USERS.admin);
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: `Smazat účet ${USERS.admin.name}` })).toHaveCount(0);
  await expect(page.getByLabel(`Vynutit změnu hesla ${USERS.admin.name}`)).toBeVisible();
});

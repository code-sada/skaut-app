import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test.describe("member search and filtering", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/members");
  });

  test("search narrows members and shows an empty state for no matches", async ({ page }) => {
    const search = page.getByPlaceholder("Hledat dítě podle jména...");
    await search.fill(`${TEST_PREFIX} Member`);
    await expect(page.getByRole("heading", { name: `${TEST_PREFIX} Member`, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: `${TEST_PREFIX} Admin`, exact: true })).toHaveCount(0);

    await search.fill("no such E2E member");
    await expect(page.getByText("Nikoho jsme s tímto filtrem nenašli.", { exact: true })).toBeVisible();
  });

  test("patrol and age filters can be applied and cleared", async ({ page }) => {
    await page.getByLabel("Filtro podle družiny").selectOption({ label: `${TEST_PREFIX} Patrol` });
    await expect(page.getByRole("heading", { name: `${TEST_PREFIX} Member`, exact: true })).toBeVisible();
    await page.getByLabel("Filtro podle družiny").selectOption("");
    await expect(page.getByRole("heading", { name: `${TEST_PREFIX} Member`, exact: true })).toBeVisible();
    await page.getByLabel("Filtro podle věku").selectOption("under10");
    await expect(page.getByText("Nikoho jsme s tímto filtrem nenašli.", { exact: true })).toBeVisible();
  });
});

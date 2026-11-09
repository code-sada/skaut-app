import { test, expect, login, TEST_PREFIX, USERS } from "./fixtures";

test.describe("member search, filtering, creation and approval workflows", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/members");
  });

  test("search narrows members and shows an empty state for no matches", async ({
    page,
  }) => {
    const search = page.getByPlaceholder("Hledat dítě podle jména...");
    await search.fill(`${TEST_PREFIX} Member`);
    await expect(
      page.getByRole("heading", { name: `${TEST_PREFIX} Member`, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: `${TEST_PREFIX} Admin`, exact: true }),
    ).toHaveCount(0);

    await search.fill("no such E2E member");
    await expect(
      page.getByText("Nikoho jsme s tímto filtrem nenašli.", { exact: true }),
    ).toBeVisible();
  });

  test("patrol and age filters can be applied and cleared", async ({
    page,
  }) => {
    await page
      .getByLabel("Filtro podle družiny")
      .selectOption({ label: `${TEST_PREFIX} Patrol` });
    await expect(
      page.getByRole("heading", { name: `${TEST_PREFIX} Member`, exact: true }),
    ).toBeVisible();

    await page.getByLabel("Filtro podle věku").selectOption("under10");
    await expect(
      page.getByText("Nikoho jsme s tímto filtrem nenašli.", { exact: true }),
    ).toBeVisible();

    await page.getByLabel("Filtro podle věku").selectOption("");
    await page.getByLabel("Filtro podle družiny").selectOption("");
    await expect(
      page.getByRole("heading", { name: `${TEST_PREFIX} Member`, exact: true }),
    ).toBeVisible();
  });

  test("leader can add a new member to registry and view their health and family details", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Přidat člena" }).click();
    await expect(
      page.getByRole("heading", { name: "Přidat nového člena" }),
    ).toBeVisible();

    await page.locator("input#name").fill(`${TEST_PREFIX} Nováček`);
    await page
      .locator("select#patrolId")
      .selectOption({ label: `${TEST_PREFIX} Patrol` });
    await page.locator("input#parentPhone").fill("+420 777 888 999");
    await page.locator("textarea#healthNote").fill("Alergie na pyl");
    await page.locator("textarea#dietaryRestrictions").fill("Bezlepková dieta");
    await page.getByRole("button", { name: "Uložit člena" }).click();

    const search = page.getByPlaceholder("Hledat dítě podle jména...");
    await search.fill(`${TEST_PREFIX} Nováček`);
    const memberCard = page
      .locator("div")
      .filter({ hasText: `${TEST_PREFIX} Nováček` })
      .first();
    await expect(memberCard).toBeVisible();
    await expect(page.getByText("Bez účtu").first()).toBeVisible();

    await page
      .getByRole("heading", { name: `${TEST_PREFIX} Nováček`, exact: true })
      .click();
    await expect(page.getByText("Alergie na pyl").first()).toBeVisible();
    await expect(page.getByText("Bezlepková dieta").first()).toBeVisible();
    await expect(page.getByText("+420 777 888 999").first()).toBeVisible();
  });

  test("submitting a member profile update creates a pending approval that can be approved", async ({
    page,
  }) => {
    const search = page.getByPlaceholder("Hledat dítě podle jména...");
    await search.fill(`${TEST_PREFIX} Member`);

    const card = page
      .locator("div.cursor-pointer")
      .filter({
        has: page.getByRole("heading", {
          name: `${TEST_PREFIX} Member`,
          exact: true,
        }),
      })
      .first();
    await card.locator("button").first().click();

    await expect(
      page.getByRole("heading", {
        name: `Úprava údajů: ${TEST_PREFIX} Member`,
      }),
    ).toBeVisible();
    await page
      .locator("textarea#healthNoteEdit")
      .fill("E2E Schválená zdravotní poznámka");
    await page
      .getByRole("button", { name: "Odeslat úpravy ke schválení" })
      .click();

    await expect(page.getByText(/Čeká na vaše schválení/)).toBeVisible();
    await expect(
      page.getByText("E2E Schválená zdravotní poznámka"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Schválit" }).first().click();
    await expect(
      page.getByText("E2E Schválená zdravotní poznámka"),
    ).toBeVisible();
  });
});

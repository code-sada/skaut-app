import { test, expect, login, USERS } from "./fixtures";

test("admin can navigate through the protected application sections", async ({ page }) => {
  await login(page, USERS.admin);

  const routes = [
    ["/", "Přehled"],
    ["/meetings", "Schůzky"],
    ["/expedition", "Nástěnka akcí"],
    ["/attendance", "Centrála docházky"],
    ["/calendar", "Kalendář"],
    ["/patrols", "Družiny a schůzky"],
    ["/members", "Členové"],
    ["/documents", "Dokumenty"],
    ["/admin", "Správa účtů"],
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`${route.replace("/", "\\/")}$`));
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});

test("member sees member-facing sections but not management navigation", async ({ page }) => {
  await login(page, USERS.member);
  await expect(page.getByRole("link", { name: "Schůzky" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Výpravy" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Docházka" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Členové" })).toHaveCount(0);
});

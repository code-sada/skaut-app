import { test, expect, login, USERS } from "./fixtures";

test.describe("authentication and access control", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Přihlášení do IS" })).toBeVisible();
  });

  test("rejects invalid credentials without creating a session", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(USERS.member.email);
    await page.getByLabel("Heslo").fill("wrong-password");
    await page.getByRole("button", { name: "Přihlásit se" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("keeps a valid session after reload and supports logout", async ({ page }) => {
    await login(page, USERS.member);
    await expect(page.getByRole("heading", { name: "Přehled" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Přehled" })).toBeVisible();
    await page.getByTitle("Odhlásit se").click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("prevents a member from accessing administrator pages", async ({ page }) => {
    await login(page, USERS.member);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Přehled" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Správa účtů" })).toHaveCount(0);
  });

  test("prevents a member from directly accessing sensitive member records", async ({ page }) => {
    await login(page, USERS.member);
    await page.goto("/members");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Přehled" })).toBeVisible();
  });
});

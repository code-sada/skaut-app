import { test, expect, login, hashPassword, TEST_PREFIX, USERS } from "./fixtures";
import { PrismaClient } from "@prisma/client";

test.describe("profile, GDPR, cookie banner, legal pages, and first-login password change", () => {
  test("displays cookie banner to new visitors, blocks login until accepted, and persists consent choice", async ({ page }) => {
    await page.goto("/login");
    const banner = page.getByRole("region", { name: "Informace o soukromí a cookies" });
    await expect(banner).toBeVisible();

    await page.getByLabel("Přihlašovací e-mail nebo jméno").fill(USERS.member.email);
    await page.getByLabel("Heslo").fill(USERS.member.password);
    await page.getByRole("button", { name: "Přihlásit se" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("form").getByRole("alert")).toContainText(
      /potvrdit souhlas s ukládáním nezbytných přihlašovacích cookies/i,
    );

    await banner.getByRole("button", { name: "Rozumím" }).click();
    await expect(banner).toHaveCount(0);

    await page.getByRole("button", { name: "Přihlásit se" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Přehled" })).toBeVisible();
  });

  test("privacy policy and terms of use pages are publicly accessible", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Zásady ochrany osobních údajů/i })).toBeVisible();

    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Podmínky používání/i })).toBeVisible();
  });

  test("enforces password change on first login when mustChangePassword is true", async ({ page }) => {
    const prisma = new PrismaClient();
    const tempEmail = "e2e-firstlogin@skaut.test";
    await prisma.user.deleteMany({ where: { email: tempEmail } });
    await prisma.user.create({
      data: {
        email: tempEmail,
        name: `${TEST_PREFIX} FirstLogin`,
        password: hashPassword("TempPass123!"),
        role: "MEMBER",
        mustChangePassword: true,
      },
    });
    await prisma.$disconnect();

    await page.addInitScript(() => {
      window.localStorage.setItem("skautapp_cookie_notice_v1", "accepted");
    });
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Přihlašovací e-mail nebo jméno").fill(tempEmail);
    await page.getByLabel("Heslo").fill("TempPass123!");
    await page.getByRole("button", { name: "Přihlásit se" }).click();

    await expect(page).toHaveURL(/\/change-password$/);
    await expect(page.getByRole("heading", { name: "První přihlášení" })).toBeVisible();

    await page.locator("input#newPassword").fill("NewSecretPass123!");
    await page.getByRole("button", { name: "Uložit nové heslo a vstoupit" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Přehled" })).toBeVisible();
  });

  test("member can export GDPR data JSON and open cancelable account deletion dialog", async ({ page }) => {
    await login(page, USERS.member);
    await page.goto("/profile");

    await expect(page.getByRole("heading", { name: "Můj profil" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Správa osobních údajů a soukromí (GDPR)" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Stáhnout moje data (JSON)" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^skautapp-moje-data-.*\.json$/);

    await page.getByRole("button", { name: "Okamžitě zrušit účet a smazat data" }).click();
    const confirmDialog = page.getByRole("alertdialog", { name: "Potvrzení smazání účtu" });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Ponechat účet" }).click();
    await expect(confirmDialog).toHaveCount(0);
  });

  test("admin profile hides self-deletion button in GDPR section", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/profile");

    await expect(page.getByRole("button", { name: "Stáhnout moje data (JSON)" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Okamžitě zrušit účet a smazat data" })).toHaveCount(0);
  });
});

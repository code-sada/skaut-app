import { test, expect, login, USERS } from "./fixtures";
import { PrismaClient } from "@prisma/client";
import type { Page } from "@playwright/test";

type ServerActionRequest = {
  url: string;
  headers: Record<string, string>;
  body: Buffer;
};

async function captureServerAction(page: Page, submit: () => Promise<void>) {
  let capturedRequest: ServerActionRequest | undefined;
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.method() === "POST" && request.headers()["next-action"]) {
      const headers = { ...request.headers() };
      delete headers.host;
      delete headers.connection;
      delete headers["content-length"];
      delete headers.cookie;
      capturedRequest = {
        url: request.url(),
        headers,
        body: request.postDataBuffer() || Buffer.from(""),
      };
      await route.abort();
      return;
    }
    await route.continue();
  });

  await submit().catch(() => undefined);
  await page.unroute("**/*");
  if (!capturedRequest) throw new Error("Server action request was not captured");
  return capturedRequest;
}

async function replayServerAction(page: Page, action: ServerActionRequest) {
  return page.request.fetch(action.url, {
    method: "POST",
    headers: action.headers,
    data: action.body,
  });
}

test("member cannot replay the administrator account-creation server action", async ({ page }) => {
  await login(page, USERS.admin);
  await page.goto("/admin");
  await page.getByRole("button", { name: "Vytvořit účet" }).click();
  await page.getByPlaceholder("Jméno a příjmení").fill("E2E Security Escalation");
  await page.getByPlaceholder("E-mail").fill("e2e-security-escalation@skaut.test");
  await page.getByPlaceholder("Heslo").fill("EscalationPass123!");
  await page.locator('select[name="role"]').selectOption("admin");

  const action = await captureServerAction(page, () =>
    page.getByRole("button", { name: "Uložit účet" }).click(),
  );
  await page.context().clearCookies();
  await login(page, USERS.member);
  const response = await replayServerAction(page, action);
  expect(response.status()).toBe(500);

  const prisma = new PrismaClient();
  const escalatedUsers = await prisma.user.findMany({
    where: { email: "e2e-security-escalation@skaut.test" },
  });
  await prisma.$disconnect();
  expect(escalatedUsers).toHaveLength(0);
});

test("an unauthenticated browser cannot replay the account-creation server action", async ({ page }) => {
  await login(page, USERS.admin);
  await page.goto("/admin");
  await page.getByRole("button", { name: "Vytvořit účet" }).click();
  await page.getByPlaceholder("Jméno a příjmení").fill("E2E Security Anonymous");
  await page.getByPlaceholder("E-mail").fill("e2e-security-anonymous@skaut.test");
  await page.getByPlaceholder("Heslo").fill("AnonymousPass123!");
  await page.locator('select[name="role"]').selectOption("admin");
  const action = await captureServerAction(page, () =>
    page.getByRole("button", { name: "Uložit účet" }).click(),
  );

  await page.context().clearCookies();
  const response = await replayServerAction(page, action);
  expect(response.status()).toBe(500);

  const prisma = new PrismaClient();
  const anonymousUsers = await prisma.user.findMany({
    where: { email: "e2e-security-anonymous@skaut.test" },
  });
  await prisma.$disconnect();
  expect(anonymousUsers).toHaveLength(0);
});

test("member cannot replay the administrator account-deletion server action", async ({ page }) => {
  await login(page, USERS.admin);
  await page.goto("/admin");
  const targetCard = page.getByTestId("user-card").filter({ hasText: USERS.member.name });
  const action = await captureServerAction(page, () =>
    targetCard.getByRole("button", { name: `Smazat účet ${USERS.member.name}` }).click(),
  );

  await page.context().clearCookies();
  await login(page, USERS.member);
  const response = await replayServerAction(page, action);
  expect(response.status()).toBe(500);

  const prisma = new PrismaClient();
  const targetUser = await prisma.user.findUnique({ where: { email: USERS.member.email } });
  await prisma.$disconnect();
  expect(targetUser).not.toBeNull();
});

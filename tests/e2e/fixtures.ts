import { test as base, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

export const test = base;
export { expect };

export const TEST_PREFIX = "E2E QA";
export const USERS = {
  admin: { email: "e2e-admin@skaut.test", password: "AdminPass123!", name: `${TEST_PREFIX} Admin`, role: "admin" },
  leader: { email: "e2e-leader@skaut.test", password: "LeaderPass123!", name: `${TEST_PREFIX} Leader`, role: "user" },
  member: { email: "e2e-member@skaut.test", password: "MemberPass123!", name: `${TEST_PREFIX} Member`, role: "MEMBER" },
};

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function login(page: Page, user: (typeof USERS)[keyof typeof USERS]) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(user.email);
  await page.getByLabel("Heslo").fill(user.password);
  await page.getByRole("button", { name: "Přihlásit se" }).click();
  await expect(page).toHaveURL(/\/$/);
}

export async function createFixtures() {
  const prisma = new PrismaClient();
  await prisma.$transaction(async (db) => {
    const patrol = await db.patrol.create({ data: { name: `${TEST_PREFIX} Patrol`, schedule: "Středa 16:30 - 18:00", location: "E2E Klubovna" } });
    const users = await Promise.all(Object.values(USERS).map((user) => db.user.create({
      data: { ...user, password: hashPassword(user.password), patrolId: patrol.id, mustChangePassword: false },
    })));
    const event = await db.event.create({ data: {
      title: `${TEST_PREFIX} Expedition`, description: "E2E expedition description", location: "E2E Forest",
      date: new Date("2099-10-16T16:00:00Z"), dateEnd: new Date("2099-10-18T14:00:00Z"), targetPatrol: "Všichni",
      capacity: 20, priceChildren: 450, priceOlder: 500, createdById: users[0].id,
    } });
    const meeting = await db.meeting.create({ data: {
      title: `${TEST_PREFIX} Meeting`, date: new Date("2099-10-17T16:00:00Z"), endTime: "18:00", location: "E2E Klubovna", patrolId: patrol.id,
    } });
    await db.document.create({ data: { name: `${TEST_PREFIX} Document`, url: "https://example.com/e2e", category: TEST_PREFIX, type: "link" } });
    return { patrolId: patrol.id, userIds: users.map((user) => user.id), eventId: event.id, meetingId: meeting.id };
  });
  await prisma.$disconnect();
}

export async function cleanupFixtures() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({ where: { email: { startsWith: "e2e-" } }, select: { id: true } });
  const userIds = users.map((user) => user.id);
  await prisma.$transaction([
    prisma.attendance.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.meetingAttendance.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.meetingMessage.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.pendingUpdate.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.notification.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.event.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } }),
    prisma.meeting.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } }),
    prisma.document.deleteMany({ where: { name: { startsWith: TEST_PREFIX } } }),
    prisma.user.deleteMany({ where: { email: { startsWith: "e2e-" } } }),
    prisma.patrol.deleteMany({ where: { name: { startsWith: TEST_PREFIX } } }),
  ]);
  await prisma.$disconnect();
}

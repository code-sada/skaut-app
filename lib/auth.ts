import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import crypto from "crypto";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const SESSION_SECRET =
  process.env.SESSION_SECRET || "skaut-app-hmac-secret-key-2026-v1-secure";

export const MANAGEMENT_ROLES = new Set([
  "admin",
  "user",
  "leader",
  "LEADER",
  "vedouci",
]);

export const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  patrolId: true,
  mustChangePassword: true,
  birthDate: true,
  healthNote: true,
  parentPhone: true,
  motherName: true,
  motherPhone: true,
  fatherName: true,
  fatherPhone: true,
  otherGuardianName: true,
  otherGuardianPhone: true,
  address: true,
  city: true,
  postalCode: true,
  dietaryRestrictions: true,
} as const;

export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  role: true,
  patrolId: true,
} as const;

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function computeSessionSignature(
  userId: string,
  passwordHash: string,
  role: string,
): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${userId}:${passwordHash}:${role}`)
    .digest("hex");
}

export function verifySignatureTimingSafe(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

export async function setSessionCookies(user: {
  id: string;
  password: string;
  role: string;
}) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const sig = computeSessionSignature(user.id, user.password, user.role);

  cookieStore.set("userId", user.id, {
    httpOnly: true,
    secure: isProd,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("sessionSig", sig, {
    httpOnly: true,
    secure: isProd,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  cookieStore.delete("sessionSig");
}

export async function getSessionUser(includePatrol = false) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const sessionSig = cookieStore.get("sessionSig")?.value;

  if (!userId || !sessionSig) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: includePatrol ? { patrol: true } : undefined,
  });

  if (!user) return null;

  const expectedSig = computeSessionSignature(
    user.id,
    user.password,
    user.role,
  );
  if (!verifySignatureTimingSafe(sessionSig, expectedSig)) {
    return null;
  }

  return user;
}

export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

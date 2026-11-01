"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import {
  prisma,
  MANAGEMENT_ROLES,
  getSessionUser,
  hashPassword,
} from "@/lib/auth";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Nepřihlášen");
  return user;
}

function cleanStr(val: FormDataEntryValue | null, maxLen = 250): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed ? trimmed.slice(0, maxLen) : null;
}

export async function requestProfileUpdate(formData: FormData) {
  const requester = await requireUser();
  const userId = ((formData.get("userId") as string) || "").trim();
  const birthDateStr = ((formData.get("birthDate") as string) || "").trim();

  if (
    !userId ||
    (!MANAGEMENT_ROLES.has(requester.role) && userId !== requester.id)
  ) {
    throw new Error("Nemáte oprávnění");
  }

  let parsedBirthDate: string | null = null;
  if (birthDateStr) {
    const d = new Date(birthDateStr);
    if (!isNaN(d.getTime())) {
      parsedBirthDate = d.toISOString();
    }
  }

  const updates = {
    name: cleanStr(formData.get("name"), 120),
    patrolId: cleanStr(formData.get("patrolId"), 100),
    healthNote: cleanStr(formData.get("healthNote"), 1000),
    dietaryRestrictions: cleanStr(formData.get("dietaryRestrictions"), 1000),
    address: cleanStr(formData.get("address"), 200),
    city: cleanStr(formData.get("city"), 100),
    postalCode: cleanStr(formData.get("postalCode"), 30),
    parentPhone: cleanStr(formData.get("parentPhone"), 50),
    motherName: cleanStr(formData.get("motherName"), 120),
    motherPhone: cleanStr(formData.get("motherPhone"), 50),
    fatherName: cleanStr(formData.get("fatherName"), 120),
    fatherPhone: cleanStr(formData.get("fatherPhone"), 50),
    otherGuardianName: cleanStr(formData.get("otherGuardianName"), 120),
    otherGuardianPhone: cleanStr(formData.get("otherGuardianPhone"), 50),
    birthDate: parsedBirthDate,
  };

  await prisma.pendingUpdate.create({
    data: {
      userId,
      requestedBy: requester.id,
      data: JSON.stringify(updates),
    },
  });

  revalidatePath("/members");
  return { success: true };
}

export async function approveUpdate(updateId: string) {
  const requester = await requireUser();
  if (!MANAGEMENT_ROLES.has(requester.role)) {
    return { success: false, error: "Nemáte oprávnění schvalovat změny." };
  }

  const pending = await prisma.pendingUpdate.findUnique({
    where: { id: updateId },
  });
  if (!pending) return { success: false, error: "Nenalezeno" };

  const submittedData = JSON.parse(pending.data);
  const allowedFields = [
    "name",
    "patrolId",
    "healthNote",
    "dietaryRestrictions",
    "address",
    "city",
    "postalCode",
    "parentPhone",
    "motherName",
    "motherPhone",
    "fatherName",
    "fatherPhone",
    "otherGuardianName",
    "otherGuardianPhone",
    "birthDate",
  ] as const;
  const newData = Object.fromEntries(
    allowedFields
      .filter((field) =>
        Object.prototype.hasOwnProperty.call(submittedData, field),
      )
      .map((field) => [field, submittedData[field]]),
  );

  await prisma.user.update({
    where: { id: pending.userId },
    data: newData,
  });

  await prisma.pendingUpdate.delete({ where: { id: updateId } });
  revalidatePath("/members");
  return { success: true };
}

export async function rejectUpdate(updateId: string) {
  const requester = await requireUser();
  if (!MANAGEMENT_ROLES.has(requester.role)) {
    return { success: false, error: "Nemáte oprávnění zamítat změny." };
  }

  await prisma.pendingUpdate.delete({ where: { id: updateId } });
  revalidatePath("/members");
  return { success: true };
}

export async function createMember(formData: FormData) {
  const requester = await requireUser();
  if (!MANAGEMENT_ROLES.has(requester.role)) {
    return { success: false, error: "Nemáte oprávnění vytvářet členy." };
  }
  const name = cleanStr(formData.get("name"), 120);
  const rawEmail = cleanStr(formData.get("email"), 150);
  const patrolId = cleanStr(formData.get("patrolId"), 100);
  const birthDateStr = cleanStr(formData.get("birthDate"), 50);

  if (!name) {
    return { success: false, error: "Jméno a příjmení je povinné." };
  }

  const email =
    rawEmail || `bez-uctu-${crypto.randomUUID()}@evidence.skautapp.local`;

  if (rawEmail) {
    const existingUser = await prisma.user.findUnique({
      where: { email: rawEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: `Člen nebo účet s e-mailem ${rawEmail} už existuje! Zvolte prosím jiný.`,
      };
    }
  }

  let parsedBirthDate: Date | null = null;
  if (birthDateStr) {
    const d = new Date(birthDateStr);
    if (!isNaN(d.getTime())) parsedBirthDate = d;
  }

  // Vytvoří pouze člena v evidenci BEZ přihlašovacího účtu (password = "")
  await prisma.user.create({
    data: {
      name,
      email,
      password: "",
      role: "MEMBER",
      patrolId: patrolId || undefined,
      birthDate: parsedBirthDate,
      parentPhone: cleanStr(formData.get("parentPhone"), 50),
      motherName: cleanStr(formData.get("motherName"), 120),
      motherPhone: cleanStr(formData.get("motherPhone"), 50),
      fatherName: cleanStr(formData.get("fatherName"), 120),
      fatherPhone: cleanStr(formData.get("fatherPhone"), 50),
      otherGuardianName: cleanStr(formData.get("otherGuardianName"), 120),
      otherGuardianPhone: cleanStr(formData.get("otherGuardianPhone"), 50),
      healthNote: cleanStr(formData.get("healthNote"), 1000),
      dietaryRestrictions: cleanStr(formData.get("dietaryRestrictions"), 1000),
      address: cleanStr(formData.get("address"), 200),
      city: cleanStr(formData.get("city"), 100),
      postalCode: cleanStr(formData.get("postalCode"), 30),
      mustChangePassword: false,
    },
  });

  revalidatePath("/members");
  revalidatePath("/admin");
  revalidatePath("/attendance");
  return { success: true };
}

export async function activateMemberAccount(formData: FormData) {
  const requester = await requireUser();
  if (!MANAGEMENT_ROLES.has(requester.role)) {
    return { success: false, error: "Nemáte oprávnění zakládat účty." };
  }

  const userId = cleanStr(formData.get("userId"), 100);
  const email = cleanStr(formData.get("email"), 150);
  const password = ((formData.get("password") as string) || "").trim();
  const role = cleanStr(formData.get("role"), 50) || "MEMBER";

  if (!userId || !email || !password) {
    return {
      success: false,
      error: "Vyplňte prosím přihlašovací e-mail i heslo.",
    };
  }

  if (password.length < 4) {
    return {
      success: false,
      error: "Heslo musí mít alespoň 4 znaky.",
    };
  }

  const existingWithEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingWithEmail && existingWithEmail.id !== userId) {
    return {
      success: false,
      error: `E-mail ${email} už používá jiný uživatel.`,
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      password: hashPassword(password),
      role,
      mustChangePassword: true,
    },
  });

  revalidatePath("/members");
  revalidatePath("/admin");
  return { success: true };
}

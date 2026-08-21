"use server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// Pomocná funkce pro zjištění role aktuálně přihlášeného (zabrání zneužití dětmi)
async function getCurrentUserRole() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role;
}

// 1. Rodič/Člen navrhne změnu
export async function requestProfileUpdate(formData: FormData) {
  const userId = formData.get("userId") as string;
  const requestedBy = formData.get("requestedBy") as string;
  const birthDateStr = formData.get("birthDate") as string;

  const updates = {
    healthNote: formData.get("healthNote"),
    parentPhone: formData.get("parentPhone"),
    motherName: formData.get("motherName"),
    motherPhone: formData.get("motherPhone"),
    fatherName: formData.get("fatherName"),
    fatherPhone: formData.get("fatherPhone"),
    otherGuardianName: formData.get("otherGuardianName"),
    otherGuardianPhone: formData.get("otherGuardianPhone"),
    birthDate: birthDateStr ? new Date(birthDateStr).toISOString() : null,
  };

  await prisma.pendingUpdate.create({
    data: {
      userId,
      requestedBy,
      data: JSON.stringify(updates),
    },
  });

  revalidatePath("/members");
  return { success: true };
}

// 2. Vedoucí SCHVÁLÍ úpravu (Zabezpečeno!)
export async function approveUpdate(updateId: string) {
  const role = await getCurrentUserRole();
  if (role !== "ADMIN" && role !== "LEADER") {
    return { success: false, error: "Nemáte oprávnění schvalovat změny." };
  }

  const pending = await prisma.pendingUpdate.findUnique({
    where: { id: updateId },
  });
  if (!pending) return { success: false, error: "Nenalezeno" };

  const newData = JSON.parse(pending.data);

  await prisma.user.update({
    where: { id: pending.userId },
    data: newData,
  });

  await prisma.pendingUpdate.delete({ where: { id: updateId } });
  revalidatePath("/members");
  return { success: true };
}

// 3. Vedoucí ZAMÍTNE úpravu (Zabezpečeno!)
export async function rejectUpdate(updateId: string) {
  const role = await getCurrentUserRole();
  if (role !== "ADMIN" && role !== "LEADER") {
    return { success: false, error: "Nemáte oprávnění zamítat změny." };
  }

  await prisma.pendingUpdate.delete({ where: { id: updateId } });
  revalidatePath("/members");
  return { success: true };
}

// 4. Vytvoření nového člena / dítěte
export async function createMember(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const patrolId = (formData.get("patrolId") as string) || null;
  const birthDateStr = formData.get("birthDate") as string;

  const parentPhone = formData.get("parentPhone") as string;
  const motherName = formData.get("motherName") as string;
  const motherPhone = formData.get("motherPhone") as string;
  const fatherName = formData.get("fatherName") as string;
  const fatherPhone = formData.get("fatherPhone") as string;
  const otherGuardianName = formData.get("otherGuardianName") as string;
  const otherGuardianPhone = formData.get("otherGuardianPhone") as string;

  const healthNote = formData.get("healthNote") as string;

  // ZKONTROLUJEME, JESTLI EMAIL UŽ NEEXISTUJE - vracíme objekt s chybou
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: `Uživatel s e-mailem ${email} už existuje! Zvolte prosím jiný.`,
    };
  }

  // POKUD JE EMAIL VOLNÝ, ULOŽÍME HO
  await prisma.user.create({
    data: {
      name,
      email,
      password: "skaut123",
      role: "MEMBER",
      patrolId: patrolId || undefined,
      birthDate: birthDateStr ? new Date(birthDateStr) : null,
      parentPhone: parentPhone || null,
      motherName: motherName || null,
      motherPhone: motherPhone || null,
      fatherName: fatherName || null,
      fatherPhone: fatherPhone || null,
      otherGuardianName: otherGuardianName || null,
      otherGuardianPhone: otherGuardianPhone || null,
      healthNote: healthNote || null,
      mustChangePassword: true,
    },
  });

  revalidatePath("/members");
  return { success: true };
}

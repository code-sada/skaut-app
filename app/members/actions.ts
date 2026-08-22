"use server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

async function getCurrentUserRole() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role;
}

export async function requestProfileUpdate(formData: FormData) {
  const userId = formData.get("userId") as string;
  const requestedBy = formData.get("requestedBy") as string;
  const birthDateStr = formData.get("birthDate") as string;

  const updates = {
    name: formData.get("name"),
    patrolId: formData.get("patrolId") || null,
    healthNote: formData.get("healthNote"),
    dietaryRestrictions: formData.get("dietaryRestrictions"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
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

export async function approveUpdate(updateId: string) {
  const role = await getCurrentUserRole();
  if (role !== "admin" && role !== "LEADER") {
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

export async function rejectUpdate(updateId: string) {
  const role = await getCurrentUserRole();
  if (role !== "admin" && role !== "LEADER") {
    return { success: false, error: "Nemáte oprávnění zamítat změny." };
  }

  await prisma.pendingUpdate.delete({ where: { id: updateId } });
  revalidatePath("/members");
  return { success: true };
}

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
  const dietaryRestrictions = formData.get("dietaryRestrictions") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const postalCode = formData.get("postalCode") as string;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: `Uživatel s e-mailem ${email} už existuje! Zvolte prosím jiný.`,
    };
  }

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
      dietaryRestrictions: dietaryRestrictions || null,
      address: address || null,
      city: city || null,
      postalCode: postalCode || null,
      mustChangePassword: true,
    },
  });

  revalidatePath("/members");
  return { success: true };
}

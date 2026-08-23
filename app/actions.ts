"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";

const prisma = new PrismaClient();

const MANAGEMENT_ROLES = new Set(["admin", "user", "leader", "LEADER"]);

async function getCurrentUser() {
  const userId = (await cookies()).get("userId")?.value;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nepřihlášen");
  return user;
}

async function requireManagementRole() {
  const user = await requireAuthenticatedUser();
  if (!MANAGEMENT_ROLES.has(user.role)) throw new Error("Nemáte oprávnění");
  return user;
}

async function requireAdminRole() {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin") throw new Error("Nemáte oprávnění");
  return user;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// --- PŘIHLÁŠENÍ / ODHLÁŠENÍ ---

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== hashPassword(password)) {
    redirect("/login");
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (user.mustChangePassword) redirect("/change-password");
  redirect("/");
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  redirect("/login");
}

export async function forceChangePassword(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const newPassword = formData.get("newPassword") as string;
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword(newPassword), mustChangePassword: false },
  });
  redirect("/");
}

// --- VLASTNÍ PROFIL ---

export async function updateProfile(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const name = formData.get("name") as string;
  const newPassword = formData.get("newPassword") as string;

  const dataToUpdate: any = { name };
  if (newPassword && newPassword.length >= 4) {
    dataToUpdate.password = hashPassword(newPassword);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: dataToUpdate,
  });
  revalidatePath("/expedition");
  redirect("/expedition");
}

// --- SPRÁVA AKCÍ ---

export async function updateEvent(formData: FormData) {
  await requireManagementRole();
  const id = formData.get("id") as string;

  // Základní info
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;

  // Časový harmonogram
  const dateStr = formData.get("date") as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  const dateEndStr = formData.get("dateEnd") as string;
  const dateEnd = dateEndStr ? new Date(dateEndStr) : null;

  const meetingPoint = (formData.get("meetingPoint") as string) || null;
  const returnPoint = (formData.get("returnPoint") as string) || null;

  // Účast a termíny
  const targetPatrol = (formData.get("targetPatrol") as string) || "Všichni";

  const rsvpDeadlineStr = formData.get("rsvpDeadline") as string;
  const rsvpDeadline = rsvpDeadlineStr ? new Date(rsvpDeadlineStr) : null;

  const capacityStr = formData.get("capacity") as string;
  const capacity = capacityStr ? Number(capacityStr) : null;

  // Finance
  const priceChildren = Number(formData.get("priceChildren")) || 0;
  const priceOlder = Number(formData.get("priceOlder")) || 0;

  const paymentDeadlineStr = formData.get("paymentDeadline") as string;
  const paymentDeadline = paymentDeadlineStr
    ? new Date(paymentDeadlineStr)
    : null;

  const paymentMethod = (formData.get("paymentMethod") as string) || null;

  // Logistika a vybavení
  const equipment = (formData.get("equipment") as string) || null;
  const food = (formData.get("food") as string) || null;
  const accommodation = (formData.get("accommodation") as string) || null;

  // Kontakty
  const leaderInCharge = (formData.get("leaderInCharge") as string) || null;
  const leaderContact = (formData.get("leaderContact") as string) || null;

  await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      location,
      date,
      dateEnd,
      meetingPoint,
      returnPoint,
      targetPatrol,
      rsvpDeadline,
      capacity,
      priceChildren,
      priceOlder,
      paymentDeadline,
      paymentMethod,
      equipment,
      food,
      accommodation,
      leaderInCharge,
      leaderContact,
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function deleteEvent(formData: FormData) {
  await requireManagementRole();
  const id = formData.get("id") as string;
  await prisma.event.delete({ where: { id } });
  revalidatePath("/");
}

// --- SPRÁVA UŽIVATELŮ (ADMIN) ---

export async function createUser(formData: FormData) {
  await requireAdminRole();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const patrolId = formData.get("patrolId") as string;
  const password = formData.get("password") as string;

  await prisma.user.create({
    data: {
      name,
      email,
      role,
      patrolId: patrolId === "none" ? null : patrolId,
      password: hashPassword(password),
      mustChangePassword: true,
    },
  });
  revalidatePath("/admin");
}

export async function editUser(formData: FormData) {
  await requireAdminRole();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const patrolId = formData.get("patrolId") as string;

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role,
      patrolId: patrolId === "none" ? null : patrolId,
    },
  });
  revalidatePath("/admin");
}

export async function forcePasswordReset(id: string) {
  await requireAdminRole();
  await prisma.user.update({
    where: { id },
    data: { mustChangePassword: true },
  });
  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData) {
  await requireAdminRole();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin");
}

export async function saveAttendance(formData: FormData) {
  const user = await requireAuthenticatedUser();
  const eventId = formData.get("eventId") as string;
  const status = formData.get("status") as string;
  const note = (formData.get("note") as string) || "";

  if (!eventId || !status) {
    throw new Error("Chybí data pro uložení účasti.");
  }

  // Nejdřív se podíváme, jestli už se uživatel k této akci nevyjádřil dřív
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      eventId: eventId,
    },
  });

  if (existingAttendance) {
    // Pokud už existuje, jen ho updatneme (např. změnil názor nebo přidal poznámku)
    await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { status, note },
    });
  } else {
    // Pokud se vyjadřuje poprvé, vytvoříme nový záznam
    await prisma.attendance.create({
      data: {
        userId: user.id,
        eventId,
        status,
        note,
      },
    });
  }

  // Po uložení ihned obnovíme stránku, ať se změna projeví
  revalidatePath("/");
}

export async function markNotificationAsRead(id: string) {
  const user = await requireAuthenticatedUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });
  revalidatePath("/");
}

// --- NOVÝ CREATE EVENT (NOTIFIKACE PRO ÚPLNĚ VŠECHNY) ---
export async function createEvent(formData: FormData) {
  const user = await requireManagementRole();

  const title = formData.get("title") as string;

  const event = await prisma.event.create({
    data: {
      title,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      date: new Date(formData.get("date") as string),
      dateEnd: formData.get("dateEnd")
        ? new Date(formData.get("dateEnd") as string)
        : null,
      meetingPoint: (formData.get("meetingPoint") as string) || null,
      returnPoint: (formData.get("returnPoint") as string) || null,
      targetPatrol: formData.get("targetPatrol") as string,
      capacity: formData.get("capacity")
        ? parseInt(formData.get("capacity") as string)
        : null,
      accommodation: (formData.get("accommodation") as string) || null,
      food: (formData.get("food") as string) || null,
      equipment: (formData.get("equipment") as string) || null,
      priceChildren: parseInt(formData.get("priceChildren") as string) || 0,
      priceOlder: parseInt(formData.get("priceOlder") as string) || 0,
      paymentMethod: (formData.get("paymentMethod") as string) || null,
      paymentDeadline: formData.get("paymentDeadline")
        ? new Date(formData.get("paymentDeadline") as string)
        : null,
      rsvpDeadline: formData.get("rsvpDeadline")
        ? new Date(formData.get("rsvpDeadline") as string)
        : null,
      leaderInCharge: (formData.get("leaderInCharge") as string) || null,
      leaderContact: (formData.get("leaderContact") as string) || null,
      createdById: user.id,
    },
  });

  // TADY JE ZMĚNA: Pošleme notifikaci do zvonečku ÚPLNĚ VŠEM uživatelům
  const allUsers = await prisma.user.findMany();

  if (allUsers.length > 0) {
    await prisma.notification.createMany({
      data: allUsers.map((u) => ({
        userId: u.id,
        title: "🏕️ Nová výprava!",
        message: `Byla přidána akce: ${title}. Mrkněte a přihlaste se!`,
        link: "/expedition",
      })),
    });
  }

  revalidatePath("/");
  return { success: true };
}

// --- ŽÁDOSTI O ÚPRAVU ČLENA (S NOTIFIKACÍ ADMINŮM) ---
export async function createPendingMemberUpdate(formData: FormData) {
  const requester = await requireAuthenticatedUser();

  const targetUserId = formData.get("targetUserId") as string;
  const updateData = formData.get("data") as string;

  if (!targetUserId || (!MANAGEMENT_ROLES.has(requester.role) && targetUserId !== requester.id)) {
    throw new Error("Nemáte oprávnění");
  }

  // Vytvoří se žádost o úpravu (PendingUpdate)
  await prisma.pendingUpdate.create({
    data: {
      userId: targetUserId,
      requestedBy: requester.id,
      data: updateData,
    },
  });

  // TADY JE ZMĚNA: Zvoneček upozorní všechny adminy na novou žádost
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: "⚠️ Nová úprava člena",
        message: "Někdo navrhl úpravu údajů. Zkontroluj to v sekci Členové.",
        link: "/members",
      })),
    });
  }

  revalidatePath("/members");
  return { success: true };
}

// --- DOKUMENTY ---
export async function createDocument(formData: FormData) {
  await requireManagementRole();
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const category = formData.get("category") as string;
  const type = formData.get("type") as string;

  if (!name || !url || !category) return;

  await prisma.document.create({
    data: { name, url, category, type: type || "pdf" },
  });

  // Zde bys případně mohl zavolat revalidatePath('/documents')
}

export async function deleteDocument(id: string) {
  await requireManagementRole();
  await prisma.document.delete({ where: { id } });
}

// --- DRUŽINY (Úprava časů schůzek) ---
export async function updatePatrolInfo(formData: FormData) {
  await requireManagementRole();
  const id = formData.get("id") as string;
  const schedule = formData.get("schedule") as string;
  const location = formData.get("location") as string;

  if (!id) return;

  await prisma.patrol.update({
    where: { id },
    data: { schedule, location },
  });
}

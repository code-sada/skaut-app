"use server";

import { revalidatePath } from "next/cache";
import { prisma, MANAGEMENT_ROLES, getSessionUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Nepřihlášen");
  return user;
}

async function requireManagementRole() {
  const user = await requireUser();
  if (!MANAGEMENT_ROLES.has(user.role)) throw new Error("Nemáte oprávnění");
  return user;
}

// 1. Vygenerování pravidelných schůzek (s vynecháním prázdnin a ochranou proti DoS)
export async function generateMeetings(formData: FormData) {
  await requireManagementRole();
  const title = ((formData.get("title") as string) || "").trim().slice(0, 200);
  const patrolId = ((formData.get("patrolId") as string) || "").trim();
  const startDateStr = ((formData.get("startDate") as string) || "").trim();
  const endDateStr = ((formData.get("endDate") as string) || "").trim();
  const startTime = ((formData.get("startTime") as string) || "16:00").trim();
  const endTime = ((formData.get("endTime") as string) || "18:00").trim();
  const excludeDatesStr = (formData.get("excludeDates") as string) || "";

  if (!title || !patrolId || !startDateStr || !endDateStr) {
    throw new Error("Vyplňte prosím všechna povinná pole.");
  }

  const excludeDates = excludeDatesStr
    .split(",")
    .map((d) => d.trim().replace(/\s/g, ""))
    .filter(Boolean);

  const currentDate = new Date(`${startDateStr}T${startTime}:00`);
  const endDate = new Date(`${endDateStr}T23:59:59`);

  if (
    isNaN(currentDate.getTime()) ||
    isNaN(endDate.getTime()) ||
    currentDate > endDate
  ) {
    throw new Error("Neplatné rozmezí datumů.");
  }

  const newMeetings = [];
  const MAX_MEETINGS = 100;

  while (currentDate <= endDate && newMeetings.length < MAX_MEETINGS) {
    const formattedDate = currentDate
      .toLocaleDateString("cs-CZ")
      .replace(/\s/g, "");

    if (!excludeDates.includes(formattedDate)) {
      newMeetings.push({
        title,
        patrolId,
        date: new Date(currentDate),
        endTime,
        location: "Klubovna",
      });
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }

  if (newMeetings.length > 0) {
    await prisma.meeting.createMany({ data: newMeetings });
  }
  revalidatePath("/meetings");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function deleteMeeting(formData: FormData) {
  await requireManagementRole();
  const id = ((formData.get("id") as string) || "").trim();
  if (!id) return;

  await prisma.meeting.delete({ where: { id } });
  revalidatePath("/meetings");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function updateMeeting(formData: FormData) {
  await requireManagementRole();
  const id = ((formData.get("id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim().slice(0, 200);
  const patrolId = ((formData.get("patrolId") as string) || "").trim();
  const dateStr = ((formData.get("date") as string) || "").trim();
  const endTime = ((formData.get("endTime") as string) || "").trim();
  const location =
    ((formData.get("location") as string) || "").trim().slice(0, 200) ||
    "Klubovna";
  const comment =
    ((formData.get("comment") as string) || "").trim().slice(0, 2000) || null;

  if (!id || !title || !patrolId) return;

  const parsedDate = dateStr ? new Date(dateStr) : new Date();

  await prisma.meeting.update({
    where: { id },
    data: {
      title,
      patrolId,
      date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      endTime,
      location,
      comment,
    },
  });

  revalidatePath("/meetings");
  revalidatePath("/calendar");
  revalidatePath("/");
}

// 2. Uložení docházky
export async function saveMeetingAttendance(formData: FormData) {
  const user = await requireUser();
  const meetingId = ((formData.get("meetingId") as string) || "").trim();
  const status = ((formData.get("status") as string) || "").trim();
  const note = ((formData.get("note") as string) || "").trim().slice(0, 1000);

  if (!meetingId || !status) {
    throw new Error("Vyberte prosím svou účast.");
  }

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) throw new Error("Schůzka nenalezena");
  if (!MANAGEMENT_ROLES.has(user.role) && meeting.patrolId !== user.patrolId) {
    throw new Error("Nemáte oprávnění");
  }

  const existing = await prisma.meetingAttendance.findFirst({
    where: { userId: user.id, meetingId },
  });

  if (existing) {
    await prisma.meetingAttendance.update({
      where: { id: existing.id },
      data: { status, note },
    });
  } else {
    await prisma.meetingAttendance.create({
      data: { userId: user.id, meetingId, status, note },
    });
  }
  revalidatePath("/meetings");
  revalidatePath("/attendance");
}

// 3. Odeslání zprávy do chatu (s Rate Limitingem)
export async function sendMeetingMessage(formData: FormData) {
  const user = await requireUser();
  const meetingId = ((formData.get("meetingId") as string) || "").trim();
  const text = ((formData.get("text") as string) || "").trim().slice(0, 1000);

  if (!text) return;

  const rate = checkRateLimit(`chat:${user.id}`, 20, 60 * 1000);
  if (!rate.allowed) {
    throw new Error("Odesíláte zprávy příliš rychle. Zkuste to za chvíli.");
  }

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) throw new Error("Schůzka nenalezena");
  if (!MANAGEMENT_ROLES.has(user.role) && meeting.patrolId !== user.patrolId) {
    throw new Error("Nemáte oprávnění");
  }

  await prisma.meetingMessage.create({
    data: { text, userId: user.id, meetingId },
  });
  revalidatePath("/meetings");
}

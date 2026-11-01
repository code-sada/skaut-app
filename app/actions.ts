"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  prisma,
  MANAGEMENT_ROLES,
  hashPassword,
  setSessionCookies,
  clearSessionCookies,
  getSessionUser,
  sanitizeUrl,
} from "@/lib/auth";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";

export type SearchResultGroup = {
  category: string;
  items: {
    id: string;
    title: string;
    subtitle?: string;
    href: string;
    type: "user" | "event" | "meeting" | "document";
  }[];
};

const ALLOWED_ROLES = new Set([
  "child",
  "parent",
  "user",
  "leader",
  "LEADER",
  "admin",
  "MEMBER",
  "member",
]);

const ALLOWED_ATTENDANCE_STATUSES = new Set([
  "GOING",
  "NOT_GOING",
  "ANO",
  "NE",
  "PENDING",
]);

async function requireAuthenticatedUser(includePatrol = false) {
  const user = await getSessionUser(includePatrol);
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

function removeDiacritics(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseSafeDate(value: string | null | undefined): Date | null {
  if (!value || !value.trim()) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// --- GLOBÁLNÍ VYHLEDÁVÁNÍ (S ROW-LEVEL SECURITY) ---
export async function globalSearch(
  query: string,
): Promise<SearchResultGroup[]> {
  const cleanQuery = removeDiacritics((query || "").trim().slice(0, 100));

  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
  }

  const currentUser = await getSessionUser(true);
  if (!currentUser) {
    return [];
  }

  const userRole = currentUser.role || "MEMBER";
  const isManagement = MANAGEMENT_ROLES.has(userRole);
  const userPatrolName = (currentUser as any).patrol?.name;

  const results: SearchResultGroup[] = [];

  if (isManagement) {
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, role: true, email: true },
    });

    const matchedUsers = allUsers
      .filter(
        (u) =>
          removeDiacritics(u.name).includes(cleanQuery) ||
          removeDiacritics(u.email).includes(cleanQuery),
      )
      .slice(0, 4);

    if (matchedUsers.length > 0) {
      results.push({
        category: "Členové a uživatelé",
        items: matchedUsers.map((u) => ({
          id: u.id,
          title: u.name,
          subtitle: `Role: ${u.role}`,
          href: `/members`,
          type: "user",
        })),
      });
    }
  }

  // Row-level security pro výpravy
  const eventWhere: any = {};
  if (!isManagement) {
    eventWhere.OR = userPatrolName
      ? [
          { targetPatrol: "" },
          { targetPatrol: "Všichni" },
          { targetPatrol: userPatrolName },
        ]
      : [{ targetPatrol: "" }, { targetPatrol: "Všichni" }];
  }

  const allEvents = await prisma.event.findMany({
    where: eventWhere,
    select: {
      id: true,
      title: true,
      location: true,
      date: true,
      description: true,
    },
  });

  const matchedEvents = allEvents
    .filter(
      (e) =>
        removeDiacritics(e.title).includes(cleanQuery) ||
        removeDiacritics(e.location).includes(cleanQuery) ||
        removeDiacritics(e.description).includes(cleanQuery),
    )
    .slice(0, 4);

  if (matchedEvents.length > 0) {
    results.push({
      category: "Akce a výpravy",
      items: matchedEvents.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: `${new Date(e.date).toLocaleDateString("cs-CZ")} • ${e.location || "Neznámé místo"}`,
        href: `/expedition`,
        type: "event",
      })),
    });
  }

  // Row-level security pro schůzky
  const meetingWhere: any = isManagement
    ? {}
    : { patrolId: currentUser.patrolId || "none" };

  const allMeetings = await prisma.meeting.findMany({
    where: meetingWhere,
    select: {
      id: true,
      title: true,
      location: true,
      date: true,
      comment: true,
    },
  });

  const matchedMeetings = allMeetings
    .filter(
      (m) =>
        removeDiacritics(m.title).includes(cleanQuery) ||
        removeDiacritics(m.location).includes(cleanQuery) ||
        removeDiacritics(m.comment).includes(cleanQuery),
    )
    .slice(0, 4);

  if (matchedMeetings.length > 0) {
    results.push({
      category: "Schůzky",
      items: matchedMeetings.map((m) => ({
        id: m.id,
        title: m.title,
        subtitle: `${new Date(m.date).toLocaleDateString("cs-CZ")} • ${m.location || "Klubovna"}`,
        href: `/meetings`,
        type: "meeting",
      })),
    });
  }

  // Row-level security pro dokumenty
  const documentWhere: any = isManagement
    ? {}
    : { NOT: { category: "Pro vedoucí" } };

  const allDocuments = await prisma.document.findMany({
    where: documentWhere,
    select: { id: true, name: true, category: true, url: true },
  });

  const matchedDocuments = allDocuments
    .filter((d) => removeDiacritics(d.name).includes(cleanQuery))
    .slice(0, 4);

  if (matchedDocuments.length > 0) {
    results.push({
      category: "Dokumenty",
      items: matchedDocuments.map((d) => ({
        id: d.id,
        title: d.name,
        subtitle: `Kategorie: ${d.category}`,
        href: sanitizeUrl(d.url) || `/documents`,
        type: "document",
      })),
    });
  }

  return results;
}

// --- PŘIHLÁŠENÍ / ODHLÁŠENÍ ---
export async function loginUser(
  prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const loginIdentifier = ((formData.get("email") as string) || "")
    .trim()
    .slice(0, 150);
  const password = (formData.get("password") as string) || "";

  if (!loginIdentifier || !password) {
    return { error: "Vyplňte prosím e-mail (nebo jméno) i heslo." };
  }

  const rateKey = `login_fail:${loginIdentifier.toLowerCase()}`;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: loginIdentifier }, { name: loginIdentifier }],
    },
  });

  if (!user || !user.password || user.password !== hashPassword(password)) {
    const rateCheck = checkRateLimit(rateKey, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return {
        error: `Příliš mnoho neúspěšných pokusů. Zkuste to prosím znovu za ${rateCheck.retryAfterSeconds} s.`,
      };
    }
    if (user && !user.password) {
      return {
        error:
          "Tento člen zatím nemá založený přihlašovací účet. Požádejte vedoucího nebo administrátora.",
      };
    }
    return { error: "Nesprávný e-mail, jméno nebo heslo." };
  }

  clearRateLimit(rateKey);
  await setSessionCookies(user);

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  redirect("/");
}

export async function logoutUser() {
  await clearSessionCookies();
  redirect("/login");
}

export async function forceChangePassword(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const newPassword = ((formData.get("newPassword") as string) || "").trim();
  if (newPassword.length < 4) {
    throw new Error("Heslo musí mít alespoň 4 znaky.");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword(newPassword), mustChangePassword: false },
  });

  await setSessionCookies(updated);
  redirect("/");
}

// --- VLASTNÍ PROFIL + GDPR PRÁVA ---
export async function updateProfile(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const name = ((formData.get("name") as string) || "").trim().slice(0, 120);
  const newPassword = (formData.get("newPassword") as string) || "";

  if (!name) {
    throw new Error("Jméno nesmí být prázdné.");
  }

  const dataToUpdate: any = { name };
  if (newPassword && newPassword.length >= 4) {
    dataToUpdate.password = hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: dataToUpdate,
  });

  await setSessionCookies(updated);
  revalidatePath("/profile");
  revalidatePath("/expedition");
  redirect("/expedition");
}

export async function exportOwnData() {
  const user = await requireAuthenticatedUser(true);
  const [attendance, meetingAttendance, notifications] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId: user.id },
      include: { event: { select: { title: true, date: true } } },
    }),
    prisma.meetingAttendance.findMany({
      where: { userId: user.id },
      include: { meeting: { select: { title: true, date: true } } },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      patrol: (user as any).patrol?.name || null,
      birthDate: user.birthDate,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      healthNote: user.healthNote,
      dietaryRestrictions: user.dietaryRestrictions,
      parentPhone: user.parentPhone,
      motherName: user.motherName,
      motherPhone: user.motherPhone,
      fatherName: user.fatherName,
      fatherPhone: user.fatherPhone,
      otherGuardianName: user.otherGuardianName,
      otherGuardianPhone: user.otherGuardianPhone,
    },
    eventAttendance: attendance.map((a) => ({
      event: a.event.title,
      date: a.event.date,
      status: a.status,
      note: a.note,
    })),
    meetingAttendance: meetingAttendance.map((m) => ({
      meeting: m.meeting.title,
      date: m.meeting.date,
      status: m.status,
      note: m.note,
    })),
    notificationsCount: notifications.length,
  };
}

export async function deleteOwnAccount() {
  const user = await requireAuthenticatedUser();
  if (user.role === "admin") {
    return {
      success: false,
      error:
        "Hlavní administrátorský účet nelze smazat tímto tlačítkem z bezpečnostních důvodů.",
    };
  }

  await prisma.$transaction([
    prisma.attendance.deleteMany({ where: { userId: user.id } }),
    prisma.meetingAttendance.deleteMany({ where: { userId: user.id } }),
    prisma.meetingMessage.deleteMany({ where: { userId: user.id } }),
    prisma.pendingUpdate.deleteMany({ where: { userId: user.id } }),
    prisma.notification.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  await clearSessionCookies();
  redirect("/login");
}

// --- SPRÁVA AKCÍ ---
export async function updateEvent(formData: FormData) {
  await requireManagementRole();
  const id = (formData.get("id") as string)?.trim();
  if (!id) throw new Error("Chybí ID akce.");

  const title = ((formData.get("title") as string) || "").trim().slice(0, 200);
  const description = ((formData.get("description") as string) || "")
    .trim()
    .slice(0, 5000);
  const location = ((formData.get("location") as string) || "")
    .trim()
    .slice(0, 200);

  if (!title || !location) {
    throw new Error("Název a místo akce jsou povinné.");
  }

  const date = parseSafeDate(formData.get("date") as string) || new Date();
  const dateEnd = parseSafeDate(formData.get("dateEnd") as string);

  const meetingPoint =
    ((formData.get("meetingPoint") as string) || "").trim().slice(0, 300) ||
    null;
  const returnPoint =
    ((formData.get("returnPoint") as string) || "").trim().slice(0, 300) ||
    null;

  const targetPatrol =
    ((formData.get("targetPatrol") as string) || "").trim().slice(0, 100) ||
    "Všichni";

  const rsvpDeadline = parseSafeDate(formData.get("rsvpDeadline") as string);

  const capacityRaw = Number(formData.get("capacity"));
  const capacity =
    !isNaN(capacityRaw) && capacityRaw > 0 ? Math.floor(capacityRaw) : null;

  const priceChildren = Math.max(0, Number(formData.get("priceChildren")) || 0);
  const priceOlder = Math.max(0, Number(formData.get("priceOlder")) || 0);

  const paymentDeadline = parseSafeDate(
    formData.get("paymentDeadline") as string,
  );

  const paymentMethod =
    ((formData.get("paymentMethod") as string) || "").trim().slice(0, 200) ||
    null;

  const equipment =
    ((formData.get("equipment") as string) || "").trim().slice(0, 2000) || null;
  const food =
    ((formData.get("food") as string) || "").trim().slice(0, 500) || null;
  const accommodation =
    ((formData.get("accommodation") as string) || "").trim().slice(0, 500) ||
    null;

  const leaderInCharge =
    ((formData.get("leaderInCharge") as string) || "").trim().slice(0, 150) ||
    null;
  const leaderContact =
    ((formData.get("leaderContact") as string) || "").trim().slice(0, 150) ||
    null;

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

  revalidatePath("/expedition");
  revalidatePath("/");
  redirect("/");
}

export async function deleteEvent(formData: FormData) {
  await requireManagementRole();
  const id = (formData.get("id") as string)?.trim();
  if (!id) return;
  await prisma.event.delete({ where: { id } });
  revalidatePath("/expedition");
  revalidatePath("/");
}

// --- SPRÁVA UŽIVATELŮ (ADMIN) ---
export async function createUser(formData: FormData) {
  await requireAdminRole();
  const existingMemberId = (
    (formData.get("existingMemberId") as string) || ""
  ).trim();
  const name = ((formData.get("name") as string) || "").trim().slice(0, 120);
  const email = ((formData.get("email") as string) || "").trim().slice(0, 150);
  const rawRole = ((formData.get("role") as string) || "child").trim();
  const role = ALLOWED_ROLES.has(rawRole) ? rawRole : "child";
  const patrolId = ((formData.get("patrolId") as string) || "").trim();
  const password = (formData.get("password") as string) || "";

  if (!name || !email || !password) {
    throw new Error("Jméno, e-mail a heslo jsou povinné.");
  }

  if (existingMemberId && existingMemberId !== "new") {
    await prisma.user.update({
      where: { id: existingMemberId },
      data: {
        name,
        email,
        role,
        patrolId: !patrolId || patrolId === "none" ? null : patrolId,
        password: hashPassword(password),
        mustChangePassword: true,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        role,
        patrolId: !patrolId || patrolId === "none" ? null : patrolId,
        password: hashPassword(password),
        mustChangePassword: true,
      },
    });
  }
  revalidatePath("/admin");
  revalidatePath("/members");
}

export async function editUser(formData: FormData) {
  const admin = await requireAdminRole();
  const id = ((formData.get("id") as string) || "").trim();
  const name = ((formData.get("name") as string) || "").trim().slice(0, 120);
  const email = ((formData.get("email") as string) || "").trim().slice(0, 150);
  const rawRole = ((formData.get("role") as string) || "child").trim();
  const role = ALLOWED_ROLES.has(rawRole) ? rawRole : "child";
  const patrolId = ((formData.get("patrolId") as string) || "").trim();

  if (!id || !name || !email) {
    throw new Error("Chybí povinné údaje.");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role,
      patrolId: !patrolId || patrolId === "none" ? null : patrolId,
    },
  });

  if (updated.id === admin.id) {
    await setSessionCookies(updated);
  }

  revalidatePath("/admin");
}

export async function forcePasswordReset(id: string) {
  await requireAdminRole();
  if (!id) return;
  await prisma.user.update({
    where: { id },
    data: { mustChangePassword: true },
  });
  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdminRole();
  const id = ((formData.get("id") as string) || "").trim();
  if (!id || id === admin.id) return;

  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin");
}

export async function saveAttendance(formData: FormData) {
  const user = await requireAuthenticatedUser(true);
  const eventId = ((formData.get("eventId") as string) || "").trim();
  const status = ((formData.get("status") as string) || "").trim();
  const note = ((formData.get("note") as string) || "").trim().slice(0, 1000);

  if (!eventId || !status || !ALLOWED_ATTENDANCE_STATUSES.has(status)) {
    throw new Error("Chybí nebo jsou neplatná data pro uložení účasti.");
  }

  // Row-Level Security: ověření, že akce existuje a uživatel k ní má přístup
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new Error("Akce nebyla nalezena.");
  }

  const isManagement = MANAGEMENT_ROLES.has(user.role);
  const userPatrolName = (user as any).patrol?.name;
  if (
    !isManagement &&
    event.targetPatrol &&
    event.targetPatrol !== "Všichni" &&
    event.targetPatrol !== userPatrolName
  ) {
    throw new Error("Nemáte oprávnění k této akci.");
  }

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      eventId: eventId,
    },
  });

  if (existingAttendance) {
    await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { status, note },
    });
  } else {
    await prisma.attendance.create({
      data: {
        userId: user.id,
        eventId,
        status,
        note,
      },
    });
  }

  revalidatePath("/expedition");
  revalidatePath("/attendance");
  revalidatePath("/");
}

export async function adminSaveAttendance(formData: FormData) {
  await requireManagementRole();
  const userId = ((formData.get("userId") as string) || "").trim();
  const activityId = ((formData.get("activityId") as string) || "").trim();
  const activityType = ((formData.get("activityType") as string) || "").trim();
  const status = ((formData.get("status") as string) || "").trim();
  const note = ((formData.get("note") as string) || "").trim().slice(0, 1000);

  if (!userId || !activityId || !["EVENT", "MEETING"].includes(activityType)) {
    throw new Error("Neplatné údaje pro uložení docházky.");
  }

  if (status === "CLEAR") {
    if (activityType === "EVENT") {
      await prisma.attendance.deleteMany({
        where: { userId, eventId: activityId },
      });
    } else {
      await prisma.meetingAttendance.deleteMany({
        where: { userId, meetingId: activityId },
      });
    }
  } else {
    if (!ALLOWED_ATTENDANCE_STATUSES.has(status)) {
      throw new Error("Neplatný stav účasti.");
    }
    if (activityType === "EVENT") {
      const existing = await prisma.attendance.findFirst({
        where: { userId, eventId: activityId },
      });
      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status, note },
        });
      } else {
        await prisma.attendance.create({
          data: { userId, eventId: activityId, status, note },
        });
      }
    } else {
      const existing = await prisma.meetingAttendance.findFirst({
        where: { userId, meetingId: activityId },
      });
      if (existing) {
        await prisma.meetingAttendance.update({
          where: { id: existing.id },
          data: { status, note },
        });
      } else {
        await prisma.meetingAttendance.create({
          data: { userId, meetingId: activityId, status, note },
        });
      }
    }
  }

  revalidatePath("/attendance");
  revalidatePath("/expedition");
  revalidatePath("/meetings");
  revalidatePath("/");
}

export async function markNotificationAsRead(id: string) {
  const user = await requireAuthenticatedUser();
  if (!id) return;
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });
  revalidatePath("/");
}

export async function createEvent(formData: FormData) {
  const user = await requireManagementRole();

  const title = ((formData.get("title") as string) || "").trim().slice(0, 200);
  const description = ((formData.get("description") as string) || "")
    .trim()
    .slice(0, 5000);
  const location = ((formData.get("location") as string) || "")
    .trim()
    .slice(0, 200);
  const date = parseSafeDate(formData.get("date") as string) || new Date();

  if (!title || !location) {
    throw new Error("Název a místo akce jsou povinné.");
  }

  const targetPatrol =
    ((formData.get("targetPatrol") as string) || "").trim().slice(0, 100) ||
    "Všichni";

  await prisma.event.create({
    data: {
      title,
      description,
      location,
      date,
      dateEnd: parseSafeDate(formData.get("dateEnd") as string),
      meetingPoint:
        ((formData.get("meetingPoint") as string) || "").trim().slice(0, 300) ||
        null,
      returnPoint:
        ((formData.get("returnPoint") as string) || "").trim().slice(0, 300) ||
        null,
      targetPatrol,
      capacity: formData.get("capacity")
        ? Math.max(1, parseInt(formData.get("capacity") as string) || 0) || null
        : null,
      accommodation:
        ((formData.get("accommodation") as string) || "")
          .trim()
          .slice(0, 500) || null,
      food:
        ((formData.get("food") as string) || "").trim().slice(0, 500) || null,
      equipment:
        ((formData.get("equipment") as string) || "").trim().slice(0, 2000) ||
        null,
      priceChildren: Math.max(
        0,
        parseInt(formData.get("priceChildren") as string) || 0,
      ),
      priceOlder: Math.max(
        0,
        parseInt(formData.get("priceOlder") as string) || 0,
      ),
      paymentMethod:
        ((formData.get("paymentMethod") as string) || "")
          .trim()
          .slice(0, 200) || null,
      paymentDeadline: parseSafeDate(formData.get("paymentDeadline") as string),
      rsvpDeadline: parseSafeDate(formData.get("rsvpDeadline") as string),
      leaderInCharge:
        ((formData.get("leaderInCharge") as string) || "")
          .trim()
          .slice(0, 150) || null,
      leaderContact:
        ((formData.get("leaderContact") as string) || "")
          .trim()
          .slice(0, 150) || null,
      createdById: user.id,
    },
  });

  const allUsers = await prisma.user.findMany({ select: { id: true } });

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

  revalidatePath("/expedition");
  revalidatePath("/");
  return { success: true };
}

export async function createPendingMemberUpdate(formData: FormData) {
  const requester = await requireAuthenticatedUser();

  const targetUserId = ((formData.get("targetUserId") as string) || "").trim();
  const updateData = ((formData.get("data") as string) || "").trim();

  if (
    !targetUserId ||
    (!MANAGEMENT_ROLES.has(requester.role) && targetUserId !== requester.id)
  ) {
    throw new Error("Nemáte oprávnění");
  }

  await prisma.pendingUpdate.create({
    data: {
      userId: targetUserId,
      requestedBy: requester.id,
      data: updateData,
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true },
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
  const name = ((formData.get("name") as string) || "").trim().slice(0, 200);
  const rawUrl = ((formData.get("url") as string) || "").trim();
  const category = ((formData.get("category") as string) || "")
    .trim()
    .slice(0, 100);
  const type = ((formData.get("type") as string) || "").trim();

  const safeUrl = sanitizeUrl(rawUrl);
  if (!name || !safeUrl || !category) {
    throw new Error(
      "Zadejte platný název, kategorii a bezpečnou URL adresu (https://...).",
    );
  }

  await prisma.document.create({
    data: {
      name,
      url: safeUrl,
      category,
      type: type === "link" ? "link" : "pdf",
    },
  });
  revalidatePath("/documents");
}

export async function deleteDocument(id: string) {
  await requireManagementRole();
  if (!id) return;
  await prisma.document.delete({ where: { id } });
  revalidatePath("/documents");
}

// --- DRUŽINY ---
export async function updatePatrolInfo(formData: FormData) {
  await requireManagementRole();
  const id = ((formData.get("id") as string) || "").trim();
  const schedule = ((formData.get("schedule") as string) || "")
    .trim()
    .slice(0, 200);
  const location = ((formData.get("location") as string) || "")
    .trim()
    .slice(0, 200);

  if (!id) return;

  await prisma.patrol.update({
    where: { id },
    data: { schedule, location },
  });
  revalidatePath("/patrols");
}

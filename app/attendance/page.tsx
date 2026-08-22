import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

const prisma = new PrismaClient();

export default async function AttendancePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  // Ochrana - pustíme sem jen adminy a vedoucí
  if (
    currentUser?.role !== "admin" &&
    currentUser?.role !== "user" &&
    currentUser?.role !== "leader"
  ) {
    redirect("/");
  }

  // 1. Stáhneme všechny děti (členy s družinou nebo rolí child/MEMBER)
  const children = await prisma.user.findMany({
    where: {
      OR: [{ role: "MEMBER" }, { role: "child" }, { patrolId: { not: null } }],
      // Vyřadíme vedoucí
      NOT: {
        role: "admin",
      },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, patrol: { select: { name: true } } },
  });

  // 2. Stáhneme výpravy s docházkou
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      attendance: true,
    },
  });

  // 3. Stáhneme schůzky s docházkou
  const meetings = await prisma.meeting.findMany({
    orderBy: { date: "desc" },
    include: {
      attendance: true,
    },
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
      <AttendanceClient
        childrenData={children}
        eventsData={events}
        meetingsData={meetings}
      />
    </div>
  );
}

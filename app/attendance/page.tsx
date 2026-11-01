import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";
import { prisma, getSessionUser, MANAGEMENT_ROLES } from "@/lib/auth";

export default async function AttendancePage() {
  const currentUser = await getSessionUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!MANAGEMENT_ROLES.has(currentUser.role)) {
    redirect("/");
  }

  const children = await prisma.user.findMany({
    where: {
      OR: [{ role: "MEMBER" }, { role: "child" }, { patrolId: { not: null } }],
      NOT: {
        role: "admin",
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      patrolId: true,
      patrol: { select: { id: true, name: true } },
    },
  });

  const patrols = await prisma.patrol.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      attendance: true,
    },
  });

  const meetings = await prisma.meeting.findMany({
    orderBy: { date: "desc" },
    include: {
      attendance: true,
      patrol: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
      <AttendanceClient
        childrenData={children}
        patrolsData={patrols}
        eventsData={events}
        meetingsData={meetings}
      />
    </div>
  );
}

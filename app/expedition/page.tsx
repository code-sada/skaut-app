import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { deleteEvent, saveAttendance } from "@/app/actions";
import EventsClient from "./EventsClient";

const prisma = new PrismaClient();

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  let currentUser = null;
  if (userId) {
    currentUser = await prisma.user.findUnique({ where: { id: userId } });
  }

  const role = currentUser?.role;
  // Změněno na malé admin
  const canManage = role === "admin" || role === "user" || role === "leader";

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      attendance: {
        include: {
          user: true,
        },
      },
    },
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <EventsClient
        events={events}
        canManage={canManage}
        currentUser={currentUser}
        deleteEventAction={deleteEvent}
        saveAttendanceAction={saveAttendance}
      />
    </div>
  );
}

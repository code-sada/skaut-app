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
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { patrol: true }, // Přidáno načtení družiny pro filtraci!
    });
  }

  const role = currentUser?.role;
  const canManage = role === "admin" || role === "user" || role === "leader";
  const userPatrolName = currentUser?.patrol?.name;

  // FILTROVACÍ LOGIKA:
  const eventWhereClause: any = {};

  // Pokud uživatel NENÍ vedoucí ani admin, aplikujeme filtr
  if (!canManage) {
    if (userPatrolName) {
      // Uživatel má družinu: ukážeme celooddílové akce + akce jeho družiny
      eventWhereClause.OR = [
        { targetPatrol: "" },
        { targetPatrol: "Všichni" },
        { targetPatrol: userPatrolName },
      ];
    } else {
      // Uživatel nemá družinu (např. nepřiřazené dítě): ukážeme jen celooddílové
      eventWhereClause.OR = [{ targetPatrol: "" }, { targetPatrol: "Všichni" }];
    }
  }
  // (Pokud je canManage true, eventWhereClause zůstane prázdný a načtou se všechny akce)

  const events = await prisma.event.findMany({
    where: eventWhereClause,
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

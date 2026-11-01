import { deleteEvent, saveAttendance } from "@/app/actions";
import EventsClient from "./EventsClient";
import {
  prisma,
  getSessionUser,
  MANAGEMENT_ROLES,
  PUBLIC_USER_SELECT,
} from "@/lib/auth";

export default async function HomePage() {
  const currentUser = await getSessionUser(true);

  const role = currentUser?.role;
  const canManage = MANAGEMENT_ROLES.has(role || "");
  const userPatrolName = (currentUser as any)?.patrol?.name;

  const eventWhereClause: any = {};

  if (!canManage) {
    if (userPatrolName) {
      eventWhereClause.OR = [
        { targetPatrol: "" },
        { targetPatrol: "Všichni" },
        { targetPatrol: userPatrolName },
      ];
    } else {
      eventWhereClause.OR = [{ targetPatrol: "" }, { targetPatrol: "Všichni" }];
    }
  }

  const events = await prisma.event.findMany({
    where: eventWhereClause,
    orderBy: { date: "asc" },
    include: {
      attendance: {
        include: {
          user: {
            select: PUBLIC_USER_SELECT,
          },
        },
      },
    },
  });

  const safeCurrentUser = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        patrolId: currentUser.patrolId,
        patrol: (currentUser as any).patrol || null,
      }
    : null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <EventsClient
        events={events}
        canManage={canManage}
        currentUser={safeCurrentUser}
        deleteEventAction={deleteEvent}
        saveAttendanceAction={saveAttendance}
      />
    </div>
  );
}

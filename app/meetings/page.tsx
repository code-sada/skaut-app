import MeetingsClient from "./MeetingsClient";
import {
  deleteMeeting,
  generateMeetings,
  saveMeetingAttendance,
  sendMeetingMessage,
  updateMeeting,
} from "./actions";
import {
  prisma,
  getSessionUser,
  MANAGEMENT_ROLES,
  PUBLIC_USER_SELECT,
} from "@/lib/auth";

export default async function SchuzkyPage() {
  const currentUser = await getSessionUser(true);

  const role = currentUser?.role;
  const canManage = MANAGEMENT_ROLES.has(role || "");

  // Row-Level Security: Pokud nejsi vedoucí/admin, vidíš jen schůzky své družiny
  const whereClause = canManage
    ? {}
    : { patrolId: currentUser?.patrolId || "none" };

  const meetings = await prisma.meeting.findMany({
    where: {
      ...whereClause,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    include: {
      patrol: true,
      attendance: { include: { user: { select: PUBLIC_USER_SELECT } } },
      messages: {
        include: { user: { select: PUBLIC_USER_SELECT } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const patrols = await prisma.patrol.findMany();

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
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-20">
      <MeetingsClient
        meetings={meetings}
        currentUser={safeCurrentUser}
        canManage={canManage}
        patrols={patrols}
        saveMeetingAttendance={saveMeetingAttendance}
        sendMeetingMessage={sendMeetingMessage}
        deleteMeetingAction={deleteMeeting}
        updateMeetingAction={updateMeeting}
        generateMeetingsAction={generateMeetings}
      />
    </div>
  );
}

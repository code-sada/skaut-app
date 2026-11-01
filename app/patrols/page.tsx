import PatrolsClient from "./PatrolsClient";
import { updatePatrolInfo } from "@/app/actions";
import { prisma, getSessionUser, MANAGEMENT_ROLES } from "@/lib/auth";

export default async function PatrolsPage() {
  const currentUser = await getSessionUser();
  const role = currentUser?.role;
  const canManage = MANAGEMENT_ROLES.has(role || "");

  const patrols = await prisma.patrol.findMany({
    include: {
      users: { select: { id: true, name: true, role: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <PatrolsClient
        patrols={patrols}
        canManage={canManage}
        updatePatrolInfo={updatePatrolInfo}
      />
    </div>
  );
}

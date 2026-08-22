import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import PatrolsClient from "./PatrolsClient";
import { updatePatrolInfo } from "@/app/actions";

const prisma = new PrismaClient();

export default async function PatrolsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  let currentUser = null;
  if (userId) {
    currentUser = await prisma.user.findUnique({ where: { id: userId } });
  }

  const role = currentUser?.role;
  const canManage = role === "admin" || role === "user" || role === "leader";

  // Stáhneme družiny včetně jejich členů a nových polí pro schůzky
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

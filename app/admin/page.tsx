import { redirect } from "next/navigation";
import AdminContent from "./AdminContent";
import {
  createUser,
  editUser,
  forcePasswordReset,
  deleteUser,
} from "@/app/actions";
import { prisma, getSessionUser, SAFE_USER_SELECT } from "@/lib/auth";

export default async function AdminPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "admin") redirect("/");

  const rawUsers = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      ...SAFE_USER_SELECT,
      password: true,
      patrol: true,
    },
  });

  const users = rawUsers.map(({ password, ...u }) => ({
    ...u,
    hasAccount: Boolean(password && password.length > 0),
    email: u.email.endsWith("@evidence.skautapp.local") ? "" : u.email,
  }));

  const patrols = await prisma.patrol.findMany({
    orderBy: { name: "asc" },
  });

  const safeCurrentUser = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  };

  return (
    <AdminContent
      users={users}
      patrols={patrols}
      currentUser={safeCurrentUser}
      createUser={createUser}
      editUser={editUser}
      forcePasswordReset={forcePasswordReset}
      deleteUser={deleteUser}
    />
  );
}

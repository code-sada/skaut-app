import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { logoutUser } from "./actions";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
// Importujeme náš nový interaktivní obal
import ClientAppShell from "@/components/ClientAppShell";

const inter = Inter({ subsets: ["latin"] });
const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "SKAUTAPP",
  description: "Informační systém oddílu",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  let currentUser = null;
  let notifications: any[] = [];

  if (userId) {
    currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (currentUser) {
      notifications = await prisma.notification.findMany({
        where: { userId: currentUser.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    }
  }

  return (
    <html lang="cs">
      <body className={`${inter.className} bg-gray-50 text-gray-900 font-sans`}>
        {currentUser && !currentUser.mustChangePassword ? (
          <ClientAppShell
            sidebar={
              /* @ts-ignore */
              <Sidebar currentUser={currentUser} logoutUser={logoutUser} />
            }
            header={<Header notifications={notifications} />}
          >
            {children}
          </ClientAppShell>
        ) : (
          <main className="flex flex-col min-h-screen w-full overflow-y-auto bg-gray-50">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}

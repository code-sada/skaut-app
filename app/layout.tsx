import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { logoutUser } from "./actions";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 flex min-h-screen font-sans`}
      >
        {currentUser && !currentUser.mustChangePassword ? (
          <>
            {/* @ts-ignore */}
            <Sidebar currentUser={currentUser} logoutUser={logoutUser} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              {/* VLOŽENA NAŠE NOVÁ HLAVIČKA S OZNÁMENÍMI */}
              <Header notifications={notifications} />

              <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
              </main>
            </div>
          </>
        ) : (
          <main className="flex-1 w-full h-screen overflow-y-auto">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}

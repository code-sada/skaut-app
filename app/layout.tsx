import type { Metadata } from "next";
import "./globals.css";
import { logoutUser } from "./actions";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ClientAppShell from "@/components/ClientAppShell";
import CookieBanner from "@/components/CookieBanner";
import { prisma, getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "SKAUTAPP",
  description: "Informační systém oddílu",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getSessionUser();
  let notifications: any[] = [];

  if (currentUser) {
    notifications = await prisma.notification.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  const safeCurrentUser = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        mustChangePassword: currentUser.mustChangePassword,
      }
    : null;

  return (
    <html lang="cs">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#1a237e] focus:text-white focus:rounded-lg focus:font-bold"
        >
          Přeskočit na hlavní obsah
        </a>
        {safeCurrentUser && !safeCurrentUser.mustChangePassword ? (
          <ClientAppShell
            sidebar={
              <Sidebar currentUser={safeCurrentUser} logoutUser={logoutUser} />
            }
            header={<Header notifications={notifications} />}
          >
            {children}
          </ClientAppShell>
        ) : (
          <main
            id="main-content"
            className="flex flex-col min-h-screen w-full overflow-y-auto bg-gray-50"
          >
            {children}
          </main>
        )}
        <CookieBanner />
      </body>
    </html>
  );
}

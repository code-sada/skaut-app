import type { Metadata } from "next";
import "./globals.css";
import { logoutUser } from "./actions";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ClientAppShell from "@/components/ClientAppShell";
import CookieBanner from "@/components/CookieBanner";
import { Snowfall } from "falling-snow/react";
import { prisma, getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "SKAUTAPP",
  description: "Informační systém oddílu",
};

function isSnowSeason(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0 = leden, 10 = listopad, 11 = prosinec
  const day = date.getDate();

  return (
    (month === 10 && day >= 29) || month === 11 || (month === 0 && day <= 10)
  );
}

function formatUtcDateYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// Stanice ČHMÚ Brno-Tuřany (WSI: 0-20000-0-11723), prvek "T" = teplota vzduchu ve 2 m (°C)
async function getBrnoTemperatureFromChmu(): Promise<number | null> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const datesToTry = [
    formatUtcDateYYYYMMDD(now),
    formatUtcDateYYYYMMDD(yesterday),
  ];

  for (const dateStr of datesToTry) {
    try {
      const url = `https://opendata.chmi.cz/meteorology/climate/now/data/10m-0-20000-0-11723-${dateStr}.json`;
      const res = await fetch(url, {
        next: { revalidate: 600 }, // Cache na 10 minut (interval měření ČHMÚ)
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) continue;

      const json = await res.json();
      const values: unknown[] | undefined = json?.data?.data?.values;
      if (!Array.isArray(values)) continue;

      for (let i = values.length - 1; i >= 0; i--) {
        const row = values[i];
        if (
          Array.isArray(row) &&
          row[1] === "T" &&
          typeof row[3] === "number"
        ) {
          return row[3];
        }
      }
    } catch {
      // Při výpadku ČHMÚ nebo offline režimu tiše pokračujeme
    }
  }

  return null;
}

const SNOW_TEMP_THRESHOLD_C = 2; // Kolem 0 °C (<= 2 °C)

async function shouldShowSnow(now: Date = new Date()): Promise<boolean> {
  // 1. Mezi 29. 11. a 10. 1. sněží vždy na 100 %
  if (isSnowSeason(now)) {
    return true;
  }

  // 2. Mimo sezónu sněží, pokud je v Brně dle ČHMÚ kolem 0 °C nebo méně
  const brnoTemp = await getBrnoTemperatureFromChmu();
  return brnoTemp !== null && brnoTemp <= SNOW_TEMP_THRESHOLD_C;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, showSnow] = await Promise.all([
    getSessionUser(),
    shouldShowSnow(),
  ]);
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
        {showSnow && (
          <Snowfall
            fullScreen
            colors={["#ffffff", "#dbeafe", "#bfdbfe", "#93c5fd"]}
          />
        )}
        <CookieBanner />
      </body>
    </html>
  );
}

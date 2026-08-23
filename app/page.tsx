import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { cookies } from "next/headers";
import { Tent, Compass, ArrowRight } from "lucide-react";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // 1. Získání přihlášeného uživatele včetně jeho družiny
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  let currentUser = null;
  if (userId) {
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { patrol: true },
    });
  }

  const userPatrolName = currentUser?.patrol?.name;

  // 2. Nejbližší výprava (OPRAVENÝ FILTR BEZ NULL)
  const eventWhereClause: any = {
    date: { gte: new Date() },
  };

  if (userPatrolName) {
    // Ukáže akce bez uvedené družiny (prázdný text), pro "Všechny", NEBO přímo pro družinu uživatele
    eventWhereClause.OR = [
      { targetPatrol: "" },
      { targetPatrol: "Všichni" },
      { targetPatrol: userPatrolName },
    ];
  } else {
    // Pro adminy nebo uživatele bez družiny
    eventWhereClause.OR = [{ targetPatrol: "" }, { targetPatrol: "Všichni" }];
  }

  const nextEvent = await prisma.event.findFirst({
    where: eventWhereClause,
    orderBy: { date: "asc" },
  });

  // 3. Nejbližší schůzka
  const meetingWhereClause: any = {
    date: { gte: new Date() },
  };

  if (currentUser?.patrolId) {
    meetingWhereClause.patrolId = currentUser.patrolId;
  }

  const nextMeeting = await prisma.meeting.findFirst({
    where: meetingWhereClause,
    orderBy: { date: "asc" },
    include: { patrol: true },
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      {/* Hlavička */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a237e]">Přehled</h1>
        <p className="text-gray-500 mt-1">
          Rychlý souhrn toho nejdůležitějšího z oddílu.
        </p>
      </div>

      {/* Grid s 2 hlavními dlaždicemi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DLAŽDICE 1: NEJBLIŽŠÍ VÝPRAVA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col group hover:shadow-md hover:border-green-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Tent className="w-5 h-5 text-[#00c853]" /> Výpravy a akce
            </h2>
          </div>

          <div className="flex-1">
            {nextEvent ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nejbližší akce
                </p>
                <div className="bg-green-50/50 border border-green-200 p-4 rounded-xl">
                  <h3 className="font-bold text-[#1a237e] mb-1">
                    {nextEvent.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(nextEvent.date).toLocaleDateString("cs-CZ")} •{" "}
                    {nextEvent.location}
                  </p>
                  {/* Zobrazí štítek jen pokud není prázdný a není to "Všichni" */}
                  {nextEvent.targetPatrol &&
                    nextEvent.targetPatrol !== "Všichni" && (
                      <span className="inline-block px-2.5 py-1 bg-white text-green-700 text-xs font-bold rounded-lg border border-green-200 shadow-sm">
                        {nextEvent.targetPatrol}
                      </span>
                    )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-center min-h-[130px]">
                <p className="text-sm text-gray-500 font-medium">
                  Žádná blížící se akce pro tvoji družinu.
                </p>
              </div>
            )}
          </div>

          <Link
            href="/expedition"
            className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            Zobrazit všechny <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* DLAŽDICE 2: NEJBLIŽŠÍ SCHŮZKA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col group hover:shadow-md hover:border-orange-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-500" /> Schůzky
            </h2>
          </div>

          <div className="flex-1">
            {nextMeeting ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nejbližší schůzka
                </p>
                <div className="bg-orange-50/50 border border-orange-200 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {nextMeeting.title}
                  </h3>
                  <p className="text-sm text-gray-700 font-semibold">
                    {new Date(nextMeeting.date).toLocaleDateString("cs-CZ", {
                      weekday: "long",
                      day: "numeric",
                      month: "numeric",
                    })}{" "}
                    •{" "}
                    {new Date(nextMeeting.date).toLocaleTimeString("cs-CZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {nextMeeting.endTime}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-orange-100 pt-2">
                    <p className="text-xs text-gray-600 flex items-center gap-1 font-medium">
                      <span>📍</span> {nextMeeting.location || "Klubovna"}
                    </p>
                    {nextMeeting.patrol && (
                      <span className="px-2 py-0.5 bg-white text-orange-700 text-xs font-bold rounded-md border border-orange-200 shadow-sm">
                        {nextMeeting.patrol.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-center min-h-[130px]">
                <p className="text-sm text-gray-500 font-medium">
                  Žádná naplánovaná schůzka pro tvoji družinu.
                </p>
              </div>
            )}
          </div>

          <Link
            href="/meetings"
            className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            Více informací <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

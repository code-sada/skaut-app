import { PrismaClient } from "@prisma/client";
import { Calendar as CalendarIcon, MapPin, Compass, Clock } from "lucide-react";

const prisma = new PrismaClient();

export default async function CalendarPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Stáhneme nadcházející výpravy
  const events = await prisma.event.findMany({
    where: { date: { gte: today } },
    orderBy: { date: "asc" },
  });

  // Stáhneme nadcházející schůzky
  const meetings = await prisma.meeting.findMany({
    where: { date: { gte: today } },
    orderBy: { date: "asc" },
  });

  // Spojíme a seřadíme chronologicky
  const allActivities = [
    ...events.map((e) => ({ ...e, type: "EVENT" as const })),
    ...meetings.map((m) => ({ ...m, type: "MEETING" as const })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Kalendář</h1>
          <p className="text-gray-500 mt-1">
            Všechny nadcházející akce a schůzky přehledně.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {allActivities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500 font-medium">
              Zatím nejsou v plánu žádné akce.
            </p>
          </div>
        ) : (
          allActivities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {/* Datumovka */}
              <div className="flex flex-col items-center justify-center bg-gray-50 w-16 h-16 rounded-xl border border-gray-100 shrink-0">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {new Date(activity.date).toLocaleDateString("cs-CZ", {
                    month: "short",
                  })}
                </span>
                <span className="text-xl font-black text-[#1a237e]">
                  {new Date(activity.date).getDate()}
                </span>
              </div>

              {/* Obsah */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {activity.type === "EVENT" ? (
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-max">
                      <MapPin className="w-3 h-3" /> VÝPRAVA
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-max">
                      <Compass className="w-3 h-3" /> SCHŮZKA
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {activity.title}
                </h3>
                {activity.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {activity.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

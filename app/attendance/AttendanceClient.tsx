"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MapPin,
  Compass,
  Check,
  X as XIcon,
  HelpCircle,
  Minus,
} from "lucide-react";

export default function AttendanceClient({
  childrenData,
  eventsData,
  meetingsData,
}: any) {
  const [filter, setFilter] = useState<"ALL" | "EVENTS" | "MEETINGS">("ALL");

  // Sloučíme akce i schůzky dohromady a seřadíme je chronologicky od nejnovějších
  const allActivities = [
    ...eventsData.map((e: any) => ({
      id: e.id,
      title: e.title,
      date: new Date(e.date),
      type: "EVENT",
      attendances: e.attendance,
    })),
    ...meetingsData.map((m: any) => ({
      id: m.id,
      title: m.title,
      date: new Date(m.date),
      type: "MEETING",
      attendances: m.attendance,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Nejnovější první

  // Filtrování tabulky
  const displayedActivities = allActivities.filter((a) => {
    if (filter === "EVENTS") return a.type === "EVENT";
    if (filter === "MEETINGS") return a.type === "MEETING";
    return true;
  });

  // ----------------------------------------------------
  // VÝPOČTY PRO GRAF (Recharts data)
  // ----------------------------------------------------
  const chartData = [...displayedActivities].reverse().map((activity) => {
    // Do grafu to dáme od nejstaršího zleva doprava
    const stats = { ANO: 0, NE: 0, MOZNA: 0 };
    activity.attendances.forEach((a: any) => {
      if (a.status === "ANO") stats.ANO++;
      if (a.status === "NE") stats.NE++;
      if (a.status === "MOZNA") stats.MOZNA++;
    });

    return {
      name:
        activity.title.length > 15
          ? activity.title.substring(0, 15) + "..."
          : activity.title,
      fullTitle: activity.title,
      date: activity.date.toLocaleDateString("cs-CZ"),
      "Účastní se": stats.ANO,
      Nejede: stats.NE,
      Možná: stats.MOZNA,
    };
  });

  // Pomocná funkce pro vyhledání stavu v tabulce
  const getAttendanceStatus = (userId: string, activity: any) => {
    const record = activity.attendances.find((a: any) => a.userId === userId);
    return record ? record.status : "NONE";
  };

  // Pomocná funkce na ikony v tabulce
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "ANO":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <Check className="w-5 h-5" />
          </div>
        );
      case "NE":
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <XIcon className="w-5 h-5" />
          </div>
        );
      case "MOZNA":
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto">
            <Minus className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e]">
          Centrála docházky
        </h1>
        <p className="text-gray-500 mt-1">
          Velitelský přehled pro adminy a vedoucí.
        </p>
      </div>

      {/* GRAFY */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          Trend účasti na akcích
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{
                  fontWeight: "bold",
                  color: "#1a237e",
                  marginBottom: "8px",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="Účastní se"
                stackId="a"
                fill="#00c853"
                radius={[0, 0, 4, 4]}
              />
              <Bar dataKey="Možná" stackId="a" fill="#facc15" />
              <Bar
                dataKey="Nejede"
                stackId="a"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* VELKÁ TABULKA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Ovládání tabulky */}
        <div className="p-4 border-b border-gray-100 flex gap-2 bg-gray-50/50">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filter === "ALL" ? "bg-[#1a237e] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Všechno
          </button>
          <button
            onClick={() => setFilter("EVENTS")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${filter === "EVENTS" ? "bg-[#00c853] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            <MapPin className="w-4 h-4" /> Výpravy
          </button>
          <button
            onClick={() => setFilter("MEETINGS")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${filter === "MEETINGS" ? "bg-blue-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            <Compass className="w-4 h-4" /> Schůzky
          </button>
        </div>

        {/* Samotná mřížka */}
        <div className="overflow-x-auto w-full max-h-[600px] relative custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase text-gray-500 bg-gray-50 sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="sticky left-0 top-0 z-30 bg-gray-50 p-4 font-extrabold w-64 min-w-[16rem] border-r border-b border-gray-200 shadow-[1px_0_0_0_#e5e7eb]">
                  Jméno člena
                </th>
                {displayedActivities.map((activity) => (
                  <th
                    key={activity.id}
                    className="p-3 font-bold text-center border-b border-gray-200 min-w-[120px] max-w-[140px]"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      {activity.type === "EVENT" ? (
                        <MapPin className="w-4 h-4 text-[#00c853]" />
                      ) : (
                        <Compass className="w-4 h-4 text-blue-500" />
                      )}
                      <span
                        className="truncate w-full text-center"
                        title={activity.title}
                      >
                        {activity.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {activity.date.toLocaleDateString("cs-CZ")}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {childrenData.map((child: any, idx: number) => (
                <tr
                  key={child.id}
                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="sticky left-0 bg-white p-4 font-bold text-gray-900 border-r border-gray-100 z-10 shadow-[1px_0_0_0_#f3f4f6]">
                    {child.name}
                    {child.patrol && (
                      <div className="text-xs font-normal text-gray-500 mt-0.5">
                        {child.patrol.name}
                      </div>
                    )}
                  </td>
                  {displayedActivities.map((activity) => (
                    <td
                      key={activity.id}
                      className="p-2 border-r border-gray-50 border-dashed"
                    >
                      <StatusIcon
                        status={getAttendanceStatus(child.id, activity)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        /* Stylizace hezčího scrollovátka pro tabulku */
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MapPin,
  Compass,
  Check,
  X as XIcon,
  Minus,
  BarChart3,
  Users,
  Calendar,
  Shield,
  Stethoscope,
  AlertTriangle,
  MessageSquare,
  Pencil,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { adminSaveAttendance } from "@/app/actions";

function normalizeStatus(raw: string | undefined | null): "ANO" | "NE" | "NONE" {
  if (!raw) return "NONE";
  if (raw === "ANO" || raw === "GOING") return "ANO";
  if (raw === "NE" || raw === "NOT_GOING") return "NE";
  return "NONE";
}

export type ReasonCategory = "ILLNESS" | "FAMILY_SCHOOL" | "OTHER" | "NO_REASON";

export function classifyAbsenceReason(note: string | undefined | null): {
  category: ReasonCategory;
  label: string;
  cleanNote: string;
  badgeClass: string;
  emoji: string;
} {
  const raw = (note || "").trim();
  if (!raw) {
    return {
      category: "NO_REASON",
      label: "Bez udání důvodu",
      cleanNote: "",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      emoji: "❓",
    };
  }

  const lower = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const cleanNote = raw.replace(/^\[(Nemoc|Rodina|Škola|Skola|Jiné|Jine)\]\s*/i, "").trim();

  if (
    raw.startsWith("[Nemoc]") ||
    lower.includes("nemoc") ||
    lower.includes("horec") ||
    lower.includes("teplot") ||
    lower.includes("angin") ||
    lower.includes("chripk") ||
    lower.includes("kasel") ||
    lower.includes("ryma") ||
    lower.includes("lekar") ||
    lower.includes("doktor") ||
    lower.includes("zubar") ||
    lower.includes("uraz") ||
    lower.includes("nemocnic") ||
    lower.includes("antibiotik") ||
    lower.includes("zdrav") ||
    lower.includes("bolest") ||
    lower.includes("vyrážk") ||
    lower.includes("vyrazk") ||
    lower.includes("alergi")
  ) {
    return {
      category: "ILLNESS",
      label: "Nemoc / Lékař",
      cleanNote: cleanNote || "Zdravotní důvody",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      emoji: "🤒",
    };
  }

  if (
    raw.startsWith("[Rodina]") ||
    raw.startsWith("[Škola]") ||
    lower.includes("rodin") ||
    lower.includes("oslava") ||
    lower.includes("babick") ||
    lower.includes("deda") ||
    lower.includes("dovolena") ||
    lower.includes("hory") ||
    lower.includes("skol") ||
    lower.includes("uceni") ||
    lower.includes("zkousk") ||
    lower.includes("zavod") ||
    lower.includes("turnaj") ||
    lower.includes("krouzek") ||
    lower.includes("trenink")
  ) {
    return {
      category: "FAMILY_SCHOOL",
      label: "Rodina / Škola",
      cleanNote: cleanNote || raw,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      emoji: "👨‍👩‍👧",
    };
  }

  return {
    category: "OTHER",
    label: "Jiný důvod",
    cleanNote: cleanNote || raw,
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    emoji: "⚠️",
  };
}

export default function AttendanceClient({
  childrenData = [],
  patrolsData = [],
  eventsData = [],
  meetingsData = [],
}: any) {
  const [filter, setFilter] = useState<"ALL" | "EVENTS" | "MEETINGS">("ALL");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedPatrolId, setSelectedPatrolId] = useState<string | null>(null);
  const [memberHistoryFilter, setMemberHistoryFilter] = useState<
    "ALL" | "ABSENCES" | "EVENTS" | "MEETINGS"
  >("ALL");

  // Stav pro rychlou úpravu docházky a poznámky u konkrétní akce člena
  const [editingActivity, setEditingActivity] = useState<{
    activityId: string;
    activityType: "EVENT" | "MEETING";
    activityTitle: string;
    userId: string;
    status: "GOING" | "NOT_GOING";
    note: string;
  } | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (selectedMemberId || selectedPatrolId || editingActivity) {
      document.body.classList.add("modal-open");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (editingActivity) {
            setEditingActivity(null);
          } else if (selectedMemberId) {
            setSelectedMemberId(null);
          } else if (selectedPatrolId) {
            setSelectedPatrolId(null);
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.classList.remove("modal-open");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedMemberId, selectedPatrolId, editingActivity]);

  const totalMembers = childrenData?.length || 0;

  const allActivities = [
    ...eventsData.map((e: any) => ({
      id: e.id,
      title: e.title,
      date: new Date(e.date),
      type: "EVENT" as const,
      targetPatrol: e.targetPatrol || "Všichni",
      attendances: e.attendance || [],
    })),
    ...meetingsData.map((m: any) => ({
      id: m.id,
      title: m.title,
      date: new Date(m.date),
      type: "MEETING" as const,
      patrolId: m.patrolId,
      patrolName: m.patrol?.name || "",
      attendances: m.attendance || [],
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const displayedActivities = allActivities.filter((a) => {
    if (filter === "EVENTS") return a.type === "EVENT";
    if (filter === "MEETINGS") return a.type === "MEETING";
    return true;
  });

  // Chronologicky od nejstaršího po nejnovější pro hlavní graf
  const chartData = [...displayedActivities].reverse().map((activity) => {
    const stats = { ANO: 0, NE: 0 };
    activity.attendances.forEach((a: any) => {
      const norm = normalizeStatus(a.status);
      if (norm === "ANO") stats.ANO++;
      if (norm === "NE") stats.NE++;
    });

    return {
      name:
        activity.title.length > 15
          ? activity.title.substring(0, 15) + "..."
          : activity.title,
      fullTitle: activity.title,
      date: activity.date.toLocaleDateString("cs-CZ"),
      Jel: stats.ANO,
      Nejel: stats.NE,
    };
  });

  const avgAttendingCount =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((acc, item) => acc + item.Jel, 0) / chartData.length,
        )
      : 0;

  const avgRatePct =
    chartData.length > 0 && totalMembers > 0
      ? Math.round(
          (chartData.reduce((acc, item) => acc + item.Jel, 0) /
            (chartData.length * totalMembers)) *
            100,
        )
      : 0;

  const getAttendanceRecord = (userId: string, activity: any) => {
    return activity.attendances.find((a: any) => a.userId === userId);
  };

  // Sestavení seznamu družin (z DB + z přiřazených členů)
  const patrolMap = new Map<string, { id: string; name: string; members: any[] }>();
  patrolsData.forEach((p: any) => {
    patrolMap.set(p.id, { id: p.id, name: p.name, members: [] });
  });
  childrenData.forEach((c: any) => {
    const pId = c.patrol?.id || c.patrolId;
    const pName = c.patrol?.name;
    if (pId && pName) {
      if (!patrolMap.has(pId)) {
        patrolMap.set(pId, { id: pId, name: pName, members: [] });
      }
      patrolMap.get(pId)!.members.push(c);
    }
  });
  const patrolsWithMembers = Array.from(patrolMap.values()).filter(
    (p) => p.members.length > 0,
  );

  // Pomocná funkce: které akce jsou relevantní pro člena / družinu
  const isActivityForPatrol = (activity: any, patrolId?: string, patrolName?: string) => {
    if (activity.type === "EVENT") {
      if (
        !activity.targetPatrol ||
        activity.targetPatrol === "Všichni" ||
        !patrolName
      ) {
        return true;
      }
      return activity.targetPatrol === patrolName;
    }
    if (activity.type === "MEETING") {
      if (!patrolId) return true;
      return activity.patrolId === patrolId;
    }
    return true;
  };

  // Výpočet statistik pro jednoho člena
  const computeMemberStats = (member: any) => {
    const pId = member.patrol?.id || member.patrolId;
    const pName = member.patrol?.name;
    const relevantActivities = allActivities.filter(
      (act) =>
        isActivityForPatrol(act, pId, pName) ||
        act.attendances.some((a: any) => a.userId === member.id),
    );

    let goingTotal = 0;
    let notGoingTotal = 0;
    let goingEvents = 0;
    let totalEvents = 0;
    let goingMeetings = 0;
    let totalMeetings = 0;
    let illnessCount = 0;
    let familySchoolCount = 0;
    let otherReasonCount = 0;

    const monthlyMap = new Map<
      string,
      { month: string; Jel: number; Nejel: number }
    >();

    const history = relevantActivities.map((act) => {
      const rec = getAttendanceRecord(member.id, act);
      const status = normalizeStatus(rec?.status);
      const note = rec?.note || "";
      const reasonInfo =
        status === "NE" ? classifyAbsenceReason(note) : null;

      if (act.type === "EVENT") totalEvents++;
      if (act.type === "MEETING") totalMeetings++;

      if (status === "ANO") {
        goingTotal++;
        if (act.type === "EVENT") goingEvents++;
        if (act.type === "MEETING") goingMeetings++;
      } else if (status === "NE") {
        notGoingTotal++;
        if (reasonInfo?.category === "ILLNESS") illnessCount++;
        else if (reasonInfo?.category === "FAMILY_SCHOOL") familySchoolCount++;
        else otherReasonCount++;
      }

      const monthKey = `${act.date.getFullYear()}-${String(act.date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = act.date.toLocaleDateString("cs-CZ", {
        month: "short",
        year: "2-digit",
      });
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthLabel, Jel: 0, Nejel: 0 });
      }
      const mEntry = monthlyMap.get(monthKey)!;
      if (status === "ANO") mEntry.Jel++;
      if (status === "NE") mEntry.Nejel++;

      return {
        activity: act,
        status,
        note,
        reasonInfo,
      };
    });

    const decidedCount = goingTotal + notGoingTotal;
    const overallPct =
      decidedCount > 0
        ? Math.round((goingTotal / decidedCount) * 100)
        : relevantActivities.length > 0
          ? Math.round((goingTotal / relevantActivities.length) * 100)
          : 0;

    const eventsPct =
      totalEvents > 0 ? Math.round((goingEvents / totalEvents) * 100) : 0;
    const meetingsPct =
      totalMeetings > 0 ? Math.round((goingMeetings / totalMeetings) * 100) : 0;

    const monthlyChart = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, val]) => val);

    const typeComparisonChart = [
      {
        name: "Výpravy",
        Jel: goingEvents,
        Nejel: history.filter(
          (h) => h.activity.type === "EVENT" && h.status === "NE",
        ).length,
      },
      {
        name: "Schůzky",
        Jel: goingMeetings,
        Nejel: history.filter(
          (h) => h.activity.type === "MEETING" && h.status === "NE",
        ).length,
      },
    ];

    const pieData = [
      { name: "Jel", value: goingTotal, color: "#00c853" },
      { name: "Nemoc / Lékař", value: illnessCount, color: "#f59e0b" },
      { name: "Rodina / Škola", value: familySchoolCount, color: "#3b82f6" },
      {
        name: "Jiný důvod / Neomluveno",
        value: otherReasonCount,
        color: "#ef4444",
      },
    ].filter((d) => d.value > 0);

    return {
      relevantActivities,
      goingTotal,
      notGoingTotal,
      goingEvents,
      totalEvents,
      goingMeetings,
      totalMeetings,
      illnessCount,
      familySchoolCount,
      otherReasonCount,
      overallPct,
      eventsPct,
      meetingsPct,
      monthlyChart,
      typeComparisonChart,
      pieData,
      history,
    };
  };

  // Výpočet statistik pro družinu
  const computePatrolStats = (patrol: {
    id: string;
    name: string;
    members: any[];
  }) => {
    const memberIds = new Set(patrol.members.map((m) => m.id));
    const patrolActivities = allActivities.filter(
      (act) =>
        isActivityForPatrol(act, patrol.id, patrol.name) ||
        act.attendances.some((a: any) => memberIds.has(a.userId)),
    );

    let goingTotal = 0;
    let notGoingTotal = 0;
    let goingEvents = 0;
    let possibleEvents = 0;
    let goingMeetings = 0;
    let possibleMeetings = 0;
    let illnessCount = 0;
    let familySchoolCount = 0;
    let otherReasonCount = 0;

    const absencesList: {
      member: any;
      activity: any;
      note: string;
      reasonInfo: ReturnType<typeof classifyAbsenceReason>;
    }[] = [];

    const memberComparisonChart = patrol.members.map((member) => {
      let mJel = 0;
      let mNejel = 0;
      let mNemoc = 0;
      let mJine = 0;

      patrolActivities.forEach((act) => {
        const rec = getAttendanceRecord(member.id, act);
        const st = normalizeStatus(rec?.status);
        if (act.type === "EVENT") possibleEvents++;
        if (act.type === "MEETING") possibleMeetings++;

        if (st === "ANO") {
          mJel++;
          goingTotal++;
          if (act.type === "EVENT") goingEvents++;
          if (act.type === "MEETING") goingMeetings++;
        } else if (st === "NE") {
          mNejel++;
          notGoingTotal++;
          const rInfo = classifyAbsenceReason(rec?.note);
          if (rInfo.category === "ILLNESS") {
            illnessCount++;
            mNemoc++;
          } else if (rInfo.category === "FAMILY_SCHOOL") {
            familySchoolCount++;
            mJine++;
          } else {
            otherReasonCount++;
            mJine++;
          }
          absencesList.push({
            member,
            activity: act,
            note: rec?.note || "",
            reasonInfo: rInfo,
          });
        }
      });

      const decided = mJel + mNejel;
      const pct = decided > 0 ? Math.round((mJel / decided) * 100) : 0;

      return {
        id: member.id,
        name: member.name.split(" ")[0],
        fullName: member.name,
        Jel: mJel,
        Nejel: mNejel,
        nemoc: mNemoc,
        jine: mJine,
        pct,
      };
    });

    const timelineChart = [...patrolActivities]
      .reverse()
      .slice(-12)
      .map((act) => {
        let jel = 0;
        let nejel = 0;
        patrol.members.forEach((m) => {
          const st = normalizeStatus(getAttendanceRecord(m.id, act)?.status);
          if (st === "ANO") jel++;
          if (st === "NE") nejel++;
        });
        return {
          date: act.date.toLocaleDateString("cs-CZ"),
          fullTitle: act.title,
          Jel: jel,
          Nejel: nejel,
        };
      });

    const totalDecided = goingTotal + notGoingTotal;
    const overallPct =
      totalDecided > 0 ? Math.round((goingTotal / totalDecided) * 100) : 0;
    const eventsPct =
      possibleEvents > 0 ? Math.round((goingEvents / possibleEvents) * 100) : 0;
    const meetingsPct =
      possibleMeetings > 0
        ? Math.round((goingMeetings / possibleMeetings) * 100)
        : 0;

    const pieData = [
      { name: "Jel", value: goingTotal, color: "#00c853" },
      { name: "Nemoc / Lékař", value: illnessCount, color: "#f59e0b" },
      { name: "Rodina / Škola", value: familySchoolCount, color: "#3b82f6" },
      {
        name: "Jiný důvod / Neomluveno",
        value: otherReasonCount,
        color: "#ef4444",
      },
    ].filter((d) => d.value > 0);

    return {
      patrolActivities,
      goingTotal,
      notGoingTotal,
      illnessCount,
      familySchoolCount,
      otherReasonCount,
      overallPct,
      eventsPct,
      meetingsPct,
      memberComparisonChart,
      timelineChart,
      pieData,
      absencesList,
    };
  };

  const selectedMember = selectedMemberId
    ? childrenData.find((c: any) => c.id === selectedMemberId)
    : null;
  const selectedMemberStats = selectedMember
    ? computeMemberStats(selectedMember)
    : null;

  const selectedPatrol = selectedPatrolId
    ? patrolsWithMembers.find((p) => p.id === selectedPatrolId)
    : null;
  const selectedPatrolStats = selectedPatrol
    ? computePatrolStats(selectedPatrol)
    : null;

  const StatusCell = ({
    child,
    activity,
  }: {
    child: any;
    activity: any;
  }) => {
    const record = getAttendanceRecord(child.id, activity);
    const status = normalizeStatus(record?.status);
    const note = record?.note?.trim() || "";
    const reason = status === "NE" ? classifyAbsenceReason(note) : null;

    return (
      <button
        type="button"
        onClick={() => {
          setSelectedPatrolId(null);
          setSelectedMemberId(child.id);
          setEditingActivity({
            activityId: activity.id,
            activityType: activity.type,
            activityTitle: activity.title,
            userId: child.id,
            status: status === "NE" ? "NOT_GOING" : "GOING",
            note: note,
          });
        }}
        title={
          status === "ANO"
            ? `Jel / Přijel${note ? ` – Poznámka: ${note}` : ""} (klikni pro detail)`
            : status === "NE"
              ? `Nejel (${reason?.label})${note ? `: ${reason?.cleanNote}` : ""} (klikni pro detail)`
              : "Nevyplněno (klikni pro detail nebo zadání)"
        }
        className="relative group mx-auto flex items-center justify-center focus:outline-none"
      >
        {status === "ANO" ? (
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:ring-2 group-hover:ring-green-400 transition-all">
            <Check className="w-5 h-5" />
          </div>
        ) : status === "NE" ? (
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:ring-2 group-hover:ring-red-400 transition-all">
            <XIcon className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center group-hover:bg-gray-100 group-hover:text-gray-500 transition-all">
            <Minus className="w-5 h-5" />
          </div>
        )}

        {/* Odznak důvodu nebo poznámky přímo v tabulce */}
        {status === "NE" && note && (
          <span
            className="absolute -top-1.5 -right-1.5 text-[11px] leading-none bg-white rounded-full shadow-sm border border-gray-200 px-1 py-0.5"
            aria-hidden="true"
          >
            {reason?.emoji}
          </span>
        )}
        {status === "ANO" && note && (
          <span
            className="absolute -top-1.5 -right-1.5 text-[10px] leading-none bg-blue-50 text-blue-600 rounded-full shadow-sm border border-blue-200 px-1 py-0.5"
            aria-hidden="true"
          >
            💬
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* HLAVIČKA S FILTREM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">
            Centrála docházky
          </h1>
          <p className="text-gray-500 mt-1">
            Klikni na člena nebo družinu pro podrobné grafy účasti a důvody
            absencí.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              filter === "ALL"
                ? "bg-[#1a237e] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Všechno
          </button>
          <button
            type="button"
            onClick={() => setFilter("EVENTS")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === "EVENTS"
                ? "bg-[#00c853] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <MapPin className="w-4 h-4" /> Výpravy
          </button>
          <button
            type="button"
            onClick={() => setFilter("MEETINGS")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === "MEETINGS"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Compass className="w-4 h-4" /> Schůzky
          </button>
        </div>
      </div>

      {/* PŘEHLEDOVÉ DLAŽDICE V TVÉM STYLU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-[#00c853] shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Průměrná účast
            </p>
            <p className="text-2xl font-extrabold text-[#1a237e] mt-0.5">
              {avgRatePct} %{" "}
              <span className="text-sm font-semibold text-gray-400">
                ({avgAttendingCount} z {totalMembers})
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1a237e] shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Zobrazeno akcí
            </p>
            <p className="text-2xl font-extrabold text-[#1a237e] mt-0.5">
              {displayedActivities.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#1a237e] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Počet členů
            </p>
            <p className="text-2xl font-extrabold text-[#1a237e] mt-0.5">
              {totalMembers}
            </p>
          </div>
        </div>
      </div>

      {/* DRUŽINKY – KLIKACÍ KARTY PRO OTEVŘENÍ MODALU DRUŽINY */}
      {patrolsWithMembers.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1a237e] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00c853]" /> Přehled podle
                družin
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Klikni na družinu pro otevření jejích grafů účasti a omluvenek.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {patrolsWithMembers.map((patrol) => {
              const pStats = computePatrolStats(patrol);
              return (
                <button
                  key={patrol.id}
                  type="button"
                  onClick={() => {
                    setSelectedMemberId(null);
                    setEditingActivity(null);
                    setSelectedPatrolId(patrol.id);
                  }}
                  className="text-left p-4 rounded-xl border border-gray-200 hover:border-[#00c853] hover:shadow-md bg-gray-50/50 hover:bg-white transition-all group flex items-center justify-between"
                >
                  <div>
                    <p className="font-extrabold text-[#1a237e] group-hover:text-[#00c853] transition-colors">
                      {patrol.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {patrol.members.length} členů • Nemoc:{" "}
                      {pStats.illnessCount}×
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-extrabold text-sm border border-green-200">
                      {pStats.overallPct} %
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#00c853] transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GRAF ÚČASTI (POUZE JEL / NEJEL) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#1a237e]">
              Graf účasti na akcích
            </h2>
            <p className="text-sm text-gray-500">
              Přehled kolik členů jelo a nejelo na jednotlivé akce.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#00c853] inline-block" />
              Jel
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#ef4444] inline-block" />
              Nejel
            </span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                barGap={6}
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
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.fullTitle} (${label})` : label;
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "#1a237e",
                    marginBottom: "6px",
                  }}
                />
                <Bar
                  dataKey="Jel"
                  fill="#00c853"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="Nejel"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium">
            Zatím nejsou k dispozici žádné akce pro zobrazení grafu.
          </div>
        )}
      </div>

      {/* TABULKA DOCHÁZKY */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1a237e]">
              Přehled podle členů
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Klikni na jméno člena pro jeho osobní grafy a důvody absencí, nebo
              na buňku pro rychlou úpravu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
              Jel
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <XIcon className="w-3.5 h-3.5" />
              </span>
              Nejel
            </span>
            <span className="flex items-center gap-1.5">
              <span>🤒</span> Nemoc / Lékař
            </span>
            <span className="flex items-center gap-1.5">
              <span>⚠️</span> Jiný důvod
            </span>
          </div>
        </div>

        <div className="overflow-x-auto w-full max-h-[600px] relative custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase text-gray-500 bg-gray-50 sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="sticky left-0 top-0 z-30 bg-gray-50 p-4 font-extrabold w-64 min-w-[16rem] border-r border-b border-gray-200 shadow-[1px_0_0_0_#e5e7eb]">
                  Jméno člena / Družina
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
                        className="truncate w-full text-center text-gray-800"
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
              {childrenData.map((child: any) => (
                <tr
                  key={child.id}
                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="sticky left-0 bg-white p-4 font-bold text-gray-900 border-r border-gray-100 z-10 shadow-[1px_0_0_0_#f3f4f6]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatrolId(null);
                        setEditingActivity(null);
                        setMemberHistoryFilter("ALL");
                        setSelectedMemberId(child.id);
                      }}
                      className="text-left font-bold text-gray-900 hover:text-[#1a237e] hover:underline flex items-center gap-1.5 group"
                    >
                      <span>{child.name}</span>
                      <BarChart3 className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#00c853] transition-colors shrink-0" />
                    </button>
                    {child.patrol && (
                      <button
                        type="button"
                        onClick={() => {
                          const pId = child.patrol?.id || child.patrolId;
                          if (pId) {
                            setSelectedMemberId(null);
                            setEditingActivity(null);
                            setSelectedPatrolId(pId);
                          }
                        }}
                        className="block text-xs font-medium text-gray-500 hover:text-[#00c853] mt-0.5 transition-colors"
                      >
                        {child.patrol.name}
                      </button>
                    )}
                  </td>
                  {displayedActivities.map((activity) => (
                    <td
                      key={activity.id}
                      className="p-2 border-r border-gray-50 border-dashed"
                    >
                      <StatusCell child={child} activity={activity} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODÁLNÍ OKNO 1: DETAIL ČLENA (GRAFY ÚČASTI + DŮVODY ABSENCÍ + ÚPRAVA) */}
      {/* ===================================================================== */}
      {selectedMember && selectedMemberStats && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => {
            setSelectedMemberId(null);
            setEditingActivity(null);
          }}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hlavička modalu */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1a237e] font-extrabold flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-2xl font-extrabold text-[#1a237e]">
                        {selectedMember.name}
                      </h2>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-extrabold rounded-full">
                        Účast {selectedMemberStats.overallPct} %
                      </span>
                    </div>
                    {selectedMember.patrol && (
                      <button
                        type="button"
                        onClick={() => {
                          const pId =
                            selectedMember.patrol?.id ||
                            selectedMember.patrolId;
                          if (pId) {
                            setSelectedMemberId(null);
                            setEditingActivity(null);
                            setSelectedPatrolId(pId);
                          }
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline mt-0.5 flex items-center gap-1"
                      >
                        <Shield className="w-3.5 h-3.5" /> Družina:{" "}
                        {selectedMember.patrol.name} (zobrazit družinu)
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMemberId(null);
                  setEditingActivity(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Obsah modalu člena */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* 4 Rychlé karty člena */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Celková účast
                  </p>
                  <p className="text-2xl font-extrabold text-[#1a237e] mt-1">
                    {selectedMemberStats.overallPct} %
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Jel {selectedMemberStats.goingTotal}× • Nejel{" "}
                    {selectedMemberStats.notGoingTotal}×
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Výpravy
                  </p>
                  <p className="text-2xl font-extrabold text-[#00c853] mt-1">
                    {selectedMemberStats.eventsPct} %
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedMemberStats.goingEvents} z{" "}
                    {selectedMemberStats.totalEvents} výprav
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Schůzky
                  </p>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1">
                    {selectedMemberStats.meetingsPct} %
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedMemberStats.goingMeetings} z{" "}
                    {selectedMemberStats.totalMeetings} schůzek
                  </p>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Důvody absencí
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm font-extrabold text-amber-800">
                      🤒 Nemoc: {selectedMemberStats.illnessCount}×
                    </span>
                    <span className="text-sm font-extrabold text-red-600">
                      ⚠️ Jiné:{" "}
                      {selectedMemberStats.otherReasonCount +
                        selectedMemberStats.familySchoolCount}
                      ×
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Rozlišení nemoci od ostatních důvodů
                  </p>
                </div>
              </div>

              {/* Rychlá úprava konkrétní akce (pokud vedoucí kliknul na buňku nebo Upravit) */}
              {editingActivity &&
                editingActivity.userId === selectedMember.id && (
                  <div className="bg-blue-50/70 border-2 border-blue-200 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-[#1a237e] text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600" /> Upravit
                        docházku a důvod: {editingActivity.activityTitle}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingActivity(null)}
                        className="text-xs font-bold text-gray-500 hover:text-gray-800"
                      >
                        Zavřít úpravu
                      </button>
                    </div>

                    <form
                      action={async (formData) => {
                        setIsSavingEdit(true);
                        await adminSaveAttendance(formData);
                        setIsSavingEdit(false);
                        setEditingActivity(null);
                      }}
                      className="space-y-4"
                    >
                      <input
                        type="hidden"
                        name="userId"
                        value={editingActivity.userId}
                      />
                      <input
                        type="hidden"
                        name="activityId"
                        value={editingActivity.activityId}
                      />
                      <input
                        type="hidden"
                        name="activityType"
                        value={editingActivity.activityType}
                      />
                      <input
                        type="hidden"
                        name="status"
                        value={editingActivity.status}
                      />

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingActivity({
                              ...editingActivity,
                              status: "GOING",
                            })
                          }
                          className={`flex-1 py-2.5 px-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                            editingActivity.status === "GOING"
                              ? "border-[#00c853] bg-green-50 text-green-700"
                              : "border-gray-200 bg-white text-gray-500"
                          }`}
                        >
                          <Check className="w-4 h-4" /> Jel / Přijel
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingActivity({
                              ...editingActivity,
                              status: "NOT_GOING",
                            })
                          }
                          className={`flex-1 py-2.5 px-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                            editingActivity.status === "NOT_GOING"
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 bg-white text-gray-500"
                          }`}
                        >
                          <XIcon className="w-4 h-4" /> Nejel / Nepřijel
                        </button>
                      </div>

                      {editingActivity.status === "NOT_GOING" && (
                        <div>
                          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                            Rychlé označení důvodu (odliší nemoc od blbosti):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "🤒 Nemoc / Lékař", tag: "[Nemoc] " },
                              { label: "👨‍👩‍👧 Rodinné důvody", tag: "[Rodina] " },
                              { label: "🏫 Škola / Kroužek", tag: "[Škola] " },
                              {
                                label: "⚠️ Jiný důvod / Blbost",
                                tag: "[Jiné] ",
                              },
                            ].map((r) => (
                              <button
                                key={r.tag}
                                type="button"
                                onClick={() => {
                                  const cleaned = editingActivity.note.replace(
                                    /^\[(Nemoc|Rodina|Škola|Jiné)\]\s*/i,
                                    "",
                                  );
                                  setEditingActivity({
                                    ...editingActivity,
                                    note: `${r.tag}${cleaned}`,
                                  });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                  editingActivity.note.startsWith(r.tag.trim())
                                    ? "bg-[#1a237e] text-white border-[#1a237e]"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Poznámka / Důvod absence:
                        </label>
                        <input
                          type="text"
                          name="note"
                          value={editingActivity.note}
                          onChange={(e) =>
                            setEditingActivity({
                              ...editingActivity,
                              note: e.target.value,
                            })
                          }
                          placeholder="Např. [Nemoc] Měl horečku a angínu / [Jiné] Zapomněl přijít..."
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingActivity(null)}
                          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50"
                        >
                          Zrušit
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingEdit}
                          className="px-5 py-2 rounded-xl bg-[#1a237e] hover:bg-blue-900 text-white text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {isSavingEdit ? "Ukládám..." : "Uložit docházku"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              {/* GRAFY ČLENA */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graf 1: Rozbor docházky a důvodů neúčasti (Donut) */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1a237e] mb-1">
                    Poměr účasti a důvodů absencí
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Zeleně účast, oranžově nemoc/lékař, červeně ostatní důvody.
                  </p>
                  {selectedMemberStats.pieData.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-48 w-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={selectedMemberStats.pieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={3}
                            >
                              {selectedMemberStats.pieData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 flex-1 w-full">
                        {selectedMemberStats.pieData.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                          >
                            <span className="flex items-center gap-2 font-bold text-gray-700">
                              <span
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </span>
                            <span className="font-extrabold text-gray-900">
                              {item.value}×
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic py-12 text-center">
                      Zatím nejsou zaznamenané žádné odpovědi.
                    </p>
                  )}
                </div>

                {/* Graf 2: Výpravy vs. Schůzky + Vývoj po měsících */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1a237e] mb-1">
                    Výpravy vs. Schůzky (Jel / Nejel)
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Srovnání docházky člena podle typu akce.
                  </p>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedMemberStats.typeComparisonChart}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        barGap={8}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f3f4f6"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                        <Bar
                          dataKey="Jel"
                          fill="#00c853"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                        <Bar
                          dataKey="Nejel"
                          fill="#ef4444"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Graf 3: Vývoj účasti člena po měsících */}
              {selectedMemberStats.monthlyChart.length > 1 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1a237e] mb-1">
                    Vývoj docházky po měsících
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Jak člen chodil v jednotlivých měsících.
                  </p>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedMemberStats.monthlyChart}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        barGap={6}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f3f4f6"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                        <Bar
                          dataKey="Jel"
                          fill="#00c853"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={32}
                        />
                        <Bar
                          dataKey="Nejel"
                          fill="#ef4444"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* SEZNAM VŠECH AKCÍ A DŮVODŮ NEÚČASTI ČLENA */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#1a237e]">
                      Historie akcí a poznámky (důvody absencí)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Přehled všech omluvenek – nemoc je odlišena oranžově od
                      ostatních důvodů.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "ALL", label: "Vše" },
                      { id: "ABSENCES", label: "Jen absence (Nejel)" },
                      { id: "EVENTS", label: "Výpravy" },
                      { id: "MEETINGS", label: "Schůzky" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMemberHistoryFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          memberHistoryFilter === tab.id
                            ? "bg-[#1a237e] text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {selectedMemberStats.history
                    .filter((item) => {
                      if (memberHistoryFilter === "ABSENCES")
                        return item.status === "NE";
                      if (memberHistoryFilter === "EVENTS")
                        return item.activity.type === "EVENT";
                      if (memberHistoryFilter === "MEETINGS")
                        return item.activity.type === "MEETING";
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.activity.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {item.status === "ANO" ? (
                              <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : item.status === "NE" ? (
                              <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <XIcon className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                <Minus className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">
                                {item.activity.title}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({item.activity.date.toLocaleDateString("cs-CZ")})
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.activity.type === "EVENT"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {item.activity.type === "EVENT"
                                  ? "Výprava"
                                  : "Schůzka"}
                              </span>
                            </div>

                            {/* Zobrazení důvodu / poznámky */}
                            {item.status === "NE" && item.reasonInfo && (
                              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${item.reasonInfo.badgeClass}`}
                                >
                                  <span>{item.reasonInfo.emoji}</span>
                                  {item.reasonInfo.label}
                                </span>
                                {item.reasonInfo.cleanNote && (
                                  <span className="text-xs text-gray-700 font-medium">
                                    „{item.reasonInfo.cleanNote}“
                                  </span>
                                )}
                              </div>
                            )}

                            {item.status === "ANO" && item.note && (
                              <p className="mt-1 text-xs text-gray-600 bg-blue-50/60 px-2.5 py-1 rounded-md border border-blue-100 inline-block">
                                💬 Poznámka: {item.note}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingActivity({
                              activityId: item.activity.id,
                              activityType: item.activity.type,
                              activityTitle: item.activity.title,
                              userId: selectedMember.id,
                              status:
                                item.status === "NE" ? "NOT_GOING" : "GOING",
                              note: item.note || "",
                            })
                          }
                          className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-xs font-bold text-gray-700 hover:text-[#1a237e] flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Upravit / Důvod
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Patička modalu */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedMemberId(null);
                  setEditingActivity(null);
                }}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                Zavřít přehled člena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODÁLNÍ OKNO 2: DETAIL DRUŽINY (GRAFY DRUŽINY + SROVNÁNÍ + OMLUVENKY) */}
      {/* ===================================================================== */}
      {selectedPatrol && selectedPatrolStats && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setSelectedPatrolId(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hlavička modalu družiny */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-[#00c853] font-extrabold flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl font-extrabold text-[#1a237e]">
                      Družina {selectedPatrol.name}
                    </h2>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-extrabold rounded-full">
                      Průměr {selectedPatrolStats.overallPct} %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedPatrol.members.length} členů v družině • Celkem{" "}
                    {selectedPatrolStats.patrolActivities.length} sledovaných
                    akcí
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatrolId(null)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Obsah modalu družiny */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* 4 Rychlé karty družiny */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Celková účast
                  </p>
                  <p className="text-2xl font-extrabold text-[#1a237e] mt-1">
                    {selectedPatrolStats.overallPct} %
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Jel: {selectedPatrolStats.goingTotal}× • Nejel:{" "}
                    {selectedPatrolStats.notGoingTotal}×
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Výpravy družiny
                  </p>
                  <p className="text-2xl font-extrabold text-[#00c853] mt-1">
                    {selectedPatrolStats.eventsPct} %
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Průměr na výpravách
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Schůzky družiny
                  </p>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1">
                    {selectedPatrolStats.meetingsPct} %
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Průměr na schůzkách
                  </p>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Důvody absencí
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm font-extrabold text-amber-800">
                      🤒 Nemoc: {selectedPatrolStats.illnessCount}×
                    </span>
                    <span className="text-sm font-extrabold text-red-600">
                      ⚠️ Jiné:{" "}
                      {selectedPatrolStats.otherReasonCount +
                        selectedPatrolStats.familySchoolCount}
                      ×
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    V celé družině
                  </p>
                </div>
              </div>

              {/* Graf 1: Srovnání členů v družině (Jel vs Nejel) */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-[#1a237e] mb-1">
                  Srovnání členů v družině (Jel vs. Nejel)
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Kdo v družině chodí nejvíc a kdo nejčastěji chybí.
                </p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedPatrolStats.memberComparisonChart}
                      margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                      barGap={6}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f3f4f6"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                        }}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item
                            ? `${item.fullName} (Účast: ${item.pct} %)`
                            : label;
                        }}
                      />
                      <Bar
                        dataKey="Jel"
                        fill="#00c853"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={34}
                      />
                      <Bar
                        dataKey="Nejel"
                        fill="#ef4444"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graf 2: Poměr důvodů neúčasti v družině */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1a237e] mb-1">
                    Rozbor docházky a absencí družiny
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Kolik absencí tvoří nemoc oproti jiným důvodům.
                  </p>
                  {selectedPatrolStats.pieData.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-44 w-44 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={selectedPatrolStats.pieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={3}
                            >
                              {selectedPatrolStats.pieData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 flex-1 w-full">
                        {selectedPatrolStats.pieData.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                          >
                            <span className="flex items-center gap-2 font-bold text-gray-700">
                              <span
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </span>
                            <span className="font-extrabold text-gray-900">
                              {item.value}×
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic py-10 text-center">
                      Zatím žádná data.
                    </p>
                  )}
                </div>

                {/* Členové družiny s rychlým proklikem */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1a237e] mb-1">
                    Členové družiny ({selectedPatrol.members.length})
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Klikni na člena pro otevření jeho osobního detailu.
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedPatrolStats.memberComparisonChart.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatrolId(null);
                          setSelectedMemberId(m.id);
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl border border-gray-100 hover:border-blue-300 bg-gray-50 hover:bg-blue-50/40 flex items-center justify-between transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {m.fullName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Jel: {m.Jel}× • Nejel: {m.Nejel}× (🤒 Nemoc:{" "}
                            {m.nemoc}×, ⚠️ Jiné: {m.jine}×)
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-extrabold text-[#1a237e]">
                          {m.pct} %
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seznam omluvenek v družině (Nemoc vs Blbosti) */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/60">
                  <h3 className="text-base font-bold text-[#1a237e]">
                    Přehled omluvenek a důvodů absencí v družině
                  </h3>
                  <p className="text-xs text-gray-500">
                    Všechny zaznamenané absence členů této družiny.
                  </p>
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {selectedPatrolStats.absencesList.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-400 italic">
                      V této družině zatím nejsou žádné absence.
                    </p>
                  ) : (
                    selectedPatrolStats.absencesList.map((abs, idx) => (
                      <div
                        key={`${abs.member.id}-${abs.activity.id}-${idx}`}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatrolId(null);
                                setSelectedMemberId(abs.member.id);
                              }}
                              className="font-bold text-sm text-[#1a237e] hover:underline"
                            >
                              {abs.member.name}
                            </button>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-semibold text-gray-700">
                              {abs.activity.title} (
                              {abs.activity.date.toLocaleDateString("cs-CZ")})
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${abs.reasonInfo.badgeClass}`}
                            >
                              <span>{abs.reasonInfo.emoji}</span>
                              {abs.reasonInfo.label}
                            </span>
                            {abs.reasonInfo.cleanNote && (
                              <span className="text-xs text-gray-600">
                                „{abs.reasonInfo.cleanNote}“
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Patička modalu družiny */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedPatrolId(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                Zavřít přehled družiny
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
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
    </div>
  );
}

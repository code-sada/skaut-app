import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { ShieldAlert } from "lucide-react";
import MembersClient from "./MembersClient";
import { approveUpdate, rejectUpdate } from "./actions";

const prisma = new PrismaClient();

export default async function MembersPage() {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("userId")?.value;

  // Bezpečnostní kontrola: jakou má uživatel roli?
  const currentUser = currentUserId
    ? await prisma.user.findUnique({ where: { id: currentUserId } })
    : null;

  const userRole = currentUser?.role || "MEMBER";
  const isLeader = userRole === "ADMIN" || userRole === "LEADER";

  // Stáhneme všechny uživatele s družinou a obousměrnou vazbou na sourozence
  const allUsers = await prisma.user.findMany({
    include: {
      patrol: true,
      siblings: true,
      siblingOf: true,
    },
  });

  const patrols = await prisma.patrol.findMany();

  // Pro adminy a vedoucí stáhneme změny čekající na schválení (členům to nestahujeme)
  const pendingUpdates = isLeader
    ? await prisma.pendingUpdate.findMany({
        include: { user: true },
      })
    : [];

  const showApprovals = pendingUpdates.length > 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a237e]">Členové</h1>
        <p className="text-gray-500 mt-1">
          Seznam dětí, zdravotní údaje a vyhledávání.
        </p>
      </div>

      {/* --- NOTIFIKACE: ČEKÁ NA SCHVÁLENÍ (Ukáže se jen vedoucím) --- */}
      {showApprovals && (
        <div className="bg-orange-50 border-2 border-orange-300 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-extrabold text-orange-900 flex items-center gap-2 mb-4">
            <ShieldAlert className="w-6 h-6 text-orange-600" /> Čeká na vaše
            schválení ({pendingUpdates.length})
          </h2>
          <div className="space-y-3">
            {pendingUpdates.map((update) => {
              const parsedData = JSON.parse(update.data);
              return (
                <div
                  key={update.id}
                  className="bg-white p-4 rounded-xl border-2 border-orange-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      Úprava pro: {update.user.name}
                    </p>
                    <div className="text-sm text-gray-700 mt-2 space-y-1">
                      {parsedData.motherName !== undefined && (
                        <p>
                          Matka:{" "}
                          <span className="font-bold">
                            {parsedData.motherName} {parsedData.motherPhone}
                          </span>
                        </p>
                      )}
                      {parsedData.fatherName !== undefined && (
                        <p>
                          Otec:{" "}
                          <span className="font-bold">
                            {parsedData.fatherName} {parsedData.fatherPhone}
                          </span>
                        </p>
                      )}
                      {parsedData.parentPhone !== undefined && (
                        <p>
                          Hl. telefon:{" "}
                          <span className="font-bold">
                            {parsedData.parentPhone || "Smazáno"}
                          </span>
                        </p>
                      )}
                      {parsedData.healthNote !== undefined && (
                        <p>
                          Zdraví:{" "}
                          <span className="font-bold text-red-600">
                            {parsedData.healthNote || "Smazáno"}
                          </span>
                        </p>
                      )}
                      {parsedData.birthDate !== undefined && (
                        <p>
                          Narození:{" "}
                          <span className="font-bold">
                            {parsedData.birthDate
                              ? new Date(
                                  parsedData.birthDate,
                                ).toLocaleDateString("cs-CZ")
                              : "Smazáno"}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <form
                      action={approveUpdate.bind(null, update.id)}
                      className="flex-1 md:flex-none"
                    >
                      <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
                      >
                        Schválit
                      </button>
                    </form>
                    <form
                      action={rejectUpdate.bind(null, update.id)}
                      className="flex-1 md:flex-none"
                    >
                      <button
                        type="submit"
                        className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2.5 rounded-xl font-bold transition-colors"
                      >
                        Zamítnout
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Klientská komponenta s filtry */}
      <MembersClient
        users={allUsers}
        patrols={patrols}
        currentUserId={currentUserId}
        currentUserRole={userRole}
      />
    </div>
  );
}

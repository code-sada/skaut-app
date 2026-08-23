"use client";
import { useState } from "react";
import { Shield, Users, Clock, MapPin, Edit, X } from "lucide-react";

export default function PatrolsClient({
  patrols,
  canManage,
  updatePatrolInfo,
}: any) {
  const [editingPatrol, setEditingPatrol] = useState<any>(null);

  const handleUpdate = async (formData: FormData) => {
    await updatePatrolInfo(formData);
    setEditingPatrol(null);
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">
            Družiny a schůzky
          </h1>
          <p className="text-gray-500 mt-1">
            Rozdělení členů a pravidelné termíny schůzek.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {patrols.map((patrol: any) => (
          <div
            key={patrol.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-500" />
                {patrol.name}
              </h2>
              {canManage && (
                <button
                  onClick={() => setEditingPatrol(patrol)}
                  aria-label={`Upravit schůzky ${patrol.name}`}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Upravit schůzky"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Informace o pravidelné schůzce */}
            {(patrol.schedule || patrol.location) && (
              <div className="bg-blue-50/50 p-3 flex flex-col gap-1.5 border-b border-blue-100 text-sm">
                {patrol.schedule && (
                  <div className="flex items-center gap-2 text-[#1a237e] font-medium">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>
                      Pravidelně: <strong>{patrol.schedule}</strong>
                    </span>
                  </div>
                )}
                {patrol.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Místo: {patrol.location}</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 flex-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                <span>Členové družiny</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {patrol.users.length}
                </span>
              </div>

              {patrol.users.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                  Zatím bez členů.
                </p>
              ) : (
                <ul className="space-y-2">
                  {patrol.users.map((user: any) => (
                    <li
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1a237e] text-xs font-bold flex items-center justify-center shrink-0">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PRO ÚPRAVU SCHŮZEK */}
      {editingPatrol && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setEditingPatrol(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-[#1a237e]">
                Nastavení schůzek: {editingPatrol.name}
              </h2>
              <button
                onClick={() => setEditingPatrol(null)}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={handleUpdate} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingPatrol.id} />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Kdy mají pravidelnou schůzku?
                </label>
                <input
                  type="text"
                  name="schedule"
                  defaultValue={editingPatrol.schedule || ""}
                  placeholder="Např. Středa 16:30 - 18:00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-[#1a237e] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Kde schůzka probíhá?
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingPatrol.location || ""}
                  placeholder="Např. Hlavní klubovna"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-[#1a237e] focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a237e] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors"
              >
                Uložit nastavení
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

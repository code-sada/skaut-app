"use client";
import { useState } from "react";
import React from "react";
import { Plus, X } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";

export default function MeetingsClient({
  meetings,
  currentUser,
  canManage,
  patrols,
  saveMeetingAttendance,
  sendMeetingMessage,
  deleteMeetingAction,
  updateMeetingAction,
  generateMeetingsAction,
}: any) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  React.useEffect(() => {
    if (isAddModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isAddModalOpen]);

  const handleGenerateMeetings = async (formData: FormData) => {
    await generateMeetingsAction(formData);
    setIsAddModalOpen(false);
  };

  const inputClassName =
    "w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Schůzky</h1>
          <p className="text-gray-500 mt-1">
            {canManage
              ? "Přehled všech družinovek"
              : `Schůzky družiny ${currentUser?.patrol?.name || ""}`}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" /> Přidat schůzky
          </button>
        )}
      </div>

      <div className="space-y-4">
        {meetings.length === 0 ? (
          <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border-dashed border border-gray-200">
            Zatím nejsou v plánu žádné schůzky.
          </p>
        ) : (
          meetings.map((meeting: any) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              currentUser={currentUser}
              canManage={canManage}
              patrols={patrols}
              saveAttendance={saveMeetingAttendance}
              sendMessage={sendMeetingMessage}
              deleteMeetingAction={deleteMeetingAction}
              updateMeetingAction={updateMeetingAction}
            />
          ))
        )}
      </div>

      {/* MODAL PRO PŘIDÁNÍ SCHŮZEK */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hlavička */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-[#1a237e]">
                Generovat schůzky
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulář */}
            <div className="p-6 overflow-y-auto flex-1 pb-8">
              <form action={handleGenerateMeetings} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Název schůzek
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Např. Schůzka Vlků"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Družina
                  </label>
                  <select name="patrolId" required className={inputClassName}>
                    <option value="">Vyberte družinu...</option>
                    {patrols.map((patrol: any) => (
                      <option key={patrol.id} value={patrol.id}>
                        {patrol.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Začátek (Datum)
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Konec (Datum)
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Čas začátku
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      required
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Čas konce
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      required
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Vynechat data (oddělit čárkou, např. 24.10.2024, 31.10.2024)
                  </label>
                  <textarea
                    name="excludeDates"
                    placeholder="24.10.2024, 31.10.2024"
                    className={`${inputClassName} h-20 resize-none`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#00c853] hover:bg-[#00b34a] text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Generovat
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

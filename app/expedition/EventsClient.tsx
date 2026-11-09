"use client";
import { useState } from "react";
import React from "react";
import { Plus, Tent, X } from "lucide-react";
import EventCard from "@/components/EventCard";
import FloatingField from "@/app/components/FloatingField";
import { createEvent } from "@/app/actions";
import EditEventModal from "./EditEventModal";

export default function EventsClient({
  events,
  canManage,
  currentUser,
  deleteEventAction,
  saveAttendanceAction,
}: any) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [eventBeingEdited, setEventBeingEdited] = useState<any>(null);

  const handleCreate = async (formData: FormData) => {
    await createEvent(formData);
    setIsAddModalOpen(false);
  };

  React.useEffect(() => {
    if (isAddModalOpen || eventBeingEdited) {
      document.body.classList.add("modal-open");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (eventBeingEdited) setEventBeingEdited(null);
          else if (isAddModalOpen) setIsAddModalOpen(false);
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
  }, [isAddModalOpen, eventBeingEdited]);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">
            Nástěnka akcí
          </h1>
          <p className="text-gray-500 mt-1">
            Co nás v nejbližší době čeká a nemine.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" /> Přidat akci
          </button>
        )}
      </div>

      <div className="space-y-4">
        {events.map((event: any) => (
          <EventCard
            key={event.id}
            event={event}
            deleteEventAction={deleteEventAction}
            canManage={canManage}
            currentUser={currentUser}
            saveAttendanceAction={saveAttendanceAction}
            onEdit={() => setEventBeingEdited(event)}
          />
        ))}

        {events.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Tent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Zatím nejsou naplánované žádné akce.
            </p>
          </div>
        )}
      </div>

      {/* MODAL PRO PŘIDÁNÍ VÝPRAVY */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-2 border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b-2 border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-10">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Vytvořit novou akci
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleCreate} className="p-8 space-y-8 pb-16">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Základní info
                </h2>
                <FloatingField
                  id="title"
                  name="title"
                  label="Název akce"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                />
                <FloatingField
                  id="description"
                  name="description"
                  as="textarea"
                  label="Popis"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                />
                <FloatingField
                  id="location"
                  name="location"
                  label="Místo"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Časy a srazy
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <FloatingField
                    id="date"
                    label="Datum (Začátek)"
                    type="date"
                    name="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                  <FloatingField
                    id="dateEnd"
                    label="Konec (Volitelné)"
                    type="date"
                    name="dateEnd"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FloatingField
                    id="meetingPoint"
                    name="meetingPoint"
                    label="Sraz (Kde a v kolik)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                  <FloatingField
                    id="returnPoint"
                    name="returnPoint"
                    label="Návrat (Kde a v kolik)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Logistika a Účast
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <FloatingField
                    id="targetPatrol"
                    name="targetPatrol"
                    label="Pro koho"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                  <FloatingField
                    id="accommodation"
                    name="accommodation"
                    label="Ubytování"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                  <FloatingField
                    id="food"
                    name="food"
                    label="Strava"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
                <FloatingField
                  id="equipment"
                  name="equipment"
                  label="Co s sebou (Vybavení)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Finance a Termíny
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <FloatingField
                    id="leaderInCharge"
                    name="leaderInCharge"
                    label="Zodpovědný vedoucí"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                  <FloatingField
                    id="leaderContact"
                    name="leaderContact"
                    label="Kontakt na vedoucího"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full bg-[#00c853] hover:bg-[#00b34a] text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-sm"
                >
                  Vytvořit akci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventBeingEdited && (
        <EditEventModal
          event={eventBeingEdited}
          onClose={() => setEventBeingEdited(null)}
        />
      )}
    </>
  );
}

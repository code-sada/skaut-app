"use client";
import { useState } from "react";
import React from "react";
import { Plus, Tent, X } from "lucide-react";
import EventCard from "@/components/EventCard";
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Název akce
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Popis
                  </label>
                  <textarea
                    name="description"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  ></textarea>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Místo
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Časy a srazy
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Datum (Začátek)
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Konec (Volitelné)
                    </label>
                    <input
                      type="date"
                      name="dateEnd"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Sraz (Kde a v kolik)
                    </label>
                    <input
                      type="text"
                      name="meetingPoint"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Návrat (Kde a v kolik)
                    </label>
                    <input
                      type="text"
                      name="returnPoint"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Logistika a Účast
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Pro koho
                    </label>
                    <input
                      type="text"
                      name="targetPatrol"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Kapacita (Počet lidí)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Ubytování
                    </label>
                    <input
                      type="text"
                      name="accommodation"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Strava
                    </label>
                    <input
                      type="text"
                      name="food"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Co s sebou (Vybavení)
                  </label>
                  <input
                    type="text"
                    name="equipment"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Finance a Termíny
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Cena (Děti)
                    </label>
                    <input
                      type="number"
                      name="priceChildren"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Cena (Starší)
                    </label>
                    <input
                      type="number"
                      name="priceOlder"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Způsob platby
                    </label>
                    <input
                      type="text"
                      name="paymentMethod"
                      list="payment-options"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                      placeholder="Napiš nebo vyber..."
                    />
                    <datalist id="payment-options">
                      <option value="Hotově na srazu" />
                      <option value="Na účet střediska" />
                      <option value="Na účet oddílu" />
                      <option value="Přes QR kód" />
                    </datalist>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Zaplatit do
                    </label>
                    <input
                      type="date"
                      name="paymentDeadline"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Přihlášky do (RSVP)
                  </label>
                  <input
                    type="date"
                    name="rsvpDeadline"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
                  Kontakty
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Zodpovědný vedoucí
                    </label>
                    <input
                      type="text"
                      name="leaderInCharge"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Kontakt na vedoucího
                    </label>
                    <input
                      type="text"
                      name="leaderContact"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none"
                    />
                  </div>
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

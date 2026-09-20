"use client";

import React from "react";
import { X } from "lucide-react";
import FloatingField from '@/app/components/FloatingField'
import { updateEvent } from "@/app/actions";

type EditableEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  dateEnd: Date | null;
  meetingPoint: string | null;
  returnPoint: string | null;
  targetPatrol: string;
  capacity: number | null;
  accommodation: string | null;
  food: string | null;
  equipment: string | null;
  priceChildren: number;
  priceOlder: number;
  paymentMethod: string | null;
  paymentDeadline: Date | null;
  rsvpDeadline: Date | null;
  leaderInCharge: string | null;
  leaderContact: string | null;
};

export default function EditEventModal({
  event,
  onClose,
}: {
  event: EditableEvent;
  onClose: () => void;
}) {
  React.useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const formatDate = (date: Date | string | null | undefined) =>
    date ? new Date(date).toISOString().split("T")[0] : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-2 border-gray-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6 border-b-2 border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-10">
          <h2 className="text-2xl font-extrabold text-gray-900">Úprava akce</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít úpravu akce"
            className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={updateEvent} className="p-8 space-y-8 pb-16">
          <input type="hidden" name="id" value={event.id} />

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
              Základní info
            </h2>
            <FloatingField id="title" name="title" label="Název akce" defaultValue={event.title} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            <FloatingField id="description" name="description" as="textarea" label="Popis" defaultValue={event.description} required className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            <FloatingField id="location" name="location" label="Místo" defaultValue={event.location} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
              Časy a srazy
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField id="date" label="Datum (Začátek)" type="date"
                  name="date"
                  defaultValue={formatDate(event.date)}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
              <FloatingField id="dateEnd" label="Konec (Volitelné)" type="date"
                  name="dateEnd"
                  defaultValue={formatDate(event.dateEnd)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField id="meetingPoint" name="meetingPoint" label="Sraz (Kde a v kolik)" defaultValue={event.meetingPoint || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
              <FloatingField id="returnPoint" name="returnPoint" label="Návrat (Kde a v kolik)" defaultValue={event.returnPoint || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
              Logistika a Účast
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField id="targetPatrol" name="targetPatrol" label="Pro koho" defaultValue={event.targetPatrol} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
              <FloatingField id="capacity" label="Kapacita (Počet lidí)" type="number"
                  name="capacity"
                  defaultValue={event.capacity || ""}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField id="accommodation" name="accommodation" label="Ubytování" defaultValue={event.accommodation || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
              <FloatingField id="food" name="food" label="Strava" defaultValue={event.food || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
            <FloatingField id="equipment" name="equipment" label="Co s sebou (Vybavení)" defaultValue={event.equipment || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
              Finance a Termíny
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField id="priceChildren" label="Cena (Děti)" type="number"
                  name="priceChildren"
                  defaultValue={event.priceChildren}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
              <FloatingField id="priceOlder" label="Cena (Starší)" type="number"
                  name="priceOlder"
                  defaultValue={event.priceOlder}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <FloatingField id="paymentMethod" name="paymentMethod" label="Způsob platby" defaultValue={event.paymentMethod || ""} list="payment-options-edit" placeholder="Napiš nebo vyber..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
                <datalist id="payment-options-edit">
                  <option value="Hotově na srazu" />
                  <option value="Na účet střediska" />
                  <option value="Na účet oddílu" />
                  <option value="Přes QR kód" />
                </datalist>
              </div>
              <FloatingField id="paymentDeadline" label="Zaplatit do" type="date"
                  name="paymentDeadline"
                  defaultValue={formatDate(event.paymentDeadline)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
            <FloatingField id="rsvpDeadline" label="Přihlášky do (RSVP)" type="date"
                name="rsvpDeadline"
                defaultValue={formatDate(event.rsvpDeadline)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">
              Kontakty
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField id="leaderInCharge" name="leaderInCharge" label="Zodpovědný vedoucí" defaultValue={event.leaderInCharge || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
              <FloatingField id="leaderContact" name="leaderContact" label="Kontakt na vedoucího" defaultValue={event.leaderContact || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
          </div>

          <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-colors text-center text-sm shadow-sm"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#00c853] hover:bg-[#00b34a] text-white font-bold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
            >
              Uložit změny
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

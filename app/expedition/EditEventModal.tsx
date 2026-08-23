"use client";

import { X } from "lucide-react";
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

        <form action={updateEvent} className="p-8 space-y-8">
          <input type="hidden" name="id" value={event.id} />

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Základní info</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Název akce</label>
              <input type="text" name="title" defaultValue={event.title} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Popis</label>
              <textarea name="description" defaultValue={event.description} required className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Místo</label>
              <input type="text" name="location" defaultValue={event.location} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Časy a srazy</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Datum (Začátek)</label><input type="date" name="date" defaultValue={formatDate(event.date)} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Konec (Volitelné)</label><input type="date" name="dateEnd" defaultValue={formatDate(event.dateEnd)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Sraz (Kde a v kolik)</label><input type="text" name="meetingPoint" defaultValue={event.meetingPoint || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Návrat (Kde a v kolik)</label><input type="text" name="returnPoint" defaultValue={event.returnPoint || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Logistika a Účast</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Pro koho</label><input type="text" name="targetPatrol" defaultValue={event.targetPatrol} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Kapacita (Počet lidí)</label><input type="number" name="capacity" defaultValue={event.capacity || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Ubytování</label><input type="text" name="accommodation" defaultValue={event.accommodation || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Strava</label><input type="text" name="food" defaultValue={event.food || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Co s sebou (Vybavení)</label><input type="text" name="equipment" defaultValue={event.equipment || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Finance a Termíny</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Cena (Děti)</label><input type="number" name="priceChildren" defaultValue={event.priceChildren} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Cena (Starší)</label><input type="number" name="priceOlder" defaultValue={event.priceOlder} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Způsob platby</label><input type="text" name="paymentMethod" defaultValue={event.paymentMethod || ""} list="payment-options-edit" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" placeholder="Napiš nebo vyber..." /><datalist id="payment-options-edit"><option value="Hotově na srazu" /><option value="Na účet střediska" /><option value="Na účet oddílu" /><option value="Přes QR kód" /></datalist></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Zaplatit do</label><input type="date" name="paymentDeadline" defaultValue={formatDate(event.paymentDeadline)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Přihlášky do (RSVP)</label><input type="date" name="rsvpDeadline" defaultValue={formatDate(event.rsvpDeadline)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Kontakty</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Zodpovědný vedoucí</label><input type="text" name="leaderInCharge" defaultValue={event.leaderInCharge || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-gray-700">Kontakt na vedoucího</label><input type="text" name="leaderContact" defaultValue={event.leaderContact || ""} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-[#00c853] outline-none" /></div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-colors text-center text-sm shadow-sm">Zrušit</button>
            <button type="submit" className="flex-1 bg-[#00c853] hover:bg-[#00b34a] text-white font-bold py-2.5 rounded-lg transition-colors text-sm shadow-sm">Uložit změny</button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import FloatingField from "@/app/components/FloatingField";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function AddMeetingForm({
  patrols,
  generateAction,
}: {
  patrols: any[];
  generateAction: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const inputClassName =
    "w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0"
      >
        <Plus className="w-5 h-5" /> Přidat schůzky
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Generovat schůzky"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-[#1a237e]">
                Generovat schůzky
              </h2>
              <button
                type="button"
                aria-label="Zavřít"
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                action={(formData) => {
                  generateAction(formData);
                  setIsOpen(false);
                }}
                className="space-y-4"
              >
                <FloatingField
                  id="add-meeting-title"
                  label="Název schůzek"
                  type="text"
                  name="title"
                  required
                  placeholder="Např. Schůzka Vlků"
                  className={inputClassName}
                />

                <FloatingField
                  id="add-meeting-patrolId"
                  as="select"
                  label="Družina"
                  name="patrolId"
                  required
                  className={inputClassName}
                >
                  <option value="">Vyberte družinu...</option>
                  {patrols.map((patrol) => (
                    <option key={patrol.id} value={patrol.id}>
                      {patrol.name}
                    </option>
                  ))}
                </FloatingField>

                <div className="grid grid-cols-2 gap-4">
                  <FloatingField
                    id="add-meeting-startDate"
                    label="Datum první schůzky"
                    type="date"
                    name="startDate"
                    required
                    className={inputClassName}
                  />
                  <FloatingField
                    id="add-meeting-endDate"
                    label="Datum poslední"
                    type="date"
                    name="endDate"
                    required
                    className={inputClassName}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FloatingField
                    id="add-meeting-startTime"
                    label="Začátek"
                    type="time"
                    name="startTime"
                    required
                    className={inputClassName}
                  />
                  <FloatingField
                    id="add-meeting-endTime"
                    label="Konec"
                    type="time"
                    name="endTime"
                    required
                    className={inputClassName}
                  />
                </div>

                <FloatingField
                  id="add-meeting-excludeDates"
                  label="Vynechat data (např. 28.10.2024, 25.12.2024)"
                  type="text"
                  name="excludeDates"
                  placeholder="28.10.2024, 25.12.2024"
                  className={inputClassName}
                />

                <button
                  type="submit"
                  className="w-full mt-6 bg-[#1a237e] hover:bg-blue-900 text-white p-3 rounded-xl font-bold transition-colors"
                >
                  Vygenerovat sérii schůzek
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

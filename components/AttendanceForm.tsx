"use client";

import { saveAttendance } from "@/app/actions";
import { useState } from "react";

export default function AttendanceForm({
  eventId,
  currentStatus,
  currentNote,
}: {
  eventId: string;
  currentStatus?: string;
  currentNote?: string;
}) {
  const [status, setStatus] = useState(currentStatus || "PENDING");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="text-sm font-bold mb-3 text-[#1a237e]">Moje účast</h3>

      <form
        action={async (formData) => {
          setIsSaving(true);
          await saveAttendance(formData);
          setIsSaving(false);
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="eventId" value={eventId} />

        <div className="flex gap-2">
          {/* ANO */}
          <label
            className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 cursor-pointer transition-all ${status === "ANO" ? "border-[#00c853] bg-green-50" : "border-gray-200 hover:border-green-300 bg-white"}`}
          >
            <input
              type="radio"
              name="status"
              value="ANO"
              className="hidden"
              checked={status === "ANO"}
              onChange={() => setStatus("ANO")}
            />
            <span className="text-xl">✅</span>
            <span className="text-xs font-bold text-green-700">Jedu</span>
          </label>

          {/* NE */}
          <label
            className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 cursor-pointer transition-all ${status === "NE" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300 bg-white"}`}
          >
            <input
              type="radio"
              name="status"
              value="NE"
              className="hidden"
              checked={status === "NE"}
              onChange={() => setStatus("NE")}
            />
            <span className="text-xl">❌</span>
            <span className="text-xs font-bold text-red-700">Nejedu</span>
          </label>

          {/* MOŽNÁ */}
          <label
            className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 cursor-pointer transition-all ${status === "MOZNA" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-yellow-300 bg-white"}`}
          >
            <input
              type="radio"
              name="status"
              value="MOZNA"
              className="hidden"
              checked={status === "MOZNA"}
              onChange={() => setStatus("MOZNA")}
            />
            <span className="text-xl">🤔</span>
            <span className="text-xs font-bold text-yellow-700">Možná</span>
          </label>
        </div>

        <textarea
          name="note"
          defaultValue={currentNote || ""}
          placeholder="Poznámka (např. přijdu později...)"
          className="border border-gray-200 rounded-lg p-2 text-sm w-full focus:ring-2 focus:ring-[#00c853] outline-none resize-none"
          rows={1}
        />

        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#1a237e] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Ukládám..." : "Uložit odpověď"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { exportOwnData, deleteOwnAccount } from "@/app/actions";

export default function ProfileGdprSection({ isAdmin }: { isAdmin: boolean }) {
  const [isExporting, setIsExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const data = await exportOwnData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skautapp-moje-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Nepodařilo se připravit export dat.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    const res = await deleteOwnAccount();
    if (res && !res.success) {
      setError(res.error || "Účet se nepodařilo smazat.");
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
      <h2 className="text-base font-extrabold text-gray-900">
        Správa osobních údajů a soukromí (GDPR)
      </h2>
      <p className="text-xs text-gray-500">
        Máte plnou kontrolu nad svými údaji. Můžete si stáhnout kompletní kopii
        svých dat nebo svůj účet okamžitě zrušit.
      </p>

      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Připravuji export..." : "Stáhnout moje data (JSON)"}
        </button>

        {!isAdmin && !confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Okamžitě zrušit účet a smazat data
          </button>
        )}
      </div>

      {confirmDelete && (
        <div
          role="alertdialog"
          aria-label="Potvrzení smazání účtu"
          className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl space-y-3"
        >
          <div className="flex items-start gap-2 text-red-800 text-xs font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <p>
              Opravdu chcete trvale zrušit svůj účet a smazat všechna svá data z
              informačního systému? Tuto akci nelze vrátit zpět.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
            >
              Ponechat účet
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
            >
              Ano, trvale smazat účet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

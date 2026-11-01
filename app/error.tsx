"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SKAUTAPP Runtime Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div
        role="alert"
        className="max-w-md w-full bg-white rounded-3xl border-2 border-red-100 shadow-lg p-8 text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Něco se pokazilo
          </h1>
          <p className="text-sm text-gray-600">
            {error?.message ||
              "Při zpracování požadavku došlo k neočekávané chybě. Vaše data jsou v bezpečí."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a237e] hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Zkusit znovu
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl text-sm transition-colors"
          >
            <Home className="w-4 h-4" /> Přehled
          </Link>
        </div>
      </div>
    </div>
  );
}

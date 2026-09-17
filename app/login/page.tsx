"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginUser } from "../actions";

// Oddělená komponenta pro tlačítko, aby šlo využít useFormStatus pro načítání
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2.5 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 flex justify-center items-center"
    >
      {pending ? "Ověřování..." : "Přihlásit se"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginUser, { error: null });

  // Funkce, která zachytí stisk klávesy Enter a odešle formulář
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Zabrání probliknutí
      e.currentTarget.form?.requestSubmit(); // Vynutí klasické odeslání
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="text-center">
          <span className="text-3xl">⚜️</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Přihlášení do IS
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Zadejte své skautské přihlašovací údaje.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Vykreslení chybové hlášky, pokud nějaká přišla z backendu */}
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-200 text-center animate-in fade-in">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Přihlašovací e-mail nebo jméno
            </label>
            <input
              type="text"
              id="email"
              name="email"
              onKeyDown={handleKeyDown}
              placeholder="Např. admin, nebo email..."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700"
            >
              Heslo
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

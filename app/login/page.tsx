"use client";
import FloatingField from "@/app/components/FloatingField";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginUser } from "../actions";

const STORAGE_KEY = "skautapp_cookie_notice_v1";
const CONSENT_COOKIE = "skautapp_cookie_consent";

function checkClientConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted" || saved === "essential_only") return true;
  } catch {
    // ignore
  }
  return document.cookie
    .split("; ")
    .some((row) => row.startsWith(`${CONSENT_COOKIE}=`));
}

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
  const [hasCookieConsent, setHasCookieConsent] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    const syncConsent = () => {
      const consented = checkClientConsent();
      setHasCookieConsent(consented);
      if (consented) {
        setClientError(null);
      }
    };
    syncConsent();
    window.addEventListener("skautapp-cookie-consent", syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener("skautapp-cookie-consent", syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!checkClientConsent()) {
      e.preventDefault();
      setHasCookieConsent(false);
      setClientError(
        "Pro přihlášení musíte nejprve potvrdit souhlas s ukládáním nezbytných přihlašovacích cookies v liště dole.",
      );
      return;
    }
    setClientError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const displayedError = clientError || state?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="text-center">
          <span className="text-3xl" aria-hidden="true">
            ⚜️
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Přihlášení do IS
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Zadejte své skautské přihlašovací údaje.
          </p>
        </div>

        <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
          <input
            type="hidden"
            name="cookieConsent"
            value={hasCookieConsent ? "1" : "0"}
          />
          {displayedError && (
            <div
              role="alert"
              className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-200 text-center animate-in fade-in"
            >
              {displayedError}
            </div>
          )}
          {!hasCookieConsent && !displayedError && (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 text-center">
              Pro přihlášení je nutné nejprve odsouhlasit nezbytné technické
              cookies v liště dole.
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <FloatingField
              label="Přihlašovací e-mail nebo jméno"
              type="text"
              id="email"
              name="email"
              onKeyDown={handleKeyDown}
              required
              aria-label="Přihlašovací e-mail nebo jméno"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FloatingField
              label="Heslo"
              type="password"
              id="password"
              name="password"
              onKeyDown={handleKeyDown}
              required
              aria-label="Heslo"
            />
          </div>

          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            Přihlášením souhlasíte s{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:underline font-semibold"
            >
              Podmínkami používání
            </Link>{" "}
            a berete na vědomí{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:underline font-semibold"
            >
              Zásady ochrany osobních údajů (GDPR)
            </Link>
            .
          </p>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

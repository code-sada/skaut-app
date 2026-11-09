"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const STORAGE_KEY = "skautapp_cookie_notice_v1";
const CONSENT_COOKIE = "skautapp_cookie_consent";

function setConsentCookie(value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const hasCookie = document.cookie
        .split("; ")
        .some((row) => row.startsWith(`${CONSENT_COOKIE}=`));

      if (saved === "accepted" || saved === "essential_only") {
        if (!hasCookie) {
          setConsentCookie(saved);
        }
        window.dispatchEvent(new Event("skautapp-cookie-consent"));
      } else if (!hasCookie) {
        setVisible(true);
      }
    } catch {
      // Pokud je localStorage nedostupný, lištu nezobrazujeme
    }
  }, []);

  const handleDecision = (choice: "essential_only" | "accepted") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    setConsentCookie(choice);
    window.dispatchEvent(new Event("skautapp-cookie-consent"));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Informace o soukromí a cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-4 z-40 animate-in fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 text-[#1a237e] rounded-xl shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs text-gray-600 leading-relaxed">
          <p className="font-bold text-gray-900 text-sm mb-1">
            Soukromí a technické cookies
          </p>
          <p>
            Používáme pouze nezbytné zabezpečené (<code>httpOnly</code>) cookies
            pro přihlášení. Žádné reklamní ani sledovací skripty bez souhlasu
            nespouštíme. Více v{" "}
            <Link href="/privacy" className="text-blue-600 font-bold underline">
              GDPR zásadách
            </Link>{" "}
            a{" "}
            <Link href="/terms" className="text-blue-600 font-bold underline">
              podmínkách
            </Link>
            .
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => handleDecision("essential_only")}
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
            >
              Pouze nezbytné
            </button>
            <button
              type="button"
              onClick={() => handleDecision("accepted")}
              className="flex-1 py-2 px-3 bg-[#1a237e] hover:bg-blue-900 text-white font-bold rounded-xl transition-colors"
            >
              Rozumím
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

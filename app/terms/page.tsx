import Link from "next/link";
import { FileCheck, ArrowLeft, Users, ShieldAlert, Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-[#00c853] rounded-2xl">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a237e]">
                Podmínky používání systému
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Pravidla užívání oddílového informačního systému SKAUTAPP
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Zpět
          </Link>
        </div>

        <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> 1. Účel systému a účty nezletilých členů
            </h2>
            <p>
              Informační systém SKAUTAPP slouží výhradně pro interní komunikaci
              a organizaci skautského oddílu. Účty pro děti a mladší členy jsou
              zakládány pouze vedoucími oddílu na základě písemné přihlášky a
              ověřeného souhlasu zákonného zástupce (rodiče).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> 2. Pravidla obsahu a autorská práva
            </h2>
            <p>
              Uživatelé a vedoucí se zavazují vkládat do chatu schůzek a sekce
              dokumentů pouze slušný, bezpečný a autorsky oprávněný obsah. V
              případě nahlášení nevhodného odkazu nebo porušení autorských práv
              administrátor obsah neprodleně odstraní.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-600" /> 3. Zrušení účtu a ukončení členství
            </h2>
            <p>
              Uživatelský účet lze kdykoliv bezplatně a okamžitě zrušit přímo v
              nastavení profilu (sekce{" "}
              <Link href="/profile" className="text-blue-600 font-bold underline">
                Můj profil
              </Link>
              ) bez nutnosti kontaktovat podporu e-mailem.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

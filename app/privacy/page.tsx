import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Eye, Trash2, Cookie } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#1a237e] rounded-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a237e]">
                Zásady ochrany osobních údajů (GDPR)
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Platné pro informační systém skautského oddílu (SKAUTAPP)
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
              <Lock className="w-5 h-5 text-blue-600" /> 1. Jaké údaje zpracováváme a proč
            </h2>
            <p>
              V rámci chodu skautského oddílu zpracováváme pouze údaje nezbytné
              pro organizaci schůzek, výprav a zajištění bezpečnosti dětí:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                <strong>Identifikační a kontaktní údaje:</strong> jméno,
                přezdívka, e-mail, adresa bydliště a telefonní kontakty na
                zákonné zástupce.
              </li>
              <li>
                <strong>Zdravotní a stravovací omezení:</strong> alergie, užívané
                léky a diety – výhradně za účelem ochrany zdraví dítěte na
                výpravách a táborech.
              </li>
              <li>
                <strong>Evidence účasti:</strong> přihlášky a omluvenky na
                schůzky a výpravy oddílu.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" /> 2. Kdo má k údajům přístup (Row-Level Security)
            </h2>
            <p>
              Přístup k citlivým osobním a zdravotním údajům je přísně omezen
              na úrovni databáze i serveru pouze na oprávněné vedoucí oddílu a
              administrátory. Běžní členové vidí pouze akce a schůzky své
              družiny a své vlastní údaje. Hesla jsou ukládána v kryptograficky
              hashované podobě a relace jsou podepsány pomocí HMAC-SHA256.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-amber-600" /> 3. Cookies a sledovací technologie
            </h2>
            <p>
              Tento informační systém <strong>nepoužívá žádné reklamní,
              marketingové ani sledovací cookies třetích stran</strong>.
              Používáme výhradně nezbytné technické cookies (<code>httpOnly</code>)
              pro udržení bezpečného přihlášení uživatele.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" /> 4. Vaše práva (Export a okamžité smazání účtu)
            </h2>
            <p>
              V souladu s nařízením GDPR (čl. 15, 17 a 20) a evropskou
              legislativou o digitálních službách máte právo na:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                <strong>Přenositelnost a kopii dat:</strong> V sekci{" "}
                <Link href="/profile" className="text-blue-600 font-bold underline">
                  Můj profil
                </Link>{" "}
                si můžete jedním kliknutím stáhnout kompletní export všech svých
                údajů ve formátu JSON.
              </li>
              <li>
                <strong>Právo být zapomenut (okamžité zrušení účtu):</strong>{" "}
                Svůj účet i veškeré související záznamy můžete kdykoliv okamžitě
                a bez nutnosti psát e-mail smazat přímo v sekci{" "}
                <Link href="/profile" className="text-blue-600 font-bold underline">
                  Můj profil
                </Link>
                .
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

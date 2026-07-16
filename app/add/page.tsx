import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createEvent } from '../actions'

export default async function AddEventPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Přidat novou akci</h1>
        <p className="text-sm text-gray-500">Vyplňte detaily výpravy. Co nevíte, můžete nechat prázdné.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <form action={createEvent} className="flex flex-col gap-8">
          
          {/* 1. ZÁKLADNÍ INFORMACE */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Základní informace</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-semibold text-gray-700">Název akce *</label>
                <input type="text" id="title" name="title" placeholder="Např. Podzimní výprava" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="location" className="text-sm font-semibold text-gray-700">Hlavní místo konání *</label>
                <input type="text" id="location" name="location" placeholder="Např. Skautská základna Orlovy" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-semibold text-gray-700">Popis akce a motivace *</label>
                <textarea id="description" name="description" rows={3} placeholder="O co na akci půjde..." className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 resize-none focus:ring-2 focus:ring-[#00c853] outline-none" required />
              </div>
            </div>
          </section>

          {/* 2. ČASOVÝ HARMONOGRAM */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Časový harmonogram</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-sm font-semibold text-gray-700">Začátek akce *</label>
                <input type="datetime-local" id="date" name="date" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dateEnd" className="text-sm font-semibold text-gray-700">Konec akce</label>
                <input type="datetime-local" id="dateEnd" name="dateEnd" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="meetingPoint" className="text-sm font-semibold text-gray-700">Místo srazu</label>
                <input type="text" id="meetingPoint" name="meetingPoint" placeholder="Např. Hlavní nádraží v 15:30" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="returnPoint" className="text-sm font-semibold text-gray-700">Místo návratu</label>
                <input type="text" id="returnPoint" name="returnPoint" placeholder="Např. Autobusové nádraží v 16:45" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
            </div>
          </section>

          {/* 3. ÚČAST A TERMÍNY */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Účast a kapacita</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="targetPatrol" className="text-sm font-semibold text-gray-700">Pro koho to je</label>
                <select id="targetPatrol" name="targetPatrol" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none">
                  <option value="Všichni">Celý oddíl (Všichni)</option>
                  <option value="Vlčata">Vlčata</option>
                  <option value="Světlušky">Světlušky</option>
                  <option value="Skauti">Skauti</option>
                  <option value="Roveři">Roveři</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="capacity" className="text-sm font-semibold text-gray-700">Kapacita (max lidí)</label>
                <input type="number" id="capacity" name="capacity" placeholder="Neomezeno" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rsvpDeadline" className="text-sm font-semibold text-gray-700">Přihlášky do</label>
                <input type="date" id="rsvpDeadline" name="rsvpDeadline" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
            </div>
          </section>

          {/* 4. LOGISTIKA */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Logistika a vybavení</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="accommodation" className="text-sm font-semibold text-gray-700">Ubytování</label>
                <input type="text" id="accommodation" name="accommodation" placeholder="Např. Podsadové stany, chata..." className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="food" className="text-sm font-semibold text-gray-700">Strava</label>
                <input type="text" id="food" name="food" placeholder="Např. Zajištěna od sobotní snídaně" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="equipment" className="text-sm font-semibold text-gray-700">Speciální vybavení s sebou</label>
                <textarea id="equipment" name="equipment" rows={2} placeholder="Kroj, plavky, 200 Kč kapesné, uzlovačka..." className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 resize-none focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
            </div>
          </section>

          {/* 5. FINANCE */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Finance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="priceChildren" className="text-sm font-semibold text-gray-700">Cena účastníci *</label>
                <div className="relative">
                  <input type="number" id="priceChildren" name="priceChildren" defaultValue={0} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none" required />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">Kč</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="priceOlder" className="text-sm font-semibold text-gray-700">Cena vedoucí *</label>
                <div className="relative">
                  <input type="number" id="priceOlder" name="priceOlder" defaultValue={0} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none" required />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">Kč</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="paymentMethod" className="text-sm font-semibold text-gray-700">Způsob platby</label>
                <select id="paymentMethod" name="paymentMethod" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none">
                  <option value="Hotově na srazu">Hotově na srazu</option>
                  <option value="Na účet střediska">Na účet střediska</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="paymentDeadline" className="text-sm font-semibold text-gray-700">Termín platby</label>
                <input type="date" id="paymentDeadline" name="paymentDeadline" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
            </div>
          </section>

          {/* 6. KONTAKTY */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Kontakty na akci</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="leaderInCharge" className="text-sm font-semibold text-gray-700">Zodpovědný vedoucí</label>
                <input type="text" id="leaderInCharge" name="leaderInCharge" placeholder="Jméno / Přezdívka" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="leaderContact" className="text-sm font-semibold text-gray-700">Telefon na vedoucího</label>
                <input type="text" id="leaderContact" name="leaderContact" placeholder="777 123 456" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00c853] outline-none" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
            <button type="submit" className="px-8 py-3 bg-[#00c853] hover:bg-[#00b34a] text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
              Vytvořit a zveřejnit akci
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
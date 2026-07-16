import { createEvent } from '../actions'

export default async function AddEventPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Přidat novou akci</h1>
        <p className="text-sm text-gray-500">Vytvořte novou událost, zadejte termín od–do a ceny.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form action={createEvent} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-semibold text-gray-700">Název akce</label>
            <input 
              type="text"
              id="title"
              name="title" 
              placeholder="Např. Podzimní výprava" 
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-gray-700">Popis akce</label>
            <textarea 
              id="description"
              name="description" 
              rows={3}
              placeholder="Zabalte si spacák, teplé oblečení..." 
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="location" className="text-sm font-semibold text-gray-700">Místo konání</label>
            <input 
              type="text"
              id="location"
              name="location" 
              placeholder="Např. Skautská základna Orlovy" 
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Uložit akci
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
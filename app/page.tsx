import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Pencil, Trash2, MapPin, CalendarDays, Tent } from 'lucide-react'
import { deleteEvent } from './actions'

const prisma = new PrismaClient()

export default async function HomePage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* ČISTÝ NADPIS - Už žádná zbytečná tlačítka na odhlášení! */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Nástěnka akcí</h1>
          <p className="text-gray-500 mt-1">Co nás v nejbližší době čeká a nemine.</p>
        </div>
      </div>

      {/* VÝPIS AKCÍ */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 transition-all hover:shadow-md hover:border-gray-200">
            
            {/* Levé info o akci */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                  pro: {event.targetPatrol}
                </span>
              </div>
              
              <div className="text-sm font-medium text-gray-500 flex flex-wrap gap-x-6 gap-y-2">
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  {event.date ? event.date.toLocaleDateString('cs-CZ') : 'Neurčeno'}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.location}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
            </div>

            {/* Pravá strana - tlačítka a cena */}
            <div className="flex items-center gap-6 md:pl-6 md:border-l border-gray-100">
              <div className="flex gap-1.5">
                <Link href={`/edit/${event.id}`} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Pencil className="w-4 h-4" />
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <button type="submit" className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
              
              <div className="text-right min-w-[100px] bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tvoje cena</p>
                <p className="text-xl font-extrabold text-[#00c853]">{event.priceChildren} Kč</p>
              </div>
            </div>

          </div>
        ))}

        {/* Pokud není žádná akce */}
        {events.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Tent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Zatím nejsou naplánované žádné akce.</p>
          </div>
        )}
      </div>
    </div>
  )
}
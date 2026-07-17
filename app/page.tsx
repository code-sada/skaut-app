import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { MessageCircle, Tent, Compass, Shield, ArrowRight, Plus } from 'lucide-react'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  // Najdeme nejbližší budoucí akci pro zobrazení v dlaždici
  const nextEvent = await prisma.event.findFirst({
    where: { 
      date: { gte: new Date() } // Akce od dneška dál
    },
    orderBy: { date: 'asc' }
  })

  // Zde do budoucna můžeme vytáhnout i počet členů, nejbližší schůzku atd.
  // const membersCount = await prisma.user.count()

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Hlavička */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a237e]">Přehled</h1>
        <p className="text-gray-500 mt-1">Rychlý souhrn toho nejdůležitějšího z oddílu.</p>
      </div>

      {/* Grid s dlaždicemi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* DLAŽDICE 1: CHAT A ZPRÁVY */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" /> Chat
            </h2>
            <Link href="/chat" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
              Otevřít
            </Link>
          </div>
          
          <div className="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100 text-center mb-4 min-h-[120px]">
            <p className="text-sm text-gray-500 font-medium">Zatím tu nemáš žádné nové zprávy.</p>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-[#1a237e] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nová zpráva
          </button>
        </div>

        {/* DLAŽDICE 2: NEJBLIŽŠÍ VÝPRAVA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:shadow-md hover:border-green-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Tent className="w-5 h-5 text-[#00c853]" /> Výpravy a akce
            </h2>
          </div>
          
          <div className="flex-1">
            {nextEvent ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nejbližší akce</p>
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                  <h3 className="font-bold text-[#1a237e] mb-1">{nextEvent.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{nextEvent.date.toLocaleDateString('cs-CZ')} • {nextEvent.location}</p>
                  <span className="inline-block px-2.5 py-1 bg-white text-green-700 text-xs font-bold rounded-lg border border-green-200 shadow-sm">
                    {nextEvent.targetPatrol}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-center min-h-[120px]">
                <p className="text-sm text-gray-500 font-medium">Žádná blížící se akce.</p>
              </div>
            )}
          </div>

          <Link href="/vypravy" className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-gray-100 hover:border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors">
            Zobrazit všechny <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* DLAŽDICE 3: SCHŮZKY */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:shadow-md hover:border-orange-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-500" /> Schůzky
            </h2>
          </div>
          
          <div className="flex-1 space-y-3">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tento týden</p>
             <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-1">Družina Vlků</h3>
                <p className="text-sm text-gray-600">Pátek 16:00 - 18:00</p>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <span>📍</span> Klubovna
                </p>
             </div>
          </div>

          <Link href="/meetings" className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-gray-100 hover:border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors">
            Více informací <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
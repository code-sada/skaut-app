"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, MapPin, CalendarDays, Clock, Users, Info, X, Banknote, Tent } from 'lucide-react'

// Přidán parametr canManage typu boolean
export default function EventCard({ event, deleteEventAction, canManage }: { event: any, deleteEventAction: any, canManage?: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* KARTA AKCE NA NÁSTĚNCE */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 transition-all hover:shadow-md hover:border-blue-200 cursor-pointer group"
      >
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#1a237e] transition-colors">{event.title}</h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
              pro: {event.targetPatrol}
            </span>
          </div>
          
          <div className="text-sm font-medium text-gray-500 flex flex-wrap gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              {event.date ? new Date(event.date).toLocaleDateString('cs-CZ') : 'Neurčeno'}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {event.location}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{event.description}</p>
        </div>

        {/* Tlačítka s ochranou proti šíření kliknutí */}
        <div className="flex items-center gap-6 md:pl-6 md:border-l border-gray-100" onClick={(e) => e.stopPropagation()}>
          
          {/* Akční tlačítka uvidí POUZE admin nebo vedoucí */}
          {canManage && (
            <div className="flex gap-1.5">
              <Link href={`/edit/${event.id}`} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Upravit akci">
                <Pencil className="w-4 h-4" />
              </Link>
              <form action={deleteEventAction}>
                <input type="hidden" name="id" value={event.id} />
                <button type="submit" className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Smazat akci">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
          
          <div className="text-right min-w-[100px] bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tvoje cena</p>
            <p className="text-xl font-extrabold text-[#00c853]">{event.priceChildren} Kč</p>
          </div>
        </div>
      </div>

      {/* VYSKAKOVACÍ MODÁLNÍ OKNO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            {/* Hlavička */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-extrabold text-[#1a237e]">{event.title}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    {event.targetPatrol}
                  </span>
                </div>
                <p className="text-gray-600 font-medium text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> {event.location}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Obsah - Skrolovatelný */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> Popis akce</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-blue-50/50 p-4 rounded-xl">{event.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#00c853]" /> Kdy a kde</h3>
                  <div className="space-y-2.5 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">
                    <p><strong>Začátek:</strong> {event.date ? new Date(event.date).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' }) : '-'}</p>
                    {event.dateEnd && <p><strong>Konec:</strong> {new Date(event.dateEnd).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' })}</p>}
                    <div className="h-px bg-gray-200 my-2"></div>
                    {event.meetingPoint && <p><strong>Sraz:</strong> {event.meetingPoint}</p>}
                    {event.returnPoint && <p><strong>Návrat:</strong> {event.returnPoint}</p>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Tent className="w-4 h-4 text-orange-500" /> Logistika</h3>
                  <div className="space-y-2.5 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl h-full">
                    <p><strong>Ubytování:</strong> {event.accommodation || 'Nespecifikováno'}</p>
                    <p><strong>Strava:</strong> {event.food || 'Nespecifikováno'}</p>
                    {event.equipment && (
                      <>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <p><strong>S sebou:</strong> {event.equipment}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Banknote className="w-4 h-4 text-purple-500" /> Finance</h3>
                  <div className="space-y-2.5 text-sm text-gray-700">
                    <p><strong>Cena (účastníci):</strong> {event.priceChildren} Kč</p>
                    <p><strong>Cena (vedoucí):</strong> {event.priceOlder} Kč</p>
                    {event.paymentMethod && <p><strong>Způsob platby:</strong> {event.paymentMethod}</p>}
                    {event.paymentDeadline && <p><strong>Zaplatit do:</strong> <span className="text-red-600 font-bold">{event.paymentDeadline ? new Date(event.paymentDeadline).toLocaleDateString('cs-CZ') : '-'}</span></p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-pink-500" /> Účast a kontakty</h3>
                  <div className="space-y-2.5 text-sm text-gray-700">
                    <p><strong>Kapacita:</strong> {event.capacity ? `${event.capacity} osob` : 'Neomezeno'}</p>
                    {event.rsvpDeadline && <p><strong>Přihlášky do:</strong> <span className="text-red-600 font-bold">{event.rsvpDeadline ? new Date(event.rsvpDeadline).toLocaleDateString('cs-CZ') : '-'}</span></p>}
                    <div className="h-px bg-gray-100 my-2"></div>
                    <p><strong>Vedoucí:</strong> {event.leaderInCharge || 'Nespecifikováno'}</p>
                    {event.leaderContact && <p><strong>Kontakt:</strong> <a href={`tel:${event.leaderContact}`} className="text-blue-600 font-medium hover:underline">{event.leaderContact}</a></p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Patička */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-sm font-bold rounded-lg transition-colors shadow-sm">
                Zavřít detaily
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Tent, Plus } from 'lucide-react'
import { deleteEvent } from './actions'
import EventCard from '@/components/EventCard'

const prisma = new PrismaClient()

export default async function HomePage() {
  // 1. Získání ID přihlášeného uživatele z cookies
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  // 2. Vyhledání uživatele v databázi pro zjištění jeho role
  let currentUser = null
  if (userId) {
    currentUser = await prisma.user.findUnique({ where: { id: userId } })
  }

  // 3. Kontrola práv (např. 'admin' z tvého seedu nebo případný 'LEADER'/'leader')
  const role = currentUser?.role
  const canManage = role === 'admin' || role === 'LEADER' || role === 'leader'

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Nástěnka akcí</h1>
          <p className="text-gray-500 mt-1">Co nás v nejbližší době čeká a nemine.</p>
        </div>
        
        {/* Tlačítko se zobrazí pouze pokud má uživatel práva (canManage === true) */}
        {canManage && (
          <Link 
            href="/add"
            className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" /> Přidat akci
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            deleteEventAction={deleteEvent} 
            canManage={canManage} // Předání práv do interaktivní komponenty
          />
        ))}

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
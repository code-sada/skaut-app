import { PrismaClient } from '@prisma/client'
import { updateEvent } from '@/app/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  
  if (!event) {
    redirect('/') 
  }

  const formatDate = (d: Date | null | undefined) => d ? d.toISOString().split('T')[0] : ''

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-20 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Úprava akce</h1>
      
      <form action={updateEvent} className="space-y-8">
        <input type="hidden" name="id" value={event.id} />

        {/* 1. Základní info */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Základní info</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Název akce</label>
            <input type="text" name="title" defaultValue={event.title} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Popis</label>
            <textarea name="description" defaultValue={event.description} required className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Místo</label>
            <input type="text" name="location" defaultValue={event.location} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* 2. Časy a Srazy */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Časy a srazy</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Datum (Začátek)</label>
              <input type="date" name="date" defaultValue={formatDate(event.date)} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Konec (Volitelné)</label>
              <input type="date" name="dateEnd" defaultValue={formatDate(event.dateEnd)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Sraz (Kde a v kolik)</label>
              <input type="text" name="meetingPoint" defaultValue={event.meetingPoint || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Návrat (Kde a v kolik)</label>
              <input type="text" name="returnPoint" defaultValue={event.returnPoint || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* 3. Logistika a Účast */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Logistika a Účast</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Pro koho</label>
              <input type="text" name="targetPatrol" defaultValue={event.targetPatrol} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Kapacita (Počet lidí)</label>
              <input type="number" name="capacity" defaultValue={event.capacity || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Ubytování</label>
              <input type="text" name="accommodation" defaultValue={event.accommodation || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Strava</label>
              <input type="text" name="food" defaultValue={event.food || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Co s sebou (Vybavení)</label>
            <input type="text" name="equipment" defaultValue={event.equipment || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* 4. Finance a termíny */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Finance a Termíny</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Cena (Děti)</label>
              <input type="number" name="priceChildren" defaultValue={event.priceChildren} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Cena (Starší)</label>
              <input type="number" name="priceOlder" defaultValue={event.priceOlder} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Způsob platby</label>
              <input 
                type="text" 
                name="paymentMethod" 
                defaultValue={event.paymentMethod || ''} 
                list="payment-options" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Napiš nebo vyber..."
              />
              <datalist id="payment-options">
                <option value="Hotově na srazu" />
                <option value="Na účet střediska" />
                <option value="Na účet oddílu" />
                <option value="Přes QR kód" />
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Zaplatit do</label>
              <input type="date" name="paymentDeadline" defaultValue={formatDate(event.paymentDeadline)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Přihlášky do (RSVP)</label>
            <input type="date" name="rsvpDeadline" defaultValue={formatDate(event.rsvpDeadline)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* 5. Kontakty */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a237e] border-b pb-2">Kontakty</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Zodpovědný vedoucí</label>
              <input type="text" name="leaderInCharge" defaultValue={event.leaderInCharge || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Kontakt na vedoucího</label>
              <input type="text" name="leaderContact" defaultValue={event.leaderContact || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
          <Link href="/" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-colors text-center text-sm shadow-sm">
            Zrušit
          </Link>
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm shadow-sm">
            Uložit změny
          </button>
        </div>
      </form>
    </div>
  )
}
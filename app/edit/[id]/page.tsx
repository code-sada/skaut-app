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

  const formattedDate = event.date ? event.date.toISOString().split('T')[0] : ''

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Úprava akce</h1>
      
      <form action={updateEvent} className="space-y-5">
        <input type="hidden" name="id" value={event.id} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Název akce</label>
          <input 
            type="text" 
            name="title" 
            defaultValue={event.title} 
            required 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Popis</label>
          <textarea 
            name="description" 
            defaultValue={event.description} 
            required 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Datum</label>
            <input 
              type="date" 
              name="date" 
              defaultValue={formattedDate} 
              required 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Místo</label>
            <input 
              type="text" 
              name="location" 
              defaultValue={event.location} 
              required 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Cena (Děti)</label>
            <input 
              type="number" 
              name="priceChildren" 
              defaultValue={event.priceChildren} 
              required 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Cena (Starší)</label>
            <input 
              type="number" 
              name="priceOlder" 
              defaultValue={event.priceOlder} 
              required 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Pro koho</label>
            <input 
              type="text" 
              name="targetPatrol" 
              defaultValue={event.targetPatrol} 
              required 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
            />
        </div>

        <div className="flex gap-4 pt-6 mt-4">
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
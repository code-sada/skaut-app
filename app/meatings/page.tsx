import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import MeetingCard from '@/components/MeetingCard'
import AddMeetingForm from '@/components/AddMeetingForm' // Vytvoříme níže
import { generateMeetings, saveMeetingAttendance, sendMeetingMessage } from './actions'

const prisma = new PrismaClient()

export default async function SchuzkyPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  let currentUser = null
  if (userId) {
    currentUser = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { patrol: true } 
    })
  }

  // Definice práv (změň si názvy rolí, jak je reálně máš v DB)
  const role = currentUser?.role
  const canManage = ['admin', 'leader', 'vedouci', 'user'].includes(role || '') // Zmiňoval jsi, že vedoucí je možná 'user'

  // Logika zobrazení: Pokud jsi dítě (nemáš canManage), vidíš jen schůzky Tvojí družiny
  const whereClause = canManage ? {} : { patrolId: currentUser?.patrolId || 'none' }

  const meetings = await prisma.meeting.findMany({
    where: {
      ...whereClause,
      date: { gte: new Date() } // Jen budoucí schůzky
    },
    orderBy: { date: 'asc' },
    include: {
      patrol: true,
      attendance: { include: { user: true } },
      messages: { include: { user: true }, orderBy: { createdAt: 'asc' } }
    }
  })

  const patrols = await prisma.patrol.findMany() // Pro výběr v modalu přidávání

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Schůzky</h1>
          <p className="text-gray-500 mt-1">
            {canManage ? 'Přehled všech družinovek' : `Schůzky družiny ${currentUser?.patrol?.name || ''}`}
          </p>
        </div>
        
        {/* Formulář pro adminy na přidávání (vyčleníme do komponenty pro přehlednost) */}
        {canManage && <AddMeetingForm patrols={patrols} generateAction={generateMeetings} />}
      </div>

      <div className="space-y-4">
        {meetings.length === 0 ? (
          <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border-dashed border border-gray-200">Zatím nejsou v plánu žádné schůzky.</p>
        ) : (
          meetings.map((meeting) => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              currentUser={currentUser}
              canManage={canManage}
              saveAttendance={saveMeetingAttendance}
              sendMessage={sendMeetingMessage}
            />
          ))
        )}
      </div>
    </div>
  )
}
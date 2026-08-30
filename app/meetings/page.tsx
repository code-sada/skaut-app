import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import MeetingsClient from './MeetingsClient'
import { deleteMeeting, generateMeetings, saveMeetingAttendance, sendMeetingMessage, updateMeeting } from './actions'

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
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-20">
      <MeetingsClient 
        meetings={meetings}
        currentUser={currentUser}
        canManage={canManage}
        patrols={patrols}
        saveMeetingAttendance={saveMeetingAttendance}
        sendMeetingMessage={sendMeetingMessage}
        deleteMeetingAction={deleteMeeting}
        updateMeetingAction={updateMeeting}
        generateMeetingsAction={generateMeetings}
      />
    </div>
  )
}
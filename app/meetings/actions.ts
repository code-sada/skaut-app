"use server"
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

const MANAGEMENT_ROLES = new Set(['admin', 'user', 'leader', 'LEADER'])

async function requireUser() {
  const userId = (await cookies()).get('userId')?.value
  if (!userId) throw new Error('Nepřihlášen')
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Nepřihlášen')
  return user
}

async function requireManagementRole() {
  const user = await requireUser()
  if (!MANAGEMENT_ROLES.has(user.role)) throw new Error('Nemáte oprávnění')
  return user
}

// 1. Vygenerování pravidelných schůzek (s vynecháním prázdnin)
export async function generateMeetings(formData: FormData) {
  await requireManagementRole()
  const title = formData.get('title') as string
  const patrolId = formData.get('patrolId') as string
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const excludeDatesStr = formData.get('excludeDates') as string // Např. "24.10.2024, 31.10.2024"

  const excludeDates = excludeDatesStr.split(',').map(d => d.trim())
  
  let currentDate = new Date(`${startDateStr}T${startTime}:00`)
  const endDate = new Date(`${endDateStr}T23:59:59`)

  const newMeetings = []

  // Smyčka, která přičítá 7 dní (týden), dokud nedojdeme na datum konce
  while (currentDate <= endDate) {
    const formattedDate = currentDate.toLocaleDateString('cs-CZ').replace(/\s/g, '')
    
    // Pokud aktuální datum NENÍ v seznamu vynechaných (prázdniny), přidáme schůzku
    if (!excludeDates.includes(formattedDate)) {
      newMeetings.push({
        title,
        patrolId,
        date: new Date(currentDate), // Klonujeme datum
        endTime,
        location: "Klubovna"
      })
    }
    // Přidat 7 dní
    currentDate.setDate(currentDate.getDate() + 7)
  }

  await prisma.meeting.createMany({ data: newMeetings })
  revalidatePath('/meetings')
}

export async function deleteMeeting(formData: FormData) {
  await requireManagementRole()
  const id = formData.get('id') as string
  if (!id) return

  await prisma.meeting.delete({ where: { id } })
  revalidatePath('/meetings')
}

export async function updateMeeting(formData: FormData) {
  await requireManagementRole()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const patrolId = formData.get('patrolId') as string
  const dateStr = formData.get('date') as string
  const endTime = formData.get('endTime') as string
  const location = (formData.get('location') as string) || 'Klubovna'
  const comment = (formData.get('comment') as string) || null

  if (!id) return

  await prisma.meeting.update({
    where: { id },
    data: {
      title,
      patrolId,
      date: dateStr ? new Date(dateStr) : new Date(),
      endTime,
      location,
      comment
    }
  })

  revalidatePath('/meetings')
}

// 2. Uložení docházky
export async function saveMeetingAttendance(formData: FormData) {
  const user = await requireUser()
  const meetingId = formData.get('meetingId') as string
  const status = formData.get('status') as string
  const note = (formData.get('note') as string) || ''
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } })
  if (!meeting) throw new Error('Schůzka nenalezena')
  if (!MANAGEMENT_ROLES.has(user.role) && meeting.patrolId !== user.patrolId) {
    throw new Error('Nemáte oprávnění')
  }

  const existing = await prisma.meetingAttendance.findFirst({
    where: { userId: user.id, meetingId }
  })

  if (existing) {
    await prisma.meetingAttendance.update({
      where: { id: existing.id },
      data: { status, note }
    })
  } else {
    await prisma.meetingAttendance.create({
      data: { userId: user.id, meetingId, status, note }
    })
  }
  revalidatePath('/meetings')
}

// 3. Odeslání zprávy do chatu
export async function sendMeetingMessage(formData: FormData) {
  const user = await requireUser()
  const meetingId = formData.get('meetingId') as string
  const text = formData.get('text') as string
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } })
  if (!meeting) throw new Error('Schůzka nenalezena')
  if (!MANAGEMENT_ROLES.has(user.role) && meeting.patrolId !== user.patrolId) {
    throw new Error('Nemáte oprávnění')
  }
  if (!text.trim()) return

  await prisma.meetingMessage.create({
    data: { text, userId: user.id, meetingId }
  })
  revalidatePath('/meetings')
}
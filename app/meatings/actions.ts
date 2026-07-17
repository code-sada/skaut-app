"use server"
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

// 1. Vygenerování pravidelných schůzek (s vynecháním prázdnin)
export async function generateMeetings(formData: FormData) {
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
  revalidatePath('/schuzky')
}

// 2. Uložení docházky
export async function saveMeetingAttendance(formData: FormData) {
  const meetingId = formData.get('meetingId') as string
  const status = formData.get('status') as string
  const note = (formData.get('note') as string) || ''
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) return

  const existing = await prisma.meetingAttendance.findFirst({
    where: { userId, meetingId }
  })

  if (existing) {
    await prisma.meetingAttendance.update({
      where: { id: existing.id },
      data: { status, note }
    })
  } else {
    await prisma.meetingAttendance.create({
      data: { userId, meetingId, status, note }
    })
  }
  revalidatePath('/schuzky')
}

// 3. Odeslání zprávy do chatu
export async function sendMeetingMessage(formData: FormData) {
  const meetingId = formData.get('meetingId') as string
  const text = formData.get('text') as string
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId || !text.trim()) return

  await prisma.meetingMessage.create({
    data: { text, userId, meetingId }
  })
  revalidatePath('/schuzky')
}
'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Zajištění admina při prvním spuštění
async function ensureAdminAndPatrols() {
  const patrols = await prisma.patrol.findMany()
  if (patrols.length === 0) {
    await prisma.patrol.createMany({
      data: [{ name: 'Medvědi' }, { name: 'Tygřice' }, { name: 'Veverky' }, { name: 'Rysi' }, { name: 'RK Polux' }, { name: 'Sedmikrásky' }, { name: 'Sokoli' }, { name: 'Sýkorky' }, { name: 'Gepardi' }, { name: 'Netopýři' }]
    })
  }
  const admin = await prisma.user.findUnique({ where: { email: 'admin@skaut.cz' } })
  if (!admin) {
    await prisma.user.create({
      data: { email: 'admin@skaut.cz', password: hashPassword('admin123'), name: 'Admin', role: 'admin', mustChangePassword: false }
    })
  }
}

// --- PŘIHLÁŠENÍ / ODHLÁŠENÍ ---

export async function loginUser(formData: FormData) {
  await ensureAdminAndPatrols()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.password !== hashPassword(password)) {
    redirect('/login')
    return
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  if (user.mustChangePassword) redirect('/change-password')
  redirect('/')
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  redirect('/login')
}

export async function forceChangePassword(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) redirect('/login')

  const newPassword = formData.get('newPassword') as string
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashPassword(newPassword), mustChangePassword: false }
  })
  redirect('/')
}

// --- VLASTNÍ PROFIL ---

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) redirect('/login')

  const name = formData.get('name') as string
  const newPassword = formData.get('newPassword') as string

  const dataToUpdate: any = { name }
  if (newPassword && newPassword.length >= 4) {
    dataToUpdate.password = hashPassword(newPassword)
  }

  await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate
  })
  revalidatePath('/')
  redirect('/')
}

// --- SPRÁVA AKCÍ ---

export async function createEvent(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) throw new Error("Musíš být přihlášený!")

  // Základní info
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  
  // Časový harmonogram
  const dateStr = formData.get('date') as string
  const date = dateStr ? new Date(dateStr) : new Date()
  
  const dateEndStr = formData.get('dateEnd') as string
  const dateEnd = dateEndStr ? new Date(dateEndStr) : null
  
  const meetingPoint = (formData.get('meetingPoint') as string) || null
  const returnPoint = (formData.get('returnPoint') as string) || null

  // Účast a termíny
  const targetPatrol = (formData.get('targetPatrol') as string) || 'Všichni'
  
  const rsvpDeadlineStr = formData.get('rsvpDeadline') as string
  const rsvpDeadline = rsvpDeadlineStr ? new Date(rsvpDeadlineStr) : null
  
  const capacityStr = formData.get('capacity') as string
  const capacity = capacityStr ? Number(capacityStr) : null

  // Finance
  const priceChildren = Number(formData.get('priceChildren')) || 0
  const priceOlder = Number(formData.get('priceOlder')) || 0
  
  const paymentDeadlineStr = formData.get('paymentDeadline') as string
  const paymentDeadline = paymentDeadlineStr ? new Date(paymentDeadlineStr) : null
  
  const paymentMethod = (formData.get('paymentMethod') as string) || null

  // Logistika a vybavení
  const equipment = (formData.get('equipment') as string) || null
  const food = (formData.get('food') as string) || null
  const accommodation = (formData.get('accommodation') as string) || null

  // Kontakty
  const leaderInCharge = (formData.get('leaderInCharge') as string) || null
  const leaderContact = (formData.get('leaderContact') as string) || null

  await prisma.event.create({
    data: { 
      title, description, location, date, dateEnd, meetingPoint, returnPoint,
      targetPatrol, rsvpDeadline, capacity, priceChildren, priceOlder,
      paymentDeadline, paymentMethod, equipment, food, accommodation,
      leaderInCharge, leaderContact, createdById: userId 
    }
  })
  
  revalidatePath('/')
  redirect('/')
}

export async function updateEvent(formData: FormData) {
  const id = formData.get('id') as string
  
  // Základní info
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  
  // Časový harmonogram
  const dateStr = formData.get('date') as string
  const date = dateStr ? new Date(dateStr) : new Date()
  
  const dateEndStr = formData.get('dateEnd') as string
  const dateEnd = dateEndStr ? new Date(dateEndStr) : null
  
  const meetingPoint = (formData.get('meetingPoint') as string) || null
  const returnPoint = (formData.get('returnPoint') as string) || null

  // Účast a termíny
  const targetPatrol = (formData.get('targetPatrol') as string) || 'Všichni'
  
  const rsvpDeadlineStr = formData.get('rsvpDeadline') as string
  const rsvpDeadline = rsvpDeadlineStr ? new Date(rsvpDeadlineStr) : null
  
  const capacityStr = formData.get('capacity') as string
  const capacity = capacityStr ? Number(capacityStr) : null

  // Finance
  const priceChildren = Number(formData.get('priceChildren')) || 0
  const priceOlder = Number(formData.get('priceOlder')) || 0
  
  const paymentDeadlineStr = formData.get('paymentDeadline') as string
  const paymentDeadline = paymentDeadlineStr ? new Date(paymentDeadlineStr) : null
  
  const paymentMethod = (formData.get('paymentMethod') as string) || null

  // Logistika a vybavení
  const equipment = (formData.get('equipment') as string) || null
  const food = (formData.get('food') as string) || null
  const accommodation = (formData.get('accommodation') as string) || null

  // Kontakty
  const leaderInCharge = (formData.get('leaderInCharge') as string) || null
  const leaderContact = (formData.get('leaderContact') as string) || null

  await prisma.event.update({
    where: { id },
    data: { 
      title, description, location, date, dateEnd, meetingPoint, returnPoint,
      targetPatrol, rsvpDeadline, capacity, priceChildren, priceOlder,
      paymentDeadline, paymentMethod, equipment, food, accommodation,
      leaderInCharge, leaderContact
    }
  })
  
  revalidatePath('/')
  redirect('/')
}

export async function deleteEvent(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.event.delete({ where: { id } })
  revalidatePath('/')
}

// --- SPRÁVA UŽIVATELŮ (ADMIN) ---

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const patrolId = formData.get('patrolId') as string
  const password = formData.get('password') as string 
  
  await prisma.user.create({
    data: {
      name,
      email,
      role,
      patrolId: patrolId === 'none' ? null : patrolId,
      password: hashPassword(password),
      mustChangePassword: true
    }
  })
  revalidatePath('/admin')
}

export async function editUser(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const patrolId = formData.get('patrolId') as string
  
  await prisma.user.update({
    where: { id },
    data: { 
      name, 
      email, 
      role,
      patrolId: patrolId === 'none' ? null : patrolId
    }
  })
  revalidatePath('/admin')
}

export async function forcePasswordReset(id: string) {
  await prisma.user.update({
    where: { id },
    data: { mustChangePassword: true }
  })
  revalidatePath('/admin')
}

export async function deleteUser(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return

  await prisma.user.delete({
    where: { id }
  })
  revalidatePath('/admin')
}

export async function saveAttendance(formData: FormData) {
  const eventId = formData.get('eventId') as string
  const status = formData.get('status') as string
  const note = (formData.get('note') as string) || ''

  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId || !eventId || !status) {
    throw new Error('Chybí data pro uložení účasti.')
  }

  // Nejdřív se podíváme, jestli už se uživatel k této akci nevyjádřil dřív
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: userId,
      eventId: eventId
    }
  })

  if (existingAttendance) {
    // Pokud už existuje, jen ho updatneme (např. změnil názor nebo přidal poznámku)
    await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { status, note }
    })
  } else {
    // Pokud se vyjadřuje poprvé, vytvoříme nový záznam
    await prisma.attendance.create({
      data: {
        userId,
        eventId,
        status,
        note
      }
    })
  }

  // Po uložení ihned obnovíme stránku, ať se změna projeví
  revalidatePath('/')
}
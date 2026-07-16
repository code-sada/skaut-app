import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminContent from './AdminContent'
import { createUser, editUser, forcePasswordReset, deleteUser } from '@/app/actions'

const prisma = new PrismaClient()

export default async function AdminPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/login')

  const currentUser = await prisma.user.findUnique({ where: { id: userId } })
  if (currentUser?.role !== 'admin') redirect('/') 

  const users = await prisma.user.findMany({ 
    orderBy: { name: 'asc' },
    include: { patrol: true } 
  })
  
  const patrols = await prisma.patrol.findMany({ 
    orderBy: { name: 'asc' } 
  })

  return <AdminContent users={users} patrols={patrols} currentUser={currentUser} createUser={createUser} editUser={editUser} forcePasswordReset={forcePasswordReset} deleteUser={deleteUser} />
}
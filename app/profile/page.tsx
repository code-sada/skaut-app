import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { updateProfile } from '@/app/actions'
import Link from 'next/link'
import { User } from 'lucide-react'

const prisma = new PrismaClient()

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { patrol: true } })
  if (!user) redirect('/login')

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User className="w-8 h-8" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Můj profil</h1>
            <p className="text-sm text-gray-500">{user.email} • {user.patrol?.name || 'Bez družiny'}</p>
        </div>
      </div>
      
      <form action={updateProfile} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Zobrazené jméno / Přezdívka</label>
          <input type="text" name="name" defaultValue={user.name} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-100">
          <label className="text-sm font-semibold text-gray-700">Změnit heslo (volitelné)</label>
          <p className="text-xs text-gray-500 mb-1">Pokud heslo měnit nechcete, nechte toto pole prázdné.</p>
          <input type="password" name="newPassword" minLength={4} placeholder="Nové tajné heslo..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>

        <div className="flex gap-4 pt-6 mt-4">
          <Link href="/" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition-colors text-center text-sm">
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
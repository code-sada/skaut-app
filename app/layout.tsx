import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { logoutUser } from './actions'
import { Home, Calendar, Shield, Users, Folder, Bell, Plus, Search, Tent, LogOut, Settings } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })
const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'SKAUTAPP',
  description: 'Informační systém oddílu',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  let currentUser = null
  
  if (userId) { 
    currentUser = await prisma.user.findUnique({ where: { id: userId } }) 
  }

  return (
    <html lang="cs">
      <body className={`${inter.className} bg-gray-50 text-gray-900 flex min-h-screen font-sans`}>
        {currentUser && !currentUser.mustChangePassword ? (
          <>
            {/* LEVÝ PANEL (SIDEBAR) */}
            {/* Use client Sidebar to highlight active links correctly */}
            <>
              {/* @ts-ignore */}
              <Sidebar currentUser={currentUser} logoutUser={logoutUser} />
            </>

            {/* PRAVÁ ČÁST (HLAVNÍ OBSAH A HORNÍ LIŠTA) */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              
              {/* HORNÍ LIŠTA */}
              <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Hledáte něco?" 
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-[#00c853] outline-none text-gray-700 font-medium placeholder-gray-300" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  
                  <Link href="/" className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00b34a] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm">
                    <Plus className="w-5 h-5" /> Přidat akci
                  </Link>
                </div>
              </header>

              {/* TADY SE VYKRESLÍ NÁSTĚNKA (page.tsx) */}
              <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
              </main>
            </div>
          </>
        ) : (
          <main className="flex-1 w-full h-screen overflow-y-auto">{children}</main>
        )}
      </body>
    </html>
  )
}
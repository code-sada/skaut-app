"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Shield, Users, Folder, Settings, Tent, LogOut, MapPin, MessageCircle, CheckSquare, Compass } from 'lucide-react'

// Překladový slovník pro role
const roleTranslations: { [key: string]: string } = {
  child: 'Dítě',
  parent: 'Rodič',
  user: 'Vedoucí',
  admin: 'Administrátor'
}

export default function Sidebar({ currentUser, logoutUser }: any) {
  let pathname = usePathname() || '/'
  pathname = pathname.replace(/\/+$|^$/g, '') || '/'

  const nav = [
    { href: '/', label: 'Přehled', icon: Home },
    { href: '/meatings', label: 'Schůzky', icon: Compass },
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/expedition', label: 'Výpravy', icon: MapPin },
    { href: '/calendar', label: 'Kalendář akcí', icon: Calendar },
    { href: '/patrols', label: 'Družiny', icon: Shield },
    { href: '/members', label: 'Členové', icon: Users },
    { href: '/documents', label: 'Dokumenty', icon: Folder }
  ]

  function isActive(href: string) {
    const cleanHref = href.replace(/\/+$/g, '') || '/'
    if (cleanHref === '/') return pathname === '/'
    return pathname === cleanHref || pathname.startsWith(cleanHref + '/')
  }

  function getInitials(name: string) {
    return name.split(' ').map((n:any)=>n[0]).join('').substring(0,2).toUpperCase()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="flex flex-col h-full">
        <div className="h-20 flex items-center px-6 shrink-0">
          <Tent className="text-[#00c853] w-7 h-7 mr-2" />
          <span className="font-extrabold text-[#1a237e] text-xl tracking-wide">SKAUT<span className="text-[#ffb300]">APP</span></span>
        </div>

        <nav className="px-4 py-2 space-y-1.5 flex-1">
          {nav.map((item, idx)=>{
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={`${item.href}-${idx}`} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${active ? 'bg-gray-100 text-[#1a237e] font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : ''}`} /> {item.label}
              </Link>
            )
          })}
        </nav>

        {/* ADMIN SECTION */}
        {currentUser?.role === 'admin' && (
          <div className="px-4 pb-2">
            <div className="pt-4 border-t border-gray-100">
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Administrace</p>
              <Link href="/admin" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${isActive('/admin') ? 'bg-gray-100 text-[#1a237e] font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
                <Settings className="w-5 h-5" /> Správa účtů
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between shrink-0">
        <Link href="/profile" className="flex items-center gap-3 cursor-pointer group flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a237e] font-bold flex items-center justify-center group-hover:bg-blue-100 transition-colors">{getInitials(currentUser?.name || '')}</div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight group-hover:text-[#1a237e] transition-colors whitespace-nowrap overflow-hidden text-ellipsis w-32">{currentUser?.name}</span>
            {/* Zde se nyní vypisuje hezký český název role ze slovníku */}
            <span className="text-xs text-gray-400 capitalize">
              {roleTranslations[currentUser?.role] || currentUser?.role}
            </span>
          </div>
        </Link>

        {logoutUser && (
          <form action={logoutUser} className="ml-3 shrink-0">
            <button 
              type="submit" 
              title="Odhlásit se" 
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </aside>
  )
}
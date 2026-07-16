"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname() || '/'

  const navItems = [
    { href: '/', label: 'Přehled' },
    { href: '/admin', label: 'Správa účtů' },
    { href: '/add', label: 'Přidat akci' }
  ]

  return (
    <nav className="p-4 bg-gray-800 text-white flex gap-4">
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded ${isActive ? 'bg-blue-600 text-white font-bold' : 'text-gray-200 hover:text-white'}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Search, Plus, User } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/collection', icon: BookOpen, label: 'Colección' },
  { href: '/collection/new', icon: Plus, label: 'Agregar' },
  { href: '/search', icon: Search, label: 'Buscar' },
  { href: '/series', icon: BookOpen, label: 'Series' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

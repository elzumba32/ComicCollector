'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { BookOpen, Plus, Search, LogOut, User } from 'lucide-react'

export function Navbar() {
  const { user, loading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Comic Collector</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/collection"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Mi Colección
                </Link>
                <Link
                  href="/series"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Series
                </Link>
                <Link
                  href="/search"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Buscar
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : user ? (
              <>
                <Link
                  href="/collection/new"
                  className="hidden sm:flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={18} />
                  <span>Agregar</span>
                </Link>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={18} />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={18} />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

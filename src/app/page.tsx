'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { CollectionStats } from '@/components/dashboard/CollectionStats'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default function Home() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
    }
  }, [user, userLoading, router])

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Colección</h1>
        <p className="text-gray-600 mt-2">Gestioná tu colección de cómics</p>
      </div>

      <div className="mb-8">
        <CollectionStats />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/collection/new"
          className="flex items-center justify-center space-x-3 bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={24} />
          <span className="text-lg font-medium">Agregar Edición</span>
        </Link>

        <Link
          href="/search"
          className="flex items-center justify-center space-x-3 bg-white text-gray-900 p-6 rounded-xl border hover:bg-gray-50 transition-colors"
        >
          <Search size={24} />
          <span className="text-lg font-medium">Buscar Número</span>
        </Link>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { getEditions } from '@/lib/api/editions'
import { EditionCard } from '@/components/editions/EditionCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

type Edition = {
  id: string
  title: string
  subtitle: string | null
  cover_image_url: string | null
  format: string | null
  condition: string | null
  reading_status: string
  publication_year: number | null
  physical_location: string | null
  publishers?: { name: string } | null
  [key: string]: unknown
}

export default function CollectionPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { user, loading: userLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    const fetchEditions = async () => {
      if (!user) return
      try {
        const data = await getEditions(user.id)
        setEditions(data)
      } catch (err) {
        console.error('Error fetching editions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEditions()
  }, [user])

  const filteredEditions = editions.filter((edition) =>
    edition.title.toLowerCase().includes(search.toLowerCase()) ||
    edition.publishers?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Colección</h1>
          <p className="text-gray-600 mt-1">{editions.length} ediciones</p>
        </div>
        <Link href="/collection/new">
          <Button>
            <Plus size={18} className="mr-2" />
            Agregar Edición
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por título o editorial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-200 rounded-lg" />
              <div className="mt-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-2 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEditions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search ? 'No se encontraron ediciones' : 'No tenés ediciones aún'}
          </p>
          {!search && (
            <Link href="/collection/new" className="mt-4 inline-block">
              <Button>Agregar primera edición</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredEditions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} />
          ))}
        </div>
      )}
    </div>
  )
}

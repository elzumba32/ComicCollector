'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { getSeries } from '@/lib/api/series'
import { SeriesCard } from '@/components/series/SeriesCard'
import { ExternalImporter } from '@/components/external/ExternalImporter'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface SeriesData {
  id: string
  name: string
  year_began: number | null
  year_ended: number | null
  country: string | null
  publishers?: { name: string } | null
}

export default function SeriesPage() {
  const [series, setSeries] = useState<SeriesData[]>([])
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
    const fetchSeries = async () => {
      if (!user) return
      try {
        const data = await getSeries()
        setSeries(data)
      } catch (err) {
        console.error('Error fetching series:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSeries()
  }, [user])

  const filteredSeries = series.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.publishers?.name?.toLowerCase().includes(search.toLowerCase())
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Series</h1>
            <p className="text-gray-600 mt-1">{series.length} series en la base de datos</p>
          </div>
          {user && (
            <ExternalImporter userId={user.id} onImported={() => window.location.reload()} />
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar serie o editorial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSeries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search ? 'No se encontraron series' : 'No hay series en la base de datos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeries.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </div>
  )
}

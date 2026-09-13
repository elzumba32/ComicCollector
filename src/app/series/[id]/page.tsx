'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { getSeriesById } from '@/lib/api/series'
import { IssueGrid } from '@/components/series/IssueGrid'
import { ArrowLeft, BookOpen } from 'lucide-react'

interface EditionInfo {
  id: string
  title: string
}

interface IssueData {
  id: string
  number: string
  title: string | null
  edition_issues?: Array<{
    edition_id: string
    editions: EditionInfo
  }>
}

interface SeriesData {
  id: string
  name: string
  year_began: number | null
  year_ended: number | null
  country: string | null
  publishers?: { name: string } | null
  issues: IssueData[]
}

export default function SeriesDetailPage() {
  const [series, setSeries] = useState<SeriesData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const seriesData = await getSeriesById(id)
        setSeries(seriesData)
      } catch (err) {
        console.error('Error fetching series:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, id])

  const handleEditionClick = (editionId: string) => {
    router.push(`/collection/${editionId}`)
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Serie no encontrada</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Volver
      </button>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="p-4 bg-purple-100 rounded-xl">
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{series.name}</h1>
            {series.publishers?.name && (
              <p className="text-lg text-gray-600 mt-1">{series.publishers.name}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              {series.year_began && (
                <span>
                  {series.year_began}{series.year_ended ? ` - ${series.year_ended}` : ' - presente'}
                </span>
              )}
              {series.country && <span>• {series.country}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-sm text-gray-500 mb-4">
          Pasá el mouse sobre un número para ver qué edición lo contiene. Hacé click para ir a la edición.
        </p>
        <IssueGrid
          issues={series.issues}
          onEditionClick={handleEditionClick}
        />
      </div>
    </div>
  )
}

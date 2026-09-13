'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface SeriesData {
  id: string
  name: string
  year_began: number | null
  year_ended: number | null
  country: string | null
  publishers?: { name: string } | null
  issue_count?: number
}

interface SeriesCardProps {
  series: SeriesData
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Link href={`/series/${series.id}`}>
      <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{series.name}</h3>
            {series.publishers?.name && (
              <p className="text-sm text-gray-500">{series.publishers.name}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
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
    </Link>
  )
}

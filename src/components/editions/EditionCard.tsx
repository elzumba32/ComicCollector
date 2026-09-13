'use client'

import Link from 'next/link'
import { BookOpen, Calendar, MapPin } from 'lucide-react'

interface EditionCardProps {
  edition: {
    id: string
    title: string
    subtitle?: string | null
    cover_image_url?: string | null
    format?: string | null
    condition?: string | null
    reading_status?: string
    publication_year?: number | null
    physical_location?: string | null
    publishers?: { name: string } | null
  }
}

export function EditionCard({ edition }: EditionCardProps) {
  const conditionLabels: Record<string, string> = {
    mint: 'Mint',
    near_mint: 'Near Mint',
    very_good: 'Very Good',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  }

  const readingStatusLabels: Record<string, string> = {
    pending: 'Pendiente',
    reading: 'Leyendo',
    read: 'Leído',
  }

  return (
    <Link href={`/collection/${edition.id}`}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
        {edition.cover_image_url ? (
          <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
            <img
              src={edition.cover_image_url}
              alt={edition.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center rounded-t-lg">
            <BookOpen className="h-10 w-10 text-blue-300" />
          </div>
        )}
        
        <div className="p-2">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">{edition.title}</h3>
          {edition.publishers?.name && (
            <p className="text-xs text-gray-500 mt-0.5">{edition.publishers.name}</p>
          )}
          
          <div className="flex flex-wrap gap-1 mt-1.5">
            {edition.format && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {edition.format.toUpperCase()}
              </span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              edition.reading_status === 'read' ? 'bg-green-100 text-green-700' :
              edition.reading_status === 'reading' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {readingStatusLabels[edition.reading_status || 'unread']}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

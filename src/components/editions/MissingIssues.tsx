'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IssueBadge } from '@/components/issues/IssueBadge'
import { toggleIssueOwnership, getOwnedIssueIds } from '@/lib/api/ownership'
import { AlertCircle, Plus } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface IssueData {
  id: string
  number: string
  title: string | null
}

interface MissingIssuesProps {
  seriesId: string
  seriesName: string
  ownedIssueNumbers: string[]
  editionId: string
  allIssues: IssueData[]
}

export function MissingIssues({ seriesId, seriesName, ownedIssueNumbers, editionId, allIssues }: MissingIssuesProps) {
  const [missingIssues, setMissingIssues] = useState<IssueData[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    const findMissing = async () => {
      setLoading(true)
      const supabase = createClient()

      const { data: seriesIssues } = await supabase
        .from('issues')
        .select('id, number, title')
        .eq('series_id', seriesId)
        .order('number', { ascending: true })

      if (seriesIssues) {
        const ownedSet = new Set(allIssues.map(i => i.number))
        const missing = seriesIssues.filter(i => !ownedSet.has(i.number))
        setMissingIssues(missing)
      }
      setLoading(false)
    }

    findMissing()
  }, [seriesId, allIssues])

  if (loading) return null
  if (missingIssues.length === 0) return null

  return (
    <div className="border-t p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={18} className="text-amber-500" />
        <h3 className="font-semibold text-gray-900">
          Faltantes de {seriesName} ({missingIssues.length})
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Estos números de la serie no están en esta edición.
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {missingIssues.slice(0, 50).map((issue) => (
          <IssueBadge
            key={issue.id}
            number={issue.number}
            owned={false}
            title={issue.title || undefined}
          />
        ))}
        {missingIssues.length > 50 && (
          <div className="flex items-center justify-center text-xs text-gray-500">
            +{missingIssues.length - 50} más
          </div>
        )}
      </div>
    </div>
  )
}

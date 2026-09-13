'use client'

import { useState } from 'react'
import { IssueBadge } from '@/components/issues/IssueBadge'

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

interface IssueGridProps {
  issues: IssueData[]
  onEditionClick?: (editionId: string) => void
}

export function IssueGrid({ issues, onEditionClick }: IssueGridProps) {
  const [hoveredEditionId, setHoveredEditionId] = useState<string | null>(null)

  const sortedIssues = [...issues].sort((a, b) => {
    const numA = parseInt(a.number) || 0
    const numB = parseInt(b.number) || 0
    return numA - numB
  })

  const ownedIssues = sortedIssues.filter((i) => i.edition_issues && i.edition_issues.length > 0)
  const missingIssues = sortedIssues.filter((i) => !i.edition_issues || i.edition_issues.length === 0)

  const getEditionsForIssue = (issue: IssueData): EditionInfo[] => {
    if (!issue.edition_issues) return []
    return issue.edition_issues.map((ei) => ei.editions)
  }

  const isHighlighted = (issue: IssueData) => {
    if (!hoveredEditionId) return false
    return issue.edition_issues?.some((ei) => ei.edition_id === hoveredEditionId) || false
  }

  const getEditionTitle = (issue: IssueData) => {
    const editions = getEditionsForIssue(issue)
    if (editions.length === 0) return undefined
    return editions.map((e) => e.title).join(', ')
  }

  const getUniqueEditions = () => {
    const editionMap = new Map<string, { title: string; count: number }>()
    for (const issue of sortedIssues) {
      if (issue.edition_issues) {
        for (const ei of issue.edition_issues) {
          const existing = editionMap.get(ei.edition_id)
          if (existing) {
            existing.count++
          } else {
            editionMap.set(ei.edition_id, { title: ei.editions.title, count: 1 })
          }
        }
      }
    }
    return Array.from(editionMap.entries()).map(([id, data]) => ({ id, ...data }))
  }

  const editions = getUniqueEditions()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Números ({sortedIssues.length})
        </h3>
        <div className="text-sm text-gray-600">
          <span className="text-green-600 font-medium">{ownedIssues.length}</span> tengo /{' '}
          <span className="text-gray-500">{missingIssues.length}</span> faltan
          {sortedIssues.length > 0 && (
            <span className="ml-2">
              ({Math.round((ownedIssues.length / sortedIssues.length) * 100)}%)
            </span>
          )}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${sortedIssues.length > 0 ? (ownedIssues.length / sortedIssues.length) * 100 : 0}%` }}
        />
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {sortedIssues.map((issue) => (
          <IssueBadge
            key={issue.id}
            number={issue.number}
            owned={!!issue.edition_issues && issue.edition_issues.length > 0}
            title={issue.title || undefined}
            highlighted={isHighlighted(issue)}
            editionTitle={getEditionTitle(issue)}
            editionId={getEditionsForIssue(issue)[0]?.id}
            onClick={() => {
              const editions = getEditionsForIssue(issue)
              if (editions.length > 0 && onEditionClick) {
                onEditionClick(editions[0].id)
              }
            }}
            onMouseEnter={() => {
              const editions = getEditionsForIssue(issue)
              if (editions.length > 0) {
                setHoveredEditionId(editions[0].id)
              }
            }}
            onMouseLeave={() => setHoveredEditionId(null)}
          />
        ))}
      </div>

      {editions.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Ediciones que contienen esta serie:</h4>
          <div className="flex flex-wrap gap-2">
            {editions.map((edition) => (
              <button
                key={edition.id}
                onClick={() => onEditionClick?.(edition.id)}
                onMouseEnter={() => setHoveredEditionId(edition.id)}
                onMouseLeave={() => setHoveredEditionId(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  hoveredEditionId === edition.id
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {edition.title} ({edition.count})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

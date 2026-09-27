'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { getEdition } from '@/lib/api/editions'
import { getEditionIssues, removeIssueFromEdition } from '@/lib/api/editionIssues'
import { EditionForm } from '@/components/editions/EditionForm'
import { IssueSelector } from '@/components/editions/IssueSelector'
import { Button } from '@/components/ui/Button'
import { Database } from '@/types/database'
import { Trash2, Plus } from 'lucide-react'

type Edition = Database['editions'][number]

interface EditionIssue {
  id: string
  issue_id: string
  issues: {
    id: string
    number: string
    title: string | null
    series: { id: string; name: string } | null
  }
}

export default function EditEditionPage() {
  const [edition, setEdition] = useState<Edition | null>(null)
  const [issues, setIssues] = useState<EditionIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
    }
  }, [user, userLoading, router])

  const fetchIssues = useCallback(async () => {
    try {
      const data = await getEditionIssues(id)
      setIssues(data as unknown as EditionIssue[])
    } catch (err) {
      console.error('Error fetching issues:', err)
    }
  }, [id])

  useEffect(() => {
    const fetchEdition = async () => {
      if (!user) return
      try {
        const data = await getEdition(id)
        setEdition(data)
      } catch (err) {
        console.error('Error fetching edition:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEdition()
    fetchIssues()
  }, [user, id, fetchIssues])

  const handleRemoveIssue = async (issueId: string) => {
    setRemovingId(issueId)
    try {
      await removeIssueFromEdition(id, issueId)
      setIssues((prev) => prev.filter((i) => i.issue_id !== issueId))
    } catch (err) {
      console.error('Error removing issue:', err)
    } finally {
      setRemovingId(null)
    }
  }

  const handleIssuesAdded = () => {
    fetchIssues()
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!edition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Edición no encontrada</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Edición</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <EditionForm initialData={edition} mode="edit" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Números contenidos ({issues.length})
          </h2>
          <IssueSelector editionId={edition.id} onIssuesAdded={handleIssuesAdded} />
        </div>

        {issues.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {issues.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.issues.series?.name || 'Sin serie'}
                  </p>
                  <p className="text-gray-600 text-sm">#{item.issues.number}</p>
                  {item.issues.title && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.issues.title}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveIssue(item.issue_id)}
                  disabled={removingId === item.issue_id}
                  className="text-red-400 hover:text-red-600 disabled:opacity-50 ml-2 shrink-0"
                  title="Quitar de esta edición"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No hay números asociados. Usá el botón de arriba para agregar números.
          </p>
        )}
      </div>
    </div>
  )
}

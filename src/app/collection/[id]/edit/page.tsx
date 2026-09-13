'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { getEdition } from '@/lib/api/editions'
import { EditionForm } from '@/components/editions/EditionForm'
import { Database } from '@/types/database'

type Edition = Database['editions'][number]

export default function EditEditionPage() {
  const [edition, setEdition] = useState<Edition | null>(null)
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
  }, [user, id])

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
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <EditionForm initialData={edition} mode="edit" />
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { EditionForm } from '@/components/editions/EditionForm'
import { useEffect } from 'react'

export default function NewEditionPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nueva Edición</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <EditionForm mode="create" />
      </div>
    </div>
  )
}

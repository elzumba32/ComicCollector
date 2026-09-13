'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { getEdition, deleteEdition, updateEdition } from '@/lib/api/editions'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { IssueSelector } from '@/components/editions/IssueSelector'
import { CoverUpload } from '@/components/ui/CoverUpload'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar, MapPin, Star, ExternalLink } from 'lucide-react'

interface EditionData {
  id: string
  title: string
  subtitle: string | null
  cover_image_url: string | null
  description: string | null
  notes: string | null
  isbn: string | null
  publication_year: number | null
  purchase_date: string | null
  purchase_price: number | null
  condition: string | null
  format: string | null
  language: string | null
  physical_location: string | null
  reading_status: string
  personal_rating: number | null
  external_url: string | null
  collection: string | null
  country: string | null
  publishers?: { name: string } | null
  edition_issues?: Array<{
    issues: {
      id: string
      number: string
      title: string | null
      series_id: string
      series: { id: string; name: string }
    }
  }> | null
}

export default function EditionDetailPage() {
  const [edition, setEdition] = useState<EditionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
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

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteEdition(id)
      router.push('/collection')
      router.refresh()
    } catch (err) {
      console.error('Error deleting edition:', err)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleCoverUpload = async (url: string) => {
    try {
      await updateEdition(id, { cover_image_url: url })
      setEdition((prev) => prev ? { ...prev, cover_image_url: url } : null)
    } catch (err) {
      console.error('Error updating cover:', err)
    }
  }

  const handleCoverRemove = async () => {
    try {
      await updateEdition(id, { cover_image_url: null })
      setEdition((prev) => prev ? { ...prev, cover_image_url: null } : null)
    } catch (err) {
      console.error('Error removing cover:', err)
    }
  }

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
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <Link href={`/collection/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit size={16} className="mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={16} className="mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-4 flex items-center justify-center bg-gray-50">
            <CoverUpload
              currentCoverUrl={edition.cover_image_url}
              onUpload={handleCoverUpload}
              onRemove={handleCoverRemove}
              editionId={edition.id}
              size="lg"
            />
          </div>

          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl font-bold text-gray-900">{edition.title}</h1>
            {edition.subtitle && (
              <p className="text-lg text-gray-600 mt-1">{edition.subtitle}</p>
            )}
            {edition.publishers?.name && (
              <p className="text-gray-500 mt-2">{edition.publishers.name}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {edition.format && (
                <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {edition.format.toUpperCase()}
                </span>
              )}
              {edition.condition && (
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {conditionLabels[edition.condition]}
                </span>
              )}
              <span className={`text-sm px-3 py-1 rounded-full ${
                edition.reading_status === 'read' ? 'bg-green-100 text-green-700' :
                edition.reading_status === 'reading' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {readingStatusLabels[edition.reading_status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              {edition.publication_year && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{edition.publication_year}</span>
                </div>
              )}
              {edition.physical_location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{edition.physical_location}</span>
                </div>
              )}
              {edition.isbn && (
                <div className="col-span-2">
                  <span className="text-gray-500">ISBN:</span> {edition.isbn}
                </div>
              )}
              {edition.purchase_price && (
                <div>
                  <span className="text-gray-500">Precio:</span> ${edition.purchase_price}
                </div>
              )}
              {edition.personal_rating && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span>{edition.personal_rating}/5</span>
                </div>
              )}
            </div>

            {edition.description && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 text-sm">{edition.description}</p>
              </div>
            )}

            {edition.notes && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Notas</h3>
                <p className="text-gray-600 text-sm">{edition.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Números contenidos ({edition.edition_issues?.length || 0})
            </h3>
            <IssueSelector editionId={edition.id} onIssuesAdded={() => window.location.reload()} />
          </div>
          
          {edition.edition_issues && edition.edition_issues.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {edition.edition_issues.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm">{item.issues.series.name}</p>
                  <p className="text-gray-600 text-sm">#{item.issues.number}</p>
                  {item.issues.title && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{item.issues.title}</p>
                  )}
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

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Eliminar edición">
        <p className="text-gray-600 mb-4">
          ¿Estás seguro de que querés eliminar <strong>{edition.title}</strong>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}

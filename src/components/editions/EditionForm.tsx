'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { createEdition, updateEdition } from '@/lib/api/editions'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Database } from '@/types/database'
import { Plus } from 'lucide-react'

type Edition = Database['editions'][number]

interface EditionFormProps {
  initialData?: Edition
  mode?: 'create' | 'edit'
}

interface EditionFormData {
  title: string
  subtitle: string
  publisher_id: string
  collection: string
  country: string
  isbn: string
  publication_year: string
  purchase_date: string
  purchase_price: string
  condition: string
  format: string
  language: string
  cover_image_url: string
  description: string
  notes: string
  physical_location: string
  reading_status: string
  personal_rating: string
}

interface Publisher {
  id: string
  name: string
}

export function EditionForm({ initialData, mode = 'create' }: EditionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [showPublisherModal, setShowPublisherModal] = useState(false)
  const [newPublisherName, setNewPublisherName] = useState('')
  const [creatingPublisher, setCreatingPublisher] = useState(false)
  const [collections, setCollections] = useState<string[]>([])
  const [showCollections, setShowCollections] = useState(false)
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EditionFormData>({
    defaultValues: initialData ? {
      title: initialData.title,
      subtitle: initialData.subtitle || '',
      publisher_id: initialData.publisher_id || '',
      collection: initialData.collection || '',
      country: initialData.country || '',
      isbn: initialData.isbn || '',
      publication_year: initialData.publication_year?.toString() || '',
      purchase_date: initialData.purchase_date || '',
      purchase_price: initialData.purchase_price?.toString() || '',
      condition: initialData.condition || '',
      format: initialData.format || '',
      language: initialData.language || 'es',
      cover_image_url: initialData.cover_image_url || '',
      description: initialData.description || '',
      notes: initialData.notes || '',
      physical_location: initialData.physical_location || '',
      reading_status: initialData.reading_status || 'pending',
      personal_rating: initialData.personal_rating?.toString() || '',
    } : {
      language: 'es',
      reading_status: 'pending',
    }
  })

  const fetchPublishers = async () => {
    const { data } = await supabase.from('publishers').select('id, name').order('name')
    if (data) setPublishers(data)
  }

  const fetchCollections = async () => {
    const { data } = await supabase
      .from('editions')
      .select('collection')
      .eq('user_id', user?.id)
      .not('collection', 'is', null)
      .order('collection')
    
    if (data) {
      const unique = [...new Set(data.map((d) => d.collection).filter(Boolean))] as string[]
      setCollections(unique)
    }
  }

  useEffect(() => {
    fetchPublishers()
    if (user) fetchCollections()
  }, [supabase, user])

  const handleCreatePublisher = async () => {
    if (!newPublisherName.trim()) return

    setCreatingPublisher(true)
    try {
      const { data, error } = await supabase
        .from('publishers')
        .insert({ name: newPublisherName.trim() })
        .select('id, name')
        .single()

      if (error) throw error

      if (data) {
        setPublishers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setNewPublisherName('')
        setShowPublisherModal(false)
      }
    } catch (err) {
      console.error('Error creating publisher:', err)
    } finally {
      setCreatingPublisher(false)
    }
  }

  const onSubmit = async (data: EditionFormData) => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const editionData = {
        user_id: user.id,
        title: data.title,
        subtitle: data.subtitle || null,
        publisher_id: data.publisher_id || null,
        collection: data.collection || null,
        country: data.country || null,
        isbn: data.isbn || null,
        publication_year: data.publication_year ? parseInt(data.publication_year) : null,
        purchase_date: data.purchase_date || null,
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
        condition: data.condition as Edition['condition'] || null,
        format: data.format as Edition['format'] || null,
        language: data.language || 'es',
        cover_image_url: data.cover_image_url || null,
        description: data.description || null,
        notes: data.notes || null,
        physical_location: data.physical_location || null,
        reading_status: data.reading_status as Edition['reading_status'],
        personal_rating: data.personal_rating ? parseInt(data.personal_rating) : null,
        external_url: null,
        data_source: 'manual',
        data_source_date: new Date().toISOString(),
      }

      if (mode === 'edit' && initialData) {
        await updateEdition(initialData.id, editionData)
        router.push(`/collection/${initialData.id}`)
      } else {
        const newEdition = await createEdition(editionData)
        router.push(`/collection/${newEdition.id}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Título *"
            id="title"
            placeholder="Batman: La Caída del Caballero Vol. 1"
            error={errors.title?.message}
            {...register('title', { required: 'El título es requerido' })}
          />
        </div>

        <Input
          label="Subtítulo"
          id="subtitle"
          placeholder="Edición especial"
          {...register('subtitle')}
        />

        <div className="mb-4">
          <label htmlFor="publisher_id" className="block text-sm font-medium text-gray-700 mb-1">
            Editorial
          </label>
          <div className="flex gap-2">
            <select
              id="publisher_id"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('publisher_id')}
            >
              <option value="">Seleccionar editorial</option>
              {publishers.map((pub) => (
                <option key={pub.id} value={pub.id}>{pub.name}</option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowPublisherModal(true)}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="mb-4 relative">
          <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-1">
            Colección
          </label>
          <input
            type="text"
            id="collection"
            placeholder="La Saga de Batman: Knightfall"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('collection')}
            onFocus={() => setShowCollections(true)}
            onBlur={() => setTimeout(() => setShowCollections(false), 200)}
          />
          {showCollections && collections.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {collections
                .filter((c) => {
                  const currentValue = watch('collection') || ''
                  return c.toLowerCase().includes(currentValue.toLowerCase()) && c !== currentValue
                })
                .map((collection) => (
                  <button
                    key={collection}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setValue('collection', collection)
                      setShowCollections(false)
                    }}
                  >
                    {collection}
                  </button>
                ))}
            </div>
          )}
        </div>

        <Input
          label="País"
          id="country"
          placeholder="Argentina"
          {...register('country')}
        />

        <Input
          label="ISBN"
          id="isbn"
          placeholder="978-1234567890"
          {...register('isbn')}
        />

        <Input
          label="Año de publicación"
          id="publication_year"
          type="number"
          placeholder="2020"
          {...register('publication_year')}
        />

        <Input
          label="Fecha de compra"
          id="purchase_date"
          type="date"
          {...register('purchase_date')}
        />

        <Input
          label="Precio pagado"
          id="purchase_price"
          type="number"
          step="0.01"
          placeholder="1500"
          {...register('purchase_price')}
        />

        <div className="mb-4">
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Estado físico
          </label>
          <select
            id="condition"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('condition')}
          >
            <option value="">Seleccionar estado</option>
            <option value="mint">Mint</option>
            <option value="near_mint">Near Mint</option>
            <option value="very_good">Very Good</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
            Formato
          </label>
          <select
            id="format"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('format')}
          >
            <option value="">Seleccionar formato</option>
            <option value="tpb">TPB</option>
            <option value="omnibus">Omnibus</option>
            <option value="hardcover">Hardcover</option>
            <option value="softcover">Softcover</option>
            <option value="absolute">Absolute</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <Input
          label="Idioma"
          id="language"
          placeholder="es"
          {...register('language')}
        />

        <div className="mb-4">
          <label htmlFor="reading_status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado de lectura
          </label>
          <select
            id="reading_status"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('reading_status')}
          >
            <option value="pending">Pendiente</option>
            <option value="reading">Leyendo</option>
            <option value="read">Leído</option>
          </select>
        </div>

        <Input
          label="Calificación (1-5)"
          id="personal_rating"
          type="number"
          min="1"
          max="5"
          {...register('personal_rating')}
        />

        <Input
          label="Ubicación física"
          id="physical_location"
          placeholder="Estante A, fila 2"
          {...register('physical_location')}
        />

        <div className="md:col-span-2">
          <Input
            label="URL de portada"
            id="cover_image_url"
            placeholder="https://..."
            {...register('cover_image_url')}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('description')}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notas personales
          </label>
          <textarea
            id="notes"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('notes')}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {mode === 'edit' ? 'Guardar Cambios' : 'Crear Edición'}
        </Button>
      </div>

      <Modal isOpen={showPublisherModal} onClose={() => setShowPublisherModal(false)} title="Nueva editorial">
        <div className="space-y-4">
          <Input
            label="Nombre de la editorial"
            id="new-publisher"
            placeholder="DC Comics, Marvel, Panini..."
            value={newPublisherName}
            onChange={(e) => setNewPublisherName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowPublisherModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePublisher} loading={creatingPublisher} disabled={!newPublisherName.trim()}>
              Crear
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  )
}

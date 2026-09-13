'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Upload, X, Image } from 'lucide-react'

interface CoverUploadProps {
  currentCoverUrl?: string | null
  onUpload: (url: string) => void
  onRemove?: () => void
  editionId?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CoverUpload({ currentCoverUrl, onUpload, onRemove, editionId, size = 'md' }: CoverUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const sizeClasses = {
    sm: 'w-20 h-28',
    md: 'w-32 h-44',
    lg: 'w-48 h-64',
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede superar 5MB')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${editionId || 'temp'}-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error } = await supabase.storage
        .from('covers')
        .upload(filePath, file, { upsert: true })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        onUpload(urlData.publicUrl)
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
      setPreview(null)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayUrl = preview || currentCoverUrl

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt="Portada"
              className="w-full h-full object-cover"
            />
            {onRemove && !uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={12} />
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400">
            {uploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
            ) : (
              <>
                <Image size={24} className="mx-auto mb-1" />
                <span className="text-xs">Subir portada</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {size !== 'sm' && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={14} className="mr-1" />
            {currentCoverUrl ? 'Cambiar' : 'Subir'}
          </Button>
          {currentCoverUrl && onRemove && (
            <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">
              <X size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

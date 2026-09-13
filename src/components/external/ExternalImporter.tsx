'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Search, ExternalLink } from 'lucide-react'

interface ExternalResult {
  type: 'series' | 'issue' | 'publisher'
  id: string
  name: string
  description?: string
  cover_url?: string
  year?: string | null
  publisher?: string
  issue_count?: number
  external_url?: string
}

interface ExternalImporterProps {
  userId: string
  onImported?: () => void
}

export function ExternalImporter({ userId, onImported }: ExternalImporterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExternalResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (query.trim().length < 2) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <Search size={18} className="mr-2" />
        Buscar en Comic Vine
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Buscar en Comic Vine">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar serie o número
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Batman, Superman #1..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {result.cover_url && (
                      <img
                        src={result.cover_url}
                        alt={result.name}
                        className="w-10 h-14 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-500">
                        {result.type === 'series' ? 'Serie' : 'Número'}
                        {result.publisher && ` • ${result.publisher}`}
                        {result.year && ` • ${result.year}`}
                        {result.issue_count && ` • ${result.issue_count} issues`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.external_url && (
                      <a
                        href={result.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink size={14} />
                        Consultar
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No se encontraron resultados
            </p>
          )}

          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

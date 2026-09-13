'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Search, Download, ExternalLink } from 'lucide-react'

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
  onImported: () => void
}

export function ExternalImporter({ userId, onImported }: ExternalImporterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExternalResult[]>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [imported, setImported] = useState<Set<string>>(new Set())

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

  const handleImportSeries = async (result: ExternalResult) => {
    if (result.type !== 'series') return

    setImportingId(result.id)
    const supabase = createClient()

    try {
      const { data: existingSeries } = await supabase
        .from('series')
        .select('id')
        .ilike('name', result.name)
        .single()

      let seriesId = existingSeries?.id

      if (!seriesId) {
        const { data: newSeries } = await supabase
          .from('series')
          .insert({
            name: result.name,
            year_began: result.year ? parseInt(result.year) : null,
            external_cv_id: result.id.replace('cv_', ''),
            cover_image_url: result.cover_url,
          })
          .select('id')
          .single()

        seriesId = newSeries?.id
      }

      if (seriesId) {
        setImported((prev) => new Set(prev).add(result.id))
        onImported()
      }
    } catch (err) {
      console.error('Import error:', err)
    } finally {
      setImportingId(null)
    }
  }

  const handleImportIssue = async (result: ExternalResult) => {
    if (result.type !== 'issue') return

    setImportingId(result.id)
    const supabase = createClient()

    try {
      const seriesName = result.description || 'Serie desconocida'

      const { data: existingSeries } = await supabase
        .from('series')
        .select('id')
        .ilike('name', seriesName)
        .single()

      let seriesId = existingSeries?.id

      if (!seriesId) {
        const { data: newSeries } = await supabase
          .from('series')
          .insert({ name: seriesName })
          .select('id')
          .single()
        seriesId = newSeries?.id
      }

      if (seriesId) {
        const numberMatch = result.name.match(/#(\d+)/)
        const number = numberMatch ? numberMatch[1] : result.name

        const { data: existingIssue } = await supabase
          .from('issues')
          .select('id')
          .eq('series_id', seriesId)
          .eq('number', number)
          .single()

        if (!existingIssue) {
          await supabase.from('issues').insert({
            series_id: seriesId,
            number,
            title: result.name.replace(/#\d+\s*-?\s*/, ''),
          })
        }

        setImported((prev) => new Set(prev).add(result.id))
        onImported()
      }
    } catch (err) {
      console.error('Import error:', err)
    } finally {
      setImportingId(null)
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <Search size={18} className="mr-2" />
        Buscar en Comic Vine
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Importar desde Comic Vine">
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
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {imported.has(result.id) ? (
                      <span className="text-green-600 text-sm font-medium">Importado</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          result.type === 'series'
                            ? handleImportSeries(result)
                            : handleImportIssue(result)
                        }
                        loading={importingId === result.id}
                      >
                        <Download size={14} className="mr-1" />
                        Importar
                      </Button>
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

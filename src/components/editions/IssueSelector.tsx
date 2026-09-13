'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { searchSeries } from '@/lib/api/series'
import { findOrCreateIssues, addMultipleIssuesToEdition } from '@/lib/api/editionIssues'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { RangeParser } from './RangeParser'
import { Plus, X, Search } from 'lucide-react'

interface IssueSelectorProps {
  editionId: string
  onIssuesAdded: () => void
}

interface ParsedRange {
  seriesName: string
  numbers: string[]
}

interface Series {
  id: string
  name: string
  publishers?: { name: string } | null
}

export function IssueSelector({ editionId, onIssuesAdded }: IssueSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'range' | 'search'>('range')
  const [searchQuery, setSearchQuery] = useState('')
  const [seriesResults, setSeriesResults] = useState<Series[]>([])
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
  const [issueNumbers, setIssueNumbers] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSeriesResults([])
        return
      }
      const results = await searchSeries(searchQuery)
      setSeriesResults(results)
    }
    search()
  }, [searchQuery])

  const handleRangeParsed = async (ranges: ParsedRange[]) => {
    setLoading(true)
    setError(null)

    try {
      let totalAdded = 0

      for (const range of ranges) {
        // Find or create the series
        const { data: existingSeries } = await supabase
          .from('series')
          .select('id, name')
          .ilike('name', range.seriesName)
          .single()

        let seriesId = existingSeries?.id

        if (!seriesId) {
          // Create new series
          const { data: newSeries } = await supabase
            .from('series')
            .insert({ name: range.seriesName })
            .select('id')
            .single()
          seriesId = newSeries?.id
        }

        if (seriesId) {
          // Find or create issues
          const issueIds = await findOrCreateIssues(seriesId, range.numbers)
          
          // Add to edition
          await addMultipleIssuesToEdition(editionId, issueIds)
          totalAdded += issueIds.length
        }
      }

      onIssuesAdded()
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar números')
    } finally {
      setLoading(false)
    }
  }

  const handleManualAdd = async () => {
    if (!selectedSeries || !issueNumbers.trim()) return

    setLoading(true)
    setError(null)

    try {
      const numbers = issueNumbers
        .split(/[,;]+/)
        .map(n => n.replace(/#/g, '').trim())
        .filter(Boolean)

      const issueIds = await findOrCreateIssues(selectedSeries.id, numbers)
      await addMultipleIssuesToEdition(editionId, issueIds)

      onIssuesAdded()
      setIsOpen(false)
      setSelectedSeries(null)
      setIssueNumbers('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar números')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus size={18} className="mr-2" />
        Agregar números
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agregar números a esta edición">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'range' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setMode('range')}
            >
              Pegar rangos
            </Button>
            <Button
              variant={mode === 'search' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setMode('search')}
            >
              Buscar serie
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {mode === 'range' ? (
            <RangeParser onParsed={handleRangeParsed} />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar serie
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Batman, Detective Comics..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {seriesResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {seriesResults.map((series) => (
                    <button
                      key={series.id}
                      onClick={() => {
                        setSelectedSeries(series)
                        setSearchQuery(series.name)
                        setSeriesResults([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <p className="font-medium">{series.name}</p>
                      {series.publishers?.name && (
                        <p className="text-sm text-gray-500">{series.publishers.name}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedSeries && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Números (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={issueNumbers}
                    onChange={(e) => setIssueNumbers(e.target.value)}
                    placeholder="488, 489, 490"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleManualAdd}
                    disabled={loading || !issueNumbers.trim()}
                    className="mt-2"
                    size="sm"
                  >
                    Agregar números
                  </Button>
                </div>
              )}
            </div>
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

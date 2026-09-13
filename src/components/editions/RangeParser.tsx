'use client'

import { useState } from 'react'
import { parseIssueRanges, formatParsedRanges } from '@/lib/parsers/issueRange'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Plus, X } from 'lucide-react'

interface ParsedRange {
  seriesName: string
  numbers: string[]
}

interface RangeParserProps {
  onParsed: (ranges: ParsedRange[]) => void
}

export function RangeParser({ onParsed }: RangeParserProps) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<ParsedRange[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleParse = () => {
    if (!text.trim()) {
      setError('Ingresá al menos un rango')
      return
    }

    const ranges = parseIssueRanges(text)
    
    if (ranges.length === 0) {
      setError('No se detectaron rangos válidos. Formato: "Batman #488-496"')
      return
    }

    setError(null)
    setParsed(ranges)
  }

  const handleConfirm = () => {
    onParsed(parsed)
    setText('')
    setParsed([])
  }

  const totalIssues = parsed.reduce((acc, r) => acc + r.numbers.length, 0)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pegar rangos de números
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Ejemplo:\nBatman #488-496\nDetective Comics #659-662`}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button type="button" onClick={handleParse} variant="secondary">
        <Search size={16} className="mr-2" />
        Detectar números
      </Button>

      {parsed.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Se detectaron {totalIssues} números en {parsed.length} {parsed.length === 1 ? 'serie' : 'series'}:
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            {parsed.map((range, i) => (
              <li key={i}>
                <strong>{range.seriesName}</strong>: #{range.numbers[0]}
                {range.numbers.length > 1 ? ` - #${range.numbers[range.numbers.length - 1]}` : ''}
                {' '}({range.numbers.length} números)
              </li>
            ))}
          </ul>
          <Button onClick={handleConfirm} className="mt-4" size="sm">
            <Plus size={16} className="mr-2" />
            Confirmar y buscar series
          </Button>
        </div>
      )}
    </div>
  )
}

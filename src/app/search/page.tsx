'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Search as SearchIcon, BookOpen, BookMarked, Check, X } from 'lucide-react'
import { useEffect } from 'react'

interface SearchResult {
  type: 'edition' | 'series' | 'issue'
  id: string
  title: string
  subtitle?: string
  series_name?: string
  issue_number?: string
  edition_id?: string
  edition_title?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  const search = async (q: string) => {
    if (!user || !q.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const raw = q.trim()
    const clean = raw.replace(/#/g, '').trim().toLowerCase()
    const parts = clean.split(/\s+/).filter(Boolean)
    const numberPart = parts.find((p) => /^\d+$/.test(p))
    const textPart = parts.filter((p) => !/^\d+$/.test(p)).join(' ')

    try {
      const [editionsByTitle, editionsByCollection, series] = await Promise.all([
        supabase
          .from('editions')
          .select('id, title, subtitle')
          .eq('user_id', user.id)
          .ilike('title', `%${clean}%`)
          .limit(10),
        supabase
          .from('editions')
          .select('id, title, subtitle, collection')
          .eq('user_id', user.id)
          .ilike('collection', `%${clean}%`)
          .limit(10),
        supabase
          .from('series')
          .select('id, name')
          .ilike('name', `%${clean}%`)
          .limit(10),
      ])

      const editionMap = new Map<string, { id: string; title: string; subtitle?: string }>()
      for (const e of [...(editionsByTitle.data || []), ...(editionsByCollection.data || [])]) {
        const ed = e as Record<string, unknown>
        if (!editionMap.has(ed.id as string)) {
          editionMap.set(ed.id as string, {
            id: ed.id as string,
            title: ed.title as string,
            subtitle: (ed.subtitle as string) || undefined,
          })
        }
      }

      let issuesByNumber: { data: Record<string, unknown>[] | null } = { data: [] }
      let issuesBySeriesName: { data: Record<string, unknown>[] | null } = { data: [] }
      let issuesByNumberAndSeries: { data: Record<string, unknown>[] | null } = { data: [] }

      if (numberPart && textPart) {
        issuesByNumberAndSeries = await supabase
          .from('issues')
          .select('id, number, series!inner(name, id), edition_issues(editions(id, title))')
          .ilike('number', `%${numberPart}%`)
          .ilike('series.name', `%${textPart}%`)
          .limit(10)
      } else {
        if (numberPart) {
          issuesByNumber = await supabase
            .from('issues')
            .select('id, number, series(name, id), edition_issues(editions(id, title))')
            .ilike('number', `%${numberPart}%`)
            .limit(10)
        }

        if (textPart) {
          issuesBySeriesName = await supabase
            .from('issues')
            .select('id, number, series!inner(name, id), edition_issues(editions(id, title))')
            .ilike('series.name', `%${textPart}%`)
            .limit(10)
        }
      }

      const issueMap = new Map<string, SearchResult>()

      const allIssues = [
        ...(issuesByNumberAndSeries.data || []),
        ...(issuesByNumber.data || []),
        ...(issuesBySeriesName.data || []),
      ]

      for (const i of allIssues) {
        if (issueMap.has(i.id as string)) continue
        const s = i.series as { name: string; id: string } | null
        const ei = i.edition_issues as Array<{ editions: { id: string; title: string } }> | undefined
        const ed = ei?.[0]?.editions
        issueMap.set(i.id as string, {
          type: 'issue',
          id: i.id as string,
          title: `${s?.name || 'Serie'} #${i.number}`,
          subtitle: ed ? `En: ${ed.title}` : undefined,
          series_name: s?.name,
          issue_number: i.number as string,
          edition_id: ed?.id,
          edition_title: ed?.title,
        })
      }

      const searchResults: SearchResult[] = [
        ...Array.from(editionMap.values()).map((e) => ({
          type: 'edition' as const,
          id: e.id,
          title: e.title,
          subtitle: e.subtitle,
        })),
        ...(series.data || []).map((s: Record<string, unknown>) => ({
          type: 'series' as const,
          id: s.id as string,
          title: s.name as string,
        })),
        ...Array.from(issueMap.values()),
      ]

      setResults(searchResults)

      if (q.trim() && !recentSearches.includes(q.trim())) {
        const newRecent = [q.trim(), ...recentSearches.slice(0, 4)]
        setRecentSearches(newRecent)
        localStorage.setItem('recentSearches', JSON.stringify(newRecent))
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'edition': return <BookOpen size={18} className="text-blue-500" />
      case 'series': return <BookMarked size={18} className="text-purple-500" />
      case 'issue': return <BookOpen size={18} className="text-green-500" />
      default: return null
    }
  }

  const getLink = (result: SearchResult) => {
    switch (result.type) {
      case 'edition': return `/collection/${result.id}`
      case 'series': return `/series/${result.id}`
      case 'issue': return result.edition_id ? `/collection/${result.edition_id}` : `/series/${result.id}`
      default: return '#'
    }
  }

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Buscar</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.length >= 2) search(e.target.value)
            }}
            placeholder="Buscar por título, serie, número, editorial..."
            className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </form>

      {recentSearches.length > 0 && results.length === 0 && !loading && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Búsquedas recientes</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((recent, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(recent)
                  search(recent)
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {recent}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-white rounded-xl">
              <div className="h-10 w-10 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-4">{results.length} resultados</p>
          {results.map((result) => (
            <a
              key={`${result.type}-${result.id}`}
              href={getLink(result)}
              className="flex items-center space-x-4 p-4 bg-white rounded-xl border hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                {getIcon(result.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{result.title}</p>
                {result.subtitle && (
                  <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 capitalize">{result.type}</span>
            </a>
          ))}
        </div>
      ) : query.length >= 2 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron resultados para &quot;{query}&quot;</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Escribí al menos 2 caracteres para buscar</p>
        </div>
      )}
    </div>
  )
}

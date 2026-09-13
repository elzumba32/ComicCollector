const COMIC_VINE_BASE = 'https://comicvine.gamespot.com/api'

const API_KEY = process.env.COMIC_VINE_API_KEY || ''

interface ComicVineResponse<T> {
  error: string
  limit: number
  offset: number
  number_of_page_results: number
  number_of_total_results: number
  results: T
}

export interface ComicVineSeries {
  id: number
  name: string
  start_year: string | null
  end_year: string | null
  publisher?: { name: string }
  image?: { original_url: string }
  site_detail_url: string
  count_of_issues: number
}

export interface ComicVineIssue {
  id: number
  issue_number: string
  name: string | null
  cover_date: string | null
  site_detail_url: string
  image?: { original_url: string }
  series?: { name: string }
}

export interface ComicVinePublisher {
  id: number
  name: string
  site_detail_url: string
  image?: { original_url: string }
}

export interface ExternalSearchResult {
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

async function comicVineFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${COMIC_VINE_BASE}${endpoint}`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('format', 'json')

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'ComicCollector/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`Comic Vine API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.error !== 'OK') {
    throw new Error(`Comic Vine API: ${data.error}`)
  }

  return data
}

export async function searchComicVineSeries(query: string): Promise<ExternalSearchResult[]> {
  if (!API_KEY) {
    return []
  }

  try {
    const data = await comicVineFetch<ComicVineSeries[]>('/search', {
      query,
      resources: 'volume',
      limit: '10',
    })

    return data.map((series) => ({
      type: 'series' as const,
      id: `cv_${series.id}`,
      name: series.name,
      year: series.start_year,
      publisher: series.publisher?.name,
      issue_count: series.count_of_issues,
      cover_url: series.image?.original_url,
      external_url: series.site_detail_url,
    }))
  } catch {
    return []
  }
}

export async function searchComicVineIssues(query: string): Promise<ExternalSearchResult[]> {
  if (!API_KEY) {
    return []
  }

  try {
    const data = await comicVineFetch<ComicVineIssue[]>('/search', {
      query,
      resources: 'issue',
      limit: '10',
    })

    return data.map((issue) => ({
      type: 'issue' as const,
      id: `cv_${issue.id}`,
      name: issue.name || `#${issue.issue_number}`,
      description: issue.series?.name,
      cover_url: issue.image?.original_url,
      year: issue.cover_date?.split('-')[0],
      external_url: issue.site_detail_url,
    }))
  } catch {
    return []
  }
}

export async function getComicVineSeriesIssues(seriesId: number): Promise<ExternalSearchResult[]> {
  if (!API_KEY) {
    return []
  }

  try {
    const data = await comicVineFetch<ComicVineIssue[]>(`/volume/${seriesId}/issues`, {
      limit: '100',
      sort: 'issue_number:asc',
    })

    return data.map((issue) => ({
      type: 'issue' as const,
      id: `cv_${issue.id}`,
      name: `#${issue.issue_number}${issue.name ? ` - ${issue.name}` : ''}`,
      cover_url: issue.image?.original_url,
      year: issue.cover_date?.split('-')[0],
      external_url: issue.site_detail_url,
    }))
  } catch {
    return []
  }
}

export async function searchExternal(query: string): Promise<ExternalSearchResult[]> {
  const [series, issues] = await Promise.all([
    searchComicVineSeries(query),
    searchComicVineIssues(query),
  ])

  return [...series, ...issues]
}

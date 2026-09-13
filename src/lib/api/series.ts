import { createClient } from '@/lib/supabase/client'

export async function getSeries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('series')
    .select('*, publishers(name)')
    .order('name')

  if (error) throw error
  return data
}

export async function getSeriesById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('series')
    .select(`
      *,
      publishers(name),
      issues(
        id,
        number,
        title,
        edition_issues(
          edition_id,
          editions(id, title, cover_image_url)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSeries(series: { name: string; publisher_id?: string; country?: string; year_began?: number }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('series')
    .insert(series)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function searchSeries(query: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('series')
    .select('*, publishers(name)')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20)

  if (error) throw error
  return data
}

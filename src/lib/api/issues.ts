import { createClient } from '@/lib/supabase/client'

export async function getIssuesBySeries(seriesId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('series_id', seriesId)
    .order('number')

  if (error) throw error
  return data
}

export async function getIssueById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('issues')
    .select('*, series(name, publishers(name)), edition_issues(editions(id, title, cover_image_url))')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createIssue(issue: { series_id: string; number: string; title?: string; publication_date?: string }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('issues')
    .insert(issue)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserOwnedIssues(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('edition_issues')
    .select('issue_id, editions!inner(user_id)')
    .eq('editions.user_id', userId)

  if (error) throw error
  return new Set(data.map((item) => item.issue_id))
}

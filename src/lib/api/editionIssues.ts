import { createClient } from '@/lib/supabase/client'

export async function getEditionIssues(editionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('edition_issues')
    .select('*, issues(*, series(name, publishers(name)))')
    .eq('edition_id', editionId)

  if (error) throw error
  return data
}

export async function addIssueToEdition(editionId: string, issueId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('edition_issues')
    .insert({ edition_id: editionId, issue_id: issueId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addMultipleIssuesToEdition(editionId: string, issueIds: string[]) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('edition_issues')
    .insert(issueIds.map((issueId) => ({ edition_id: editionId, issue_id: issueId })))
    .select()

  if (error) throw error
  return data
}

export async function removeIssueFromEdition(editionId: string, issueId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('edition_issues')
    .delete()
    .eq('edition_id', editionId)
    .eq('issue_id', issueId)

  if (error) throw error
}

export async function toggleIssueInEdition(editionId: string, issueId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data: existing } = await supabase
    .from('edition_issues')
    .select('id')
    .eq('edition_id', editionId)
    .eq('issue_id', issueId)
    .single()

  if (existing) {
    await removeIssueFromEdition(editionId, issueId)
    return false
  } else {
    await addIssueToEdition(editionId, issueId)
    return true
  }
}

export async function checkIssueInEdition(editionId: string, issueId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('edition_issues')
    .select('id')
    .eq('edition_id', editionId)
    .eq('issue_id', issueId)
    .single()

  return !!data
}

export async function findOrCreateIssues(seriesId: string, numbers: string[], names?: string[]) {
  const supabase = createClient()
  const issueIds: string[] = []

  for (let i = 0; i < numbers.length; i++) {
    const number = numbers[i]
    const name = names?.[i]
    
    // Try to find existing issue
    const { data: existing } = await supabase
      .from('issues')
      .select('id')
      .eq('series_id', seriesId)
      .eq('number', number)
      .single()

    if (existing) {
      issueIds.push(existing.id)
    } else {
      // Create new issue
      const { data: newIssue, error } = await supabase
        .from('issues')
        .insert({ series_id: seriesId, number, title: name || null })
        .select('id')
        .single()

      if (error) throw error
      issueIds.push(newIssue.id)
    }
  }

  return issueIds
}

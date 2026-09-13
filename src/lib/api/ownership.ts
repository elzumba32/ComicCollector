import { createClient } from '@/lib/supabase/client'

export async function getUserEditions(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('editions')
    .select('id, title')
    .eq('user_id', userId)
    .order('title')

  if (error) throw error
  return data
}

export async function getEditionsContainingIssue(userId: string, issueId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('edition_issues')
    .select('edition_id, editions!inner(id, title, user_id)')
    .eq('issue_id', issueId)
    .eq('editions.user_id', userId)

  if (error) throw error
  return (data || []).map((item: any) => ({
    id: item.editions.id,
    title: item.editions.title,
  }))
}

export async function toggleIssueOwnership(userId: string, issueId: string, preferredEditionId?: string): Promise<{ owned: boolean; editionId?: string }> {
  const supabase = createClient()

  const editions = await getEditionsContainingIssue(userId, issueId)

  if (editions.length > 0) {
    for (const ed of editions) {
      await supabase
        .from('edition_issues')
        .delete()
        .eq('edition_id', ed.id)
        .eq('issue_id', issueId)
    }
    return { owned: false }
  }

  let targetEditionId = preferredEditionId

  if (!targetEditionId) {
    const editions = await getUserEditions(userId)
    if (editions.length === 0) {
      const { data: newEdition } = await supabase
        .from('editions')
        .insert({
          user_id: userId,
          title: 'Sin agrupar',
          reading_status: 'unread',
        })
        .select('id')
        .single()
      targetEditionId = newEdition?.id
    } else {
      targetEditionId = editions[0].id
    }
  }

  if (!targetEditionId) throw new Error('No se pudo crear la edición')

  const { error } = await supabase
    .from('edition_issues')
    .insert({ edition_id: targetEditionId, issue_id: issueId })

  if (error) throw error
  return { owned: true, editionId: targetEditionId }
}

export async function getOwnedIssueIds(userId: string): Promise<Set<string>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('edition_issues')
    .select('issue_id, editions!inner(user_id)')
    .eq('editions.user_id', userId)

  if (error) throw error
  return new Set(data.map((item: any) => item.issue_id))
}

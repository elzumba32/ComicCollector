import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Edition = Database['editions'][number]

export async function getEditions(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('editions')
    .select('*, publishers(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getEdition(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('editions')
    .select('*, publishers(name), edition_issues(*, issues(*, series(id, name)))')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createEdition(edition: Omit<Edition, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('editions')
    .insert(edition)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEdition(id: string, updates: Partial<Edition>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('editions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEdition(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('editions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

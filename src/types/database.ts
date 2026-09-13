export interface Publisher {
  id: string
  name: string
  country: string | null
  website: string | null
  created_at: string
}

export interface Series {
  id: string
  name: string
  publisher_id: string | null
  year_began: number | null
  year_ended: number | null
  country: string | null
  created_at: string
}

export interface Issue {
  id: string
  series_id: string
  number: string
  title: string | null
  publication_date: string | null
  cover_image_url: string | null
  gcd_id: string | null
  cv_id: string | null
  metron_id: string | null
  created_at: string
}

export interface Edition {
  id: string
  user_id: string
  title: string
  subtitle: string | null
  publisher_id: string | null
  collection: string | null
  country: string | null
  isbn: string | null
  publication_year: number | null
  purchase_date: string | null
  purchase_price: number | null
  condition: 'mint' | 'near_mint' | 'very_good' | 'good' | 'fair' | 'poor' | null
  format: 'tpb' | 'omnibus' | 'hardcover' | 'softcover' | 'absolute' | 'other' | null
  language: string | null
  cover_image_url: string | null
  description: string | null
  notes: string | null
  physical_location: string | null
  reading_status: 'pending' | 'reading' | 'read'
  personal_rating: number | null
  external_url: string | null
  data_source: string | null
  data_source_date: string | null
  created_at: string
  updated_at: string
}

export interface EditionIssue {
  id: string
  edition_id: string
  issue_id: string
  created_at: string
}

export interface Saga {
  id: string
  name: string
  description: string | null
  start_year: number | null
  end_year: number | null
  created_at: string
}

export interface SagaIssue {
  id: string
  saga_id: string
  issue_id: string
  reading_order: number | null
  created_at: string
}

export interface ExternalSource {
  id: string
  entity_type: 'series' | 'issue' | 'edition' | 'publisher'
  entity_id: string
  source_name: string
  source_id: string | null
  source_url: string | null
  fetched_at: string
  created_at: string
}

export interface Database {
  publishers: Publisher[]
  series: Series[]
  issues: Issue[]
  editions: Edition[]
  edition_issues: EditionIssue[]
  sagas: Saga[]
  saga_issues: SagaIssue[]
  external_sources: ExternalSource[]
}

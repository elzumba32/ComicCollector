import { NextRequest, NextResponse } from 'next/server'
import { searchExternal } from '@/lib/api/external'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    )
  }

  try {
    const results = await searchExternal(query.trim())
    return NextResponse.json({ results })
  } catch (error) {
    console.error('External search error:', error)
    return NextResponse.json(
      { error: 'Error searching external sources' },
      { status: 500 }
    )
  }
}

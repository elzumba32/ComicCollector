'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { BookOpen, BookMarked, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface Stats {
  totalEditions: number
  totalIssues: number
  readCount: number
  readingCount: number
  pendingCount: number
  seriesCount: number
}

export function CollectionStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      const supabase = createClient()

      try {
        const { data: userEditions } = await supabase
          .from('editions')
          .select('id')
          .eq('user_id', user.id)

        const editionIds = (userEditions || []).map(e => e.id)

        const [
          editionsResult,
          issuesResult,
          readResult,
          readingResult,
          pendingResult,
          seriesResult,
        ] = await Promise.all([
          supabase
            .from('editions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          editionIds.length > 0
            ? supabase
                .from('edition_issues')
                .select('issue_id', { count: 'exact', head: true })
                .in('edition_id', editionIds)
            : Promise.resolve({ count: 0 }),
          supabase
            .from('editions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('reading_status', 'read'),
          supabase
            .from('editions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('reading_status', 'reading'),
          supabase
            .from('editions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('reading_status', 'pending'),
          supabase
            .from('series')
            .select('id', { count: 'exact', head: true }),
        ])

        setStats({
          totalEditions: editionsResult.count || 0,
          totalIssues: issuesResult.count || 0,
          readCount: readResult.count || 0,
          readingCount: readingResult.count || 0,
          pendingCount: pendingResult.count || 0,
          seriesCount: seriesResult.count || 0,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-4">
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      icon: BookOpen,
      label: 'Ediciones',
      value: stats.totalEditions,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: BookMarked,
      label: 'Números',
      value: stats.totalIssues,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      icon: CheckCircle,
      label: 'Leídos',
      value: stats.readCount,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      value: stats.totalEditions > 0
        ? Math.round((stats.readCount / stats.totalEditions) * 100)
        : 0,
      label: '% Leídos',
      suffix: '%',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}{stat.suffix || ''}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Estado de lectura</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Leídos</span>
            </div>
            <span className="text-sm font-medium">{stats.readCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600">Leyendo</span>
            </div>
            <span className="text-sm font-medium">{stats.readingCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-600">Pendientes</span>
            </div>
            <span className="text-sm font-medium">{stats.pendingCount}</span>
          </div>
        </div>

        {stats.totalEditions > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500"
                  style={{ width: `${(stats.readCount / stats.totalEditions) * 100}%` }}
                />
                <div
                  className="bg-yellow-500"
                  style={{ width: `${(stats.readingCount / stats.totalEditions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

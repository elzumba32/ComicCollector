'use client'

interface IssueBadgeProps {
  number: string
  owned: boolean
  title?: string
  highlighted?: boolean
  editionId?: string
  editionTitle?: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function IssueBadge({
  number,
  owned,
  title,
  highlighted = false,
  editionId,
  editionTitle,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: IssueBadgeProps) {
  let bgColor = 'bg-gray-100 text-gray-500 border-gray-200'
  
  if (owned && highlighted) {
    bgColor = 'bg-blue-200 text-blue-900 border-blue-400 ring-2 ring-blue-300'
  } else if (owned) {
    bgColor = 'bg-green-100 text-green-800 border-green-200'
  } else if (highlighted) {
    bgColor = 'bg-blue-50 text-blue-700 border-blue-200'
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex flex-col items-center justify-center p-2 rounded-lg text-sm font-medium transition-all ${bgColor} ${
        onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'
      }`}
      title={editionTitle ? `${title || `#${number}`} — ${editionTitle}` : title || `#${number}`}
    >
      {owned && <span className="text-xs mb-0.5">✅</span>}
      <span>#{number}</span>
    </div>
  )
}

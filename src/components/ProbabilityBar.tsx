import { cn } from '@/lib/utils'
import { Platform } from '@/lib/types'
import { PLATFORM_COLORS } from '@/lib/constants'

interface ProbabilityBarProps {
  price: number
  platform: Platform
  className?: string
  showLabel?: boolean
}

export function ProbabilityBar({ price, platform, className, showLabel = true }: ProbabilityBarProps) {
  const pct = Math.min(Math.max(price * 100, 0), 100)
  const color = PLATFORM_COLORS[platform]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: `${color}15` }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Probability: ${pct.toFixed(1)}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium tabular-nums w-12 text-right" style={{ color }}>
          {pct.toFixed(1)}%
        </span>
      )}
    </div>
  )
}

'use client'
import { useState, useMemo } from 'react'
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAlertStore } from '@/store/alert-store'
import { ExportButton } from './ExportButton'
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants'
import { Platform } from '@/lib/types'

type SortField = 'timestamp' | 'changePercent' | 'platform'
type SortDir = 'asc' | 'desc'

export function AlertHistory() {
  const { alerts } = useAlertStore()
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 25

  const filtered = useMemo(() => {
    let items = [...alerts]
    if (filterPlatform !== 'all') {
      items = items.filter((a) => a.platform === filterPlatform)
    }
    items.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      switch (sortField) {
        case 'timestamp':
          return (a.timestamp - b.timestamp) * mul
        case 'changePercent':
          return (a.changePercent - b.changePercent) * mul
        case 'platform':
          return a.platform.localeCompare(b.platform) * mul
        default:
          return 0
      }
    })
    return items
  }, [alerts, filterPlatform, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setPage(0)
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-sm text-muted-foreground">No alert history yet.</p>
        <p className="text-xs text-muted-foreground/70">
          Alerts will appear here when market prices move beyond your threshold.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Filter by platform">
          {(['all', 'polymarket', 'kalshi', 'opinion'] as const).map((p) => (
            <Button
              key={p}
              variant={filterPlatform === p ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs cursor-pointer"
              onClick={() => { setFilterPlatform(p); setPage(0) }}
              role="radio"
              aria-checked={filterPlatform === p}
            >
              {p === 'all' ? 'All' : PLATFORM_LABELS[p]}
            </Button>
          ))}
        </div>
        <ExportButton alerts={filtered} />
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium">
                  <button onClick={() => toggleSort('timestamp')} className="flex items-center gap-1 cursor-pointer">
                    Time <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium">
                  <button onClick={() => toggleSort('platform')} className="flex items-center gap-1 cursor-pointer">
                    Platform <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium">Market</th>
                <th className="text-right p-3 font-medium">
                  <button onClick={() => toggleSort('changePercent')} className="flex items-center gap-1 justify-end cursor-pointer">
                    Change <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-right p-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((alert) => {
                const isUp = alert.currentPrice > alert.previousPrice
                return (
                  <tr key={alert.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {new Date(alert.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal"
                        style={{ color: PLATFORM_COLORS[alert.platform], borderColor: `${PLATFORM_COLORS[alert.platform]}30` }}
                      >
                        {PLATFORM_LABELS[alert.platform]}
                      </Badge>
                    </td>
                    <td className="p-3 max-w-[300px]">
                      <p className="text-xs truncate">{alert.marketTitle}</p>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`flex items-center justify-end gap-1 text-xs font-medium ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? '+' : '-'}{alert.changePercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs tabular-nums">
                      {(alert.previousPrice * 100).toFixed(1)}% → {(alert.currentPrice * 100).toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            {filtered.length} alerts total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs cursor-pointer"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs cursor-pointer"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

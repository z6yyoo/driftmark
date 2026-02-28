'use client'
import { useEffect, useRef } from 'react'
import { Bell, CheckCheck, Trash2, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAlertStore } from '@/store/alert-store'
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants'

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function AlertPanel() {
  const { alerts, markRead, markAllRead, clearAlerts } = useAlertStore()
  const unreadCount = alerts.filter((a) => !a.read).length
  const topRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(alerts.length)

  useEffect(() => {
    if (alerts.length > prevCountRef.current) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    prevCountRef.current = alerts.length
  }, [alerts.length])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">Alerts</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs h-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="h-7 px-2 text-xs cursor-pointer"
              aria-label="Mark all alerts as read"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Read all
            </Button>
          )}
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { if (window.confirm('Clear all alerts? This cannot be undone.')) clearAlerts() }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
              aria-label="Clear all alerts"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Bell className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No alerts yet</p>
            <p className="text-xs text-muted-foreground/70">
              Alerts trigger when prices move beyond your threshold
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div ref={topRef} />
            {alerts.slice(0, 50).map((alert) => {
              const isUp = alert.currentPrice > alert.previousPrice
              return (
                <button
                  key={alert.id}
                  className={`w-full text-left px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer ${!alert.read ? 'bg-muted/20' : ''}`}
                  onClick={() => markRead(alert.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      {isUp ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs leading-relaxed">{alert.summary}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal h-4"
                          style={{ color: PLATFORM_COLORS[alert.platform], borderColor: `${PLATFORM_COLORS[alert.platform]}30` }}
                        >
                          {PLATFORM_LABELS[alert.platform]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(alert.timestamp)}
                        </span>
                        {!alert.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      {alert.relatedNews && (
                        <a
                          href={alert.relatedNews.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {alert.relatedNews.source}: {alert.relatedNews.title.slice(0, 50)}...
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

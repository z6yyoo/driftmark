'use client'
import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Header } from './Header'
import { DisclaimerBanner } from './DisclaimerBanner'
import { MarketGrid } from './MarketGrid'
import { NewsSection } from './NewsSection'
import { AlertPanel } from './AlertPanel'
import { AlertHistory } from './AlertHistory'
import { AlertConfigDialog } from './AlertConfigDialog'
import { useMarkets } from '@/hooks/useMarkets'
import { useNews } from '@/hooks/useNews'
import { useAlerts } from '@/hooks/useAlerts'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useNotifications } from '@/hooks/useNotifications'
import { useAlertStore } from '@/store/alert-store'
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants'
import { Platform } from '@/lib/types'

export function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')

  const { markets, loading: marketsLoading, error: marketsError } = useMarkets()
  const { news, loading: newsLoading } = useNews()
  const { connected: wsConnected } = useWebSocket(markets)
  const snapshots = useAlertStore((s) => s.snapshots)

  useAlerts(markets, news)
  useNotifications()

  const filteredMarkets = useMemo(() => {
    if (platformFilter === 'all') return markets
    return markets.filter((m) => m.platform === platformFilter)
  }, [markets, platformFilter])

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { all: markets.length }
    for (const m of markets) {
      counts[m.platform] = (counts[m.platform] || 0) + 1
    }
    return counts
  }, [markets])

  return (
    <div className="min-h-screen bg-background">
      <Header
        wsConnected={wsConnected}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAlerts={() => setAlertsOpen(!alertsOpen)}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
        <div className="space-y-4">
          <DisclaimerBanner />

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <Tabs defaultValue="markets" className="space-y-4">
                <TabsList role="tablist" className="h-9">
                  <TabsTrigger value="markets" className="text-xs cursor-pointer" role="tab" aria-selected>
                    Markets
                  </TabsTrigger>
                  <TabsTrigger value="news" className="text-xs cursor-pointer" role="tab">
                    News Feed
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs cursor-pointer" role="tab">
                    Alert History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="markets" className="space-y-3">
                  {/* Platform filter pills */}
                  <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Filter markets by platform">
                    {(['all', 'polymarket', 'kalshi', 'opinion'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatformFilter(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          platformFilter === p
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                        role="radio"
                        aria-checked={platformFilter === p}
                      >
                        {p !== 'all' && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: PLATFORM_COLORS[p] }}
                          />
                        )}
                        {p === 'all' ? 'All Platforms' : PLATFORM_LABELS[p]}
                        <Badge variant="secondary" className="h-4 px-1 text-xs font-normal ml-0.5">
                          {platformCounts[p] || 0}
                        </Badge>
                      </button>
                    ))}
                  </div>

                  <MarketGrid
                    markets={filteredMarkets}
                    loading={marketsLoading}
                    error={marketsError}
                    snapshots={snapshots}
                  />
                </TabsContent>

                <TabsContent value="news">
                  <NewsSection news={news} markets={markets} loading={newsLoading} />
                </TabsContent>

                <TabsContent value="history">
                  <AlertHistory />
                </TabsContent>
              </Tabs>
            </div>

            {/* Alert sidebar - desktop */}
            <aside
              className={`lg:w-80 shrink-0 border border-border rounded-lg bg-card/50 overflow-hidden ${
                alertsOpen ? 'block' : 'hidden lg:block'
              }`}
              style={{ height: 'calc(100vh - 140px)' }}
            >
              <AlertPanel />
            </aside>
          </div>
        </div>
      </div>

      <AlertConfigDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

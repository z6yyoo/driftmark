'use client'
import { useEffect, useRef, useCallback } from 'react'
import { Market, NewsItem, PriceSnapshot } from '@/lib/types'
import { useAlertStore } from '@/store/alert-store'
import { detectPriceChanges } from '@/lib/alerts/detector'
import { findRelatedNews } from '@/lib/news/matcher'
import { generateAlertSummary } from '@/lib/news/summarizer'

export function useAlerts(markets: Market[], news: NewsItem[]) {
  const addAlert = useAlertStore((s) => s.addAlert)
  const setSnapshots = useAlertStore((s) => s.setSnapshots)
  const configRef = useRef(useAlertStore.getState().config)
  const snapshotsRef = useRef(useAlertStore.getState().snapshots)
  const initializedRef = useRef(false)

  // Keep refs in sync with store without triggering re-renders
  useEffect(() => {
    const unsub = useAlertStore.subscribe((state) => {
      configRef.current = state.config
      snapshotsRef.current = state.snapshots
    })
    return unsub
  }, [])

  const processMarkets = useCallback((markets: Market[], news: NewsItem[]) => {
    if (markets.length === 0) return

    const config = configRef.current
    const snapshots = snapshotsRef.current

    const enabledMarkets = markets.filter(m => config.platforms[m.platform])
    if (enabledMarkets.length === 0) return

    if (!initializedRef.current) {
      const newSnapshots: Record<string, PriceSnapshot> = { ...snapshots }
      for (const market of enabledMarkets) {
        const key = `${market.platform}:${market.id}`
        if (!newSnapshots[key]) {
          const leadPrice = market.outcomes[0]?.price ?? 0
          if (leadPrice > 0) {
            newSnapshots[key] = {
              marketId: market.id,
              platform: market.platform,
              price: leadPrice,
              timestamp: Date.now(),
            }
          }
        }
      }
      setSnapshots(newSnapshots)
      initializedRef.current = true
      return
    }

    const snapshotMap = new Map<string, PriceSnapshot>(
      Object.entries(snapshots)
    )

    const changes = detectPriceChanges(
      enabledMarkets,
      snapshotMap,
      config.thresholdPercent
    )

    for (const change of changes) {
      const market = enabledMarkets.find(
        m => m.id === change.marketId && m.platform === change.platform
      )
      const relatedNews = market ? findRelatedNews(market, news) : undefined

      const summary = generateAlertSummary(
        change.marketTitle,
        change.platform,
        change.previousPrice,
        change.currentPrice,
        relatedNews
      )

      addAlert({
        id: `${change.platform}:${change.marketId}:${Date.now()}`,
        marketId: change.marketId,
        platform: change.platform,
        marketTitle: change.marketTitle,
        previousPrice: change.previousPrice,
        currentPrice: change.currentPrice,
        changePercent: change.changePercent,
        summary,
        relatedNews,
        timestamp: Date.now(),
        read: false,
      })
    }

    // Update snapshots with current prices
    const newSnapshots: Record<string, PriceSnapshot> = { ...snapshots }
    for (const market of enabledMarkets) {
      const key = `${market.platform}:${market.id}`
      const leadPrice = market.outcomes[0]?.price ?? 0
      if (leadPrice > 0) {
        newSnapshots[key] = {
          marketId: market.id,
          platform: market.platform,
          price: leadPrice,
          timestamp: Date.now(),
        }
      }
    }
    setSnapshots(newSnapshots)
  }, [addAlert, setSnapshots])

  useEffect(() => {
    processMarkets(markets, news)
  }, [markets, news, processMarkets])
}

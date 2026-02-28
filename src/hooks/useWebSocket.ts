'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { PolymarketWebSocket, WSPriceUpdate } from '@/lib/websocket/polymarket-ws'
import { Market } from '@/lib/types'

export function useWebSocket(markets: Market[]) {
  const wsRef = useRef<PolymarketWebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<WSPriceUpdate | null>(null)

  const handleUpdate = useCallback((update: WSPriceUpdate) => {
    setLastUpdate(update)
  }, [])

  useEffect(() => {
    const ws = new PolymarketWebSocket()
    wsRef.current = ws

    const unsubscribe = ws.onUpdate(handleUpdate)
    ws.connect()

    const checkInterval = setInterval(() => {
      setConnected(ws.connected)
    }, 2000)

    return () => {
      clearInterval(checkInterval)
      unsubscribe()
      ws.disconnect()
      wsRef.current = null
    }
  }, [handleUpdate])

  useEffect(() => {
    if (!wsRef.current) return

    const polymarketMarkets = markets.filter(m => m.platform === 'polymarket')
    const tokenIds: string[] = []

    for (const market of polymarketMarkets) {
      for (const outcome of market.outcomes) {
        if (outcome.tokenId) tokenIds.push(outcome.tokenId)
      }
    }

    if (tokenIds.length > 0) {
      wsRef.current.subscribe(tokenIds.slice(0, 50))
    }
  }, [markets])

  return { connected, lastUpdate }
}

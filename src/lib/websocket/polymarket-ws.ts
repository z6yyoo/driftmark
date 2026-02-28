import { POLYMARKET_WS_URL, WS_HEARTBEAT_INTERVAL, WS_RECONNECT_DELAY } from '../constants'

export type WSPriceUpdate = {
  asset_id: string
  price: number
  timestamp: number
}

type WSCallback = (update: WSPriceUpdate) => void

export class PolymarketWebSocket {
  private ws: WebSocket | null = null
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private callbacks: Set<WSCallback> = new Set()
  private subscribedAssets: Set<string> = new Set()
  private isConnecting = false
  private shouldReconnect = true

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return
    this.isConnecting = true
    this.shouldReconnect = true

    try {
      this.ws = new WebSocket(POLYMARKET_WS_URL)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.startHeartbeat()
        if (this.subscribedAssets.size > 0) {
          this.sendSubscription()
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.length && Array.isArray(data)) {
            for (const item of data) {
              if (item.price !== undefined && item.asset_id) {
                const update: WSPriceUpdate = {
                  asset_id: item.asset_id,
                  price: parseFloat(item.price),
                  timestamp: Date.now(),
                }
                this.callbacks.forEach(cb => cb(update))
              }
            }
          }
        } catch { /* ignore parse errors */ }
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        this.stopHeartbeat()
        if (this.shouldReconnect) {
          this.reconnectTimeout = setTimeout(() => this.connect(), WS_RECONNECT_DELAY)
        }
      }

      this.ws.onerror = () => {
        this.isConnecting = false
      }
    } catch {
      this.isConnecting = false
    }
  }

  subscribe(assetIds: string[]) {
    for (const id of assetIds) {
      this.subscribedAssets.add(id)
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription()
    }
  }

  private sendSubscription() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    const ids = Array.from(this.subscribedAssets)
    if (ids.length === 0) return
    this.ws.send(JSON.stringify({ assets_ids: ids, type: 'market' }))
  }

  onUpdate(callback: WSCallback) {
    this.callbacks.add(callback)
    return () => { this.callbacks.delete(callback) }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('PING')
      }
    }, WS_HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.stopHeartbeat()
    this.ws?.close()
    this.ws = null
    this.callbacks.clear()
    this.subscribedAssets.clear()
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

import { AlertConfig, Platform } from './types'

export const PLATFORM_COLORS: Record<Platform, string> = {
  polymarket: '#3B82F6',
  kalshi: '#8B5CF6',
  opinion: '#EAB308',
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  polymarket: 'Polymarket',
  kalshi: 'Kalshi',
  opinion: 'Opinion',
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  thresholdPercent: 5,
  platforms: {
    polymarket: true,
    kalshi: true,
    opinion: true,
  },
  notificationsEnabled: false,
  soundEnabled: false,
  minProbability: 0.05,
  maxProbability: 0.95,
}

export const MARKET_POLL_INTERVAL = 30_000
export const NEWS_POLL_INTERVAL = 300_000
export const MAX_ALERTS = 500
export const MAX_PRICE_SNAPSHOTS = 2000

export const POLYMARKET_API_ENDPOINTS = {
  gamma: 'https://gamma-api.polymarket.com',
  data: 'https://data-api.polymarket.com',
  clob: 'https://clob.polymarket.com',
} as const

export const POLYMARKET_COLLATERAL_CURRENCY = 'pUSD'

export const REAL_TRADING_ENABLED = false

export const POLYMARKET_TRADING_CONFIG = {
  enabled: REAL_TRADING_ENABLED,
  mode: 'disabled-read-only-viewer',
  collateralCurrency: POLYMARKET_COLLATERAL_CURRENCY,
  clobEndpoint: POLYMARKET_API_ENDPOINTS.clob,
} as const

export const POLYMARKET_WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market'
export const WS_HEARTBEAT_INTERVAL = 10_000
export const WS_RECONNECT_DELAY = 5_000

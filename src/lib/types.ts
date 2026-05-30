export type Platform = 'polymarket' | 'kalshi' | 'opinion'

export interface Outcome {
  label: string
  price: number
  tokenId?: string
}

export interface Market {
  id: string
  platform: Platform
  title: string
  description?: string
  category?: string
  imageUrl?: string
  url: string
  outcomes: Outcome[]
  volume: number
  volume24h: number
  liquidity?: number
  collateralCurrency?: 'pUSD' | 'USD'
  status: 'active' | 'closed' | 'resolved'
  createdAt?: string
  endDate?: string
  slug?: string
  extra?: Record<string, unknown>
}

export interface PolymarketEvent {
  id: string | number
  title?: string
  description?: string
  image?: string
  slug?: string
  volume?: number
  volume24hr?: number
  liquidity?: number
  startDate?: string
  endDate?: string
  markets?: PolymarketRawMarket[]
}

export interface PolymarketRawMarket extends Record<string, unknown> {
  id?: string | number
  question?: string
  groupItemTitle?: string
  outcomes?: string
  outcomePrices?: string
  clobTokenIds?: string
  closed?: boolean
  conditionId?: string
}

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  category?: string
}

export interface PriceSnapshot {
  marketId: string
  platform: Platform
  price: number
  timestamp: number
}

export interface Alert {
  id: string
  marketId: string
  platform: Platform
  marketTitle: string
  previousPrice: number
  currentPrice: number
  changePercent: number
  summary: string
  relatedNews?: NewsItem
  timestamp: number
  read: boolean
}

export interface AlertConfig {
  thresholdPercent: number
  platforms: Record<Platform, boolean>
  notificationsEnabled: boolean
  soundEnabled: boolean
  minProbability: number
  maxProbability: number
}

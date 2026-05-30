import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  POLYMARKET_COLLATERAL_CURRENCY,
  REAL_TRADING_ENABLED,
  POLYMARKET_TRADING_CONFIG,
} from '../constants'
import { fetchPolymarket } from './polymarket'
import type { PolymarketEvent } from '../types'

const sampleEvent: PolymarketEvent = {
  id: 'event-1',
  title: 'Will Driftmark ship v2?',
  description: 'Release check',
  image: 'https://example.com/driftmark.png',
  slug: 'driftmark-v2',
  volume: 5000,
  volume24hr: 900,
  liquidity: 1200,
  startDate: '2026-05-30T00:00:00Z',
  endDate: '2026-06-30T00:00:00Z',
  markets: [
    {
      id: 'market-1',
      question: 'Will Driftmark ship v2?',
      outcomes: '["Yes","No"]',
      outcomePrices: '["0.71","0.29"]',
      clobTokenIds: '["yes-token","no-token"]',
      conditionId: 'condition-1',
      closed: false,
    },
  ],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchPolymarket', () => {
  it('fetches Gamma events through the local proxy and marks pUSD collateral', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [sampleEvent],
    } as Response)

    const markets = await fetchPolymarket(1, 0)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/polymarket?endpoint=events&active=true&closed=false&limit=1&offset=0&order=volume24hr&ascending=false',
    )
    expect(markets).toHaveLength(1)
    expect(markets[0]).toMatchObject({
      id: 'event-1',
      platform: 'polymarket',
      title: 'Will Driftmark ship v2?',
      collateralCurrency: POLYMARKET_COLLATERAL_CURRENCY,
    })
    expect(markets[0].outcomes[0]).toMatchObject({
      label: 'Yes',
      price: 0.71,
      tokenId: 'yes-token',
    })
  })

  it('keeps real trading disabled by config', () => {
    expect(REAL_TRADING_ENABLED).toBe(false)
    expect(POLYMARKET_TRADING_CONFIG).toMatchObject({
      enabled: false,
      mode: 'disabled-read-only-viewer',
      collateralCurrency: 'pUSD',
    })
  })
})

import { Alert, NewsItem } from '../types'
import { PLATFORM_LABELS } from '../constants'

export function generateAlertSummary(
  marketTitle: string,
  platform: Alert['platform'],
  previousPrice: number,
  currentPrice: number,
  relatedNews?: NewsItem
): string {
  const changePercent = Math.abs(currentPrice - previousPrice) * 100
  const direction = currentPrice > previousPrice ? 'surged' : 'dropped'
  const platformName = PLATFORM_LABELS[platform]
  const currentPct = (currentPrice * 100).toFixed(1)

  let summary = `${platformName}: "${marketTitle}" ${direction} ${changePercent.toFixed(1)}% to ${currentPct}%`

  if (relatedNews) {
    summary += `, potentially linked to: "${relatedNews.title}" (${relatedNews.source})`
  }

  return summary
}

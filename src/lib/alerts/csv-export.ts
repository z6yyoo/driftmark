import { Alert } from '../types'

export function alertsToCSV(alerts: Alert[]): string {
  const headers = ['Timestamp', 'Platform', 'Market', 'Previous %', 'Current %', 'Change %', 'Summary', 'Related News URL']
  const rows = alerts.map(a => [
    new Date(a.timestamp).toISOString(),
    a.platform,
    `"${a.marketTitle.replaceAll('"', '""')}"`,
    (a.previousPrice * 100).toFixed(1),
    (a.currentPrice * 100).toFixed(1),
    a.changePercent.toFixed(1),
    `"${a.summary.replaceAll('"', '""')}"`,
    a.relatedNews?.url || '',
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function downloadCSV(alerts: Alert[], filename = 'driftmark-alerts.csv') {
  const csv = alertsToCSV(alerts)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

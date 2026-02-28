'use client'
import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-yellow-200/90">
          <strong>Educational & Research Tool Only.</strong>{' '}
          This dashboard is for informational purposes. It does not constitute financial advice
          or trading recommendations. Market data may be delayed. Always verify with official sources.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss disclaimer"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

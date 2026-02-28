'use client'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert } from '@/lib/types'
import { downloadCSV } from '@/lib/alerts/csv-export'

interface ExportButtonProps {
  alerts: Alert[]
}

export function ExportButton({ alerts }: ExportButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5 cursor-pointer"
          onClick={() => downloadCSV(alerts)}
          disabled={alerts.length === 0}
          aria-label="Export alerts as CSV"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download {alerts.length} alerts as CSV</TooltipContent>
    </Tooltip>
  )
}

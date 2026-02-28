'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAlertStore } from '@/store/alert-store'
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants'
import { Platform } from '@/lib/types'

interface AlertConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlertConfigDialog({ open, onOpenChange }: AlertConfigDialogProps) {
  const { config, updateConfig, togglePlatform } = useAlertStore()

  const platforms: Platform[] = ['polymarket', 'kalshi', 'opinion']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alert Settings</DialogTitle>
          <DialogDescription>
            Configure when you want to receive market movement alerts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="threshold-slider">
                Price change threshold
              </label>
              <span className="text-base font-semibold tabular-nums text-blue-400">
                {config.thresholdPercent}%
              </span>
            </div>
            <Slider
              id="threshold-slider"
              value={[config.thresholdPercent]}
              onValueChange={([v]) => updateConfig({ thresholdPercent: v })}
              min={1}
              max={25}
              step={1}
              className="cursor-pointer"
              aria-label="Price change threshold percentage"
            />
            <p className="text-xs text-muted-foreground">
              Alert when a market's lead probability changes by more than {config.thresholdPercent}%
            </p>
          </div>

          <Separator />

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Platforms</legend>
            {platforms.map((p) => (
              <div key={p} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLORS[p] }}
                  />
                  <label htmlFor={`platform-${p}`} className="text-sm cursor-pointer">
                    {PLATFORM_LABELS[p]}
                  </label>
                </div>
                <Switch
                  id={`platform-${p}`}
                  checked={config.platforms[p]}
                  onCheckedChange={() => togglePlatform(p)}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </fieldset>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="notifications-toggle" className="text-sm cursor-pointer">
                Browser notifications
              </label>
              <Switch
                id="notifications-toggle"
                checked={config.notificationsEnabled}
                onCheckedChange={(v) => updateConfig({ notificationsEnabled: v })}
                className="cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Receive system notifications when alerts trigger
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

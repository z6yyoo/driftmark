'use client'
import Image from 'next/image'
import { Bell, Settings, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAlertStore } from '@/store/alert-store'

interface HeaderProps {
  wsConnected: boolean
  onOpenSettings: () => void
  onOpenAlerts: () => void
}

export function Header({ wsConnected, onOpenSettings, onOpenAlerts }: HeaderProps) {
  const unreadCount = useAlertStore((s) => s.alerts.filter((a) => !a.read).length)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="Driftmark" width={24} height={24} className="rounded-sm" />
            <h1 className="text-base font-semibold tracking-tight">Driftmark</h1>
          </div>
          <Badge variant="outline" className="text-xs font-normal hidden sm:inline-flex">
            Research Tool
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs">
                {wsConnected ? (
                  <>
                    <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-muted-foreground hidden sm:inline">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground hidden sm:inline">Polling</span>
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {wsConnected ? 'WebSocket connected (real-time)' : 'Using polling (30s interval)'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 cursor-pointer"
                onClick={onOpenAlerts}
                aria-label="View alerts"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'No new alerts'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 cursor-pointer"
                onClick={onOpenSettings}
                aria-label="Alert settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alert settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}

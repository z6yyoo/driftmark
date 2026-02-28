'use client'
import { useEffect, useRef } from 'react'
import { useAlertStore } from '@/store/alert-store'

export function useNotifications() {
  const { alerts, config } = useAlertStore()
  const lastAlertRef = useRef<string | null>(null)

  useEffect(() => {
    if (!config.notificationsEnabled) return
    if (typeof window === 'undefined' || !('Notification' in window)) return

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [config.notificationsEnabled])

  useEffect(() => {
    if (!config.notificationsEnabled) return
    if (Notification.permission !== 'granted') return

    const latest = alerts[0]
    if (!latest || latest.id === lastAlertRef.current) return

    lastAlertRef.current = latest.id

    new Notification('Market Alert', {
      body: latest.summary,
      icon: '/favicon.ico',
      tag: latest.id,
    })
  }, [alerts, config.notificationsEnabled])
}

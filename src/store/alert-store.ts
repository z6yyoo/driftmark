import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Alert, AlertConfig, PriceSnapshot, Platform } from '@/lib/types'
import { DEFAULT_ALERT_CONFIG, MAX_ALERTS, MAX_PRICE_SNAPSHOTS } from '@/lib/constants'

interface AlertState {
  alerts: Alert[]
  config: AlertConfig
  snapshots: Record<string, PriceSnapshot>
  addAlert: (alert: Alert) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearAlerts: () => void
  updateConfig: (config: Partial<AlertConfig>) => void
  togglePlatform: (platform: Platform) => void
  setSnapshot: (key: string, snapshot: PriceSnapshot) => void
  setSnapshots: (snapshots: Record<string, PriceSnapshot>) => void
  getUnreadCount: () => number
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      config: DEFAULT_ALERT_CONFIG,
      snapshots: {},

      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts].slice(0, MAX_ALERTS),
        })),

      markRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, read: true })),
        })),

      clearAlerts: () => set({ alerts: [] }),

      updateConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),

      togglePlatform: (platform) =>
        set((state) => ({
          config: {
            ...state.config,
            platforms: {
              ...state.config.platforms,
              [platform]: !state.config.platforms[platform],
            },
          },
        })),

      setSnapshot: (key, snapshot) =>
        set((state) => {
          const updated = { ...state.snapshots, [key]: snapshot }
          const keys = Object.keys(updated)
          if (keys.length > MAX_PRICE_SNAPSHOTS) {
            const sorted = keys
              .map((k) => ({ key: k, ts: updated[k].timestamp }))
              .sort((a, b) => a.ts - b.ts)
            for (let i = 0; i < keys.length - MAX_PRICE_SNAPSHOTS; i++) {
              delete updated[sorted[i].key]
            }
          }
          return { snapshots: updated }
        }),

      setSnapshots: (snapshots) => set({ snapshots }),

      getUnreadCount: () =>
        get().alerts.filter((a) => !a.read).length,
    }),
    {
      name: 'driftmark-storage',
      partialize: (state) => ({
        alerts: state.alerts,
        config: state.config,
        snapshots: state.snapshots,
      }),
    }
  )
)

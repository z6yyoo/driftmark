'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { NewsItem } from '@/lib/types'
import { NEWS_POLL_INTERVAL } from '@/lib/constants'

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef(false)

  const fetchNews = useCallback(async () => {
    if (abortRef.current) return
    try {
      setLoading(true)
      const res = await fetch('/api/news')
      if (!res.ok) throw new Error('Failed to fetch news')
      const items: NewsItem[] = await res.json()
      if (!abortRef.current) {
        setNews(items)
        setError(null)
      }
    } catch (e) {
      if (!abortRef.current) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    } finally {
      if (!abortRef.current) {
        setLoading(false)
        timeoutRef.current = setTimeout(fetchNews, NEWS_POLL_INTERVAL)
      }
    }
  }, [])

  useEffect(() => {
    abortRef.current = false
    fetchNews()
    return () => {
      abortRef.current = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [fetchNews])

  return { news, loading, error }
}

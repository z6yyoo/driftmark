import { NextRequest, NextResponse } from 'next/server'

const OPINION_PUBLIC_API = 'https://proxy.opinion.trade:8443/api/bsc/api/v2'

const PUBLIC_ENDPOINTS = ['topic', 'label', 'indicator', 'currency', 'activity']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') || 'topic'

  if (endpoint.includes('..') || !PUBLIC_ENDPOINTS.some(e => endpoint === e || endpoint.startsWith(e + '/'))) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  const params = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') params.set(key, value)
  })

  try {
    const queryStr = params.toString()
    const url = `${OPINION_PUBLIC_API}/${endpoint}${queryStr ? `?${queryStr}` : ''}`

    const res = await fetch(url, {
      next: { revalidate: 30 },
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

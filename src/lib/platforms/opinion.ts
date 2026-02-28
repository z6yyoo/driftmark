import { Market } from '../types'

export async function fetchOpinion(limit: number, page: number): Promise<Market[]> {
  const res = await fetch(
    `/api/opinion?endpoint=topic&sortBy=5&chainId=56&limit=${limit}&status=2&isShow=1&topicType=2&page=${page}&indicatorType=0&excludePin=1`
  )
  if (!res.ok) throw new Error('Failed to fetch Opinion data')
  const data = await res.json()

  if (data.error) throw new Error(data.error)
  const items = data.result?.list || []
  if (!Array.isArray(items)) return []

  return items.map((topic: Record<string, unknown>) => {
    const children = (topic.childList || []) as Record<string, unknown>[]
    const outcomes: { label: string; price: number; tokenId?: string }[] = []

    if (children.length > 1) {
      for (const child of children.slice(0, 10)) {
        const yesBuy = parseFloat((child.yesBuyPrice as string) || '0')
        const noBuy = parseFloat((child.noBuyPrice as string) || '0')
        const price = yesBuy > 0 ? yesBuy : (noBuy > 0 ? 1 - noBuy : 0.5)
        outcomes.push({
          label: (child.title as string) || 'Option',
          price,
          tokenId: child.yesPos as string,
        })
      }
      outcomes.sort((a, b) => b.price - a.price)
    } else if (children.length === 1) {
      const child = children[0]
      const yesBuy = parseFloat((child.yesBuyPrice as string) || '0')
      const noBuy = parseFloat((child.noBuyPrice as string) || '0')
      const yesPrice = yesBuy > 0 ? yesBuy : (noBuy > 0 ? 1 - noBuy : 0.5)
      outcomes.push(
        { label: (child.yesLabel as string) || 'Yes', price: yesPrice, tokenId: child.yesPos as string },
        { label: (child.noLabel as string) || 'No', price: 1 - yesPrice, tokenId: child.noPos as string },
      )
    } else {
      const yesBuy = parseFloat((topic.yesBuyPrice as string) || '0')
      const noBuy = parseFloat((topic.noBuyPrice as string) || '0')
      const yesPrice = yesBuy > 0 ? yesBuy : (noBuy > 0 ? 1 - noBuy : 0.5)
      outcomes.push({ label: 'Yes', price: yesPrice }, { label: 'No', price: 1 - yesPrice })
    }

    const cutoffTime = topic.cutoffTime as number
    const endDate = cutoffTime ? new Date(cutoffTime * 1000).toISOString() : undefined
    const labels = (topic.labelName || []) as string[]

    return {
      id: String(topic.topicId),
      platform: 'opinion' as const,
      title: (topic.title as string) || (topic.titleShort as string) || '',
      description: (topic.abstract as string) || (topic.content as string) || '',
      category: labels.find((l: string) => l && l.trim()) || undefined,
      imageUrl: (topic.thumbnailUrl as string) || undefined,
      url: `https://app.opinion.trade/topic/${topic.topicId}`,
      outcomes,
      volume: parseFloat(String(topic.volume || 0)),
      volume24h: parseFloat(String(topic.volume24h || 0)),
      status: 'active' as const,
      endDate,
      slug: String(topic.topicId),
      extra: { chainId: topic.chainId, topicType: topic.topicType },
    }
  })
}

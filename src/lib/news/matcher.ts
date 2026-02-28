import { Market, NewsItem } from '../types'

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'but', 'and', 'or',
  'if', 'while', 'about', 'up', 'its', 'it', 'this', 'that', 'what',
  'which', 'who', 'whom', 'these', 'those', 'am', 'new', 'says', 'said',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))
  )
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const word of a) {
    if (b.has(word)) intersection++
  }
  const union = a.size + b.size - intersection
  return union > 0 ? intersection / union : 0
}

const MATCH_THRESHOLD = 0.08

export function matchNewsToMarket(news: NewsItem, market: Market): number {
  const newsTokens = tokenize(`${news.title} ${news.description}`)
  const marketTokens = tokenize(`${market.title} ${market.description || ''}`)
  return jaccardSimilarity(newsTokens, marketTokens)
}

export function findRelatedNews(market: Market, newsItems: NewsItem[]): NewsItem | undefined {
  let bestMatch: NewsItem | undefined
  let bestScore = MATCH_THRESHOLD

  for (const news of newsItems) {
    const score = matchNewsToMarket(news, market)
    if (score > bestScore) {
      bestScore = score
      bestMatch = news
    }
  }

  return bestMatch
}

export function findRelatedMarkets(news: NewsItem, markets: Market[]): Market[] {
  return markets
    .map(market => ({ market, score: matchNewsToMarket(news, market) }))
    .filter(({ score }) => score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ market }) => market)
}

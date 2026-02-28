export interface FeedSource {
  name: string
  url: string
  category: string
}

export const RSS_FEEDS: FeedSource[] = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'business' },
  { name: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'tech' },
  { name: 'CNBC Top', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', category: 'business' },
  { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best', category: 'world' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'general' },
]

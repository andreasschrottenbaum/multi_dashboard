import React, { useState, useEffect } from 'react'

interface NewsItem {
  id: string
  title: string
  url?: string
  source: string
  timestamp?: number
}

type NewsSource = 'hackernews' | 'devto' | 'reddit'

const NEWS_SOURCES: Record<NewsSource, { name: string; fetch: () => Promise<NewsItem[]> }> = {
  hackernews: {
    name: 'Hacker News',
    fetch: async () => {
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      const ids = (await res.json()).slice(0, 10)
      const items = await Promise.all(
        ids.map((id: number) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json())
        )
      )
      return items.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        source: 'Hacker News',
        timestamp: item.time,
      }))
    },
  },
  devto: {
    name: 'DEV.to',
    fetch: async () => {
      try {
        const res = await fetch('https://dev.to/api/articles?per_page=10&sort_by=latest')
        const items = await res.json()
        return items.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          url: item.url,
          source: 'DEV.to',
          timestamp: new Date(item.published_at).getTime(),
        }))
      } catch (e) {
        console.error('DEV.to fetch failed:', e)
        return []
      }
    },
  },
  reddit: {
    name: 'Reddit (r/programming)',
    fetch: async () => {
      try {
        const res = await fetch('https://www.reddit.com/r/programming/hot.json')
        const data = await res.json()
        const posts = data.data.children || []
        return posts.slice(0, 10).map((post: any) => ({
          id: post.data.id,
          title: post.data.title,
          url: `https://reddit.com${post.data.permalink}`,
          source: 'Reddit',
          timestamp: post.data.created_utc * 1000,
        }))
      } catch (e) {
        console.error('Reddit fetch failed:', e)
        return []
      }
    },
  }
}

export default function NewsTicker() {
  const [source, setSource] = useState<NewsSource>('hackernews')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true)
      setError(null)
      try {
        const items = await NEWS_SOURCES[source].fetch()
        setNews(items)
      } catch (err) {
        setError('Failed to load news')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [source])

  // Listen for reset event from dashboard
  useEffect(() => {
    const handleReset = () => {
      setSource('hackernews')
    }
    const handleFlip = () => {
      setIsFlipped(prev => !prev)
    }
    window.addEventListener('reset-widgets', handleReset)
    window.addEventListener('toggle-flip-react', handleFlip)
    return () => {
      window.removeEventListener('reset-widgets', handleReset)
      window.removeEventListener('toggle-flip-react', handleFlip)
    }
  }, [])

  return (
    <div className="widget-flipper">
      <div className={`widget-flip-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className="widget-flip-front">
          <div className="news-ticker">
      <div className="news-source-selector">
        <label htmlFor="source-select">News Source:</label>
        <select
          id="source-select"
          value={source}
          onChange={(e) => setSource(e.target.value as NewsSource)}
        >
          {(Object.entries(NEWS_SOURCES) as [NewsSource, typeof NEWS_SOURCES[NewsSource]][]).map(
            ([key, val]) => (
              <option key={key} value={key}>
                {val.name}
              </option>
            )
          )}
        </select>
      </div>

      {loading && <p className="news-loading">Loading news...</p>}
      {error && <p className="news-error">{error}</p>}

      {!loading && 
        <div className="news-list">
            {news.map((item) => (
            <div key={item.id} className="news-item">
                {item.url && item.url !== '#' ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                </a>
                ) : (
                <span>{item.title}</span>
                )}
            </div>
            ))}
        </div>
      }
    </div>
        </div>
        <div className="widget-flip-back">
          <div style={{ padding: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>News Ticker</h3>
            <p><strong>Description:</strong> Aggregate news from multiple sources including Hacker News, DEV.to, and Reddit.</p>
            <p><strong>Features:</strong> Multiple news source selection, real-time updates, external links to articles.</p>
            <p><strong>Data Sources:</strong> Hacker News API, DEV.to API, Reddit API</p>
          </div>
        </div>
      </div>
    </div>
  )
}

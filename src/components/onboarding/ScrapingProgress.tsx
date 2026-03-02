import { useEffect } from 'react'
import type { Business } from '../../types'
import { SiteStatus } from '../dashboard/SiteStatus'

interface ScrapingProgressProps {
  business: Business
  onRefresh: (id: string) => void
}

export function ScrapingProgress({ business, onRefresh }: ScrapingProgressProps) {
  useEffect(() => {
    if (business.scrape_status !== 'scraping') return

    const interval = setInterval(() => {
      onRefresh(business.id)
    }, 3000)

    return () => clearInterval(interval)
  }, [business.id, business.scrape_status, onRefresh])

  return (
    <div className="flex items-center gap-3">
      <SiteStatus status={business.scrape_status} />
      {business.scrape_status === 'completed' && (
        <span className="text-sm text-bp-text-secondary">
          {business.pages_scraped} page{business.pages_scraped !== 1 ? 's' : ''} scraped
        </span>
      )}
    </div>
  )
}

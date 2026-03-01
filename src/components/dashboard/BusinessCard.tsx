import type { Business } from '../../types'
import { SiteStatus } from './SiteStatus'

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
          <a
            href={business.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {business.url}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <SiteStatus status={business.scrape_status} />
          {business.scrape_status === 'completed' && (
            <span className="text-sm text-gray-500">
              {business.pages_scraped} page{business.pages_scraped !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { SiteStatus } from './SiteStatus'
import { ScrapingProgress } from '../onboarding/ScrapingProgress'

export function Dashboard() {
  const { businesses, loading, refreshBusiness } = useBusiness()
  const navigate = useNavigate()

  const handleScrape = async (businessId: string, url: string) => {
    try {
      await supabase.functions.invoke('scrape', {
        body: { business_id: businessId, url },
      })
    } catch (err) {
      console.error('Scrape failed:', err)
    }
    // Start polling
    refreshBusiness(businessId)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to BizPilot</h2>
        <p className="mt-2 text-gray-600">Get started by adding your business.</p>
        <Button onClick={() => navigate('/onboarding')} className="mt-4">
          Add Your Business
        </Button>
      </div>
    )
  }

  const business = businesses[0]
  const chatLink = `${window.location.origin}/chat/${business.id}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
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
          <ScrapingProgress business={business} onRefresh={refreshBusiness} />
        </div>

        <div className="flex items-center gap-3">
          {(business.scrape_status === 'pending' || business.scrape_status === 'failed') && (
            <Button
              onClick={() => handleScrape(business.id, business.url)}
            >
              {business.scrape_status === 'failed' ? 'Retry Scrape' : 'Scrape Website'}
            </Button>
          )}
          {business.scrape_status === 'scraping' && (
            <SiteStatus status="scraping" />
          )}
        </div>

        {business.scrape_status === 'completed' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">Share your chat link:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={chatLink}
                className="flex-1 text-sm bg-white border border-gray-300 rounded px-3 py-2"
              />
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(chatLink)}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

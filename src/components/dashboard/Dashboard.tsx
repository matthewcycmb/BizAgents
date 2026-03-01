import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { useLeads } from '../../hooks/useLeads'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { BusinessCard } from './BusinessCard'
import { LeadTable } from './LeadTable'
import { ScrapingProgress } from '../onboarding/ScrapingProgress'

export function Dashboard() {
  const { businesses, loading, refreshBusiness } = useBusiness()
  const navigate = useNavigate()

  const business = businesses[0]
  const { leads, loading: leadsLoading, updateLeadStatus } = useLeads(business?.id)

  const handleScrape = async (businessId: string, url: string) => {
    // Optimistically update status
    refreshBusiness(businessId)
    try {
      await supabase.functions.invoke('scrape', {
        body: { business_id: businessId, url },
      })
    } catch (err) {
      console.error('Scrape failed:', err)
    }
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

  const chatLink = `${window.location.origin}/chat/${business.id}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Business Card */}
      <BusinessCard business={business} />

      {/* Scraping Controls */}
      <div className="flex items-center gap-4">
        {(business.scrape_status === 'pending' || business.scrape_status === 'failed') && (
          <Button onClick={() => handleScrape(business.id, business.url)}>
            {business.scrape_status === 'failed' ? 'Retry Scrape' : 'Scrape Website'}
          </Button>
        )}
        {business.scrape_status === 'scraping' && (
          <ScrapingProgress business={business} onRefresh={refreshBusiness} />
        )}
      </div>

      {/* Chat Link */}
      {business.scrape_status === 'completed' && (
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-700 mb-2">Shareable chat link:</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={chatLink}
              className="flex-1 text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2"
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

      {/* Leads Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads</h3>
        <LeadTable
          leads={leads}
          loading={leadsLoading}
          onStatusChange={updateLeadStatus}
        />
      </div>
    </div>
  )
}

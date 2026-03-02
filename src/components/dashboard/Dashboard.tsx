import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { useChat } from '../../hooks/useChat'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { BusinessCard } from './BusinessCard'
import { ScrapingProgress } from '../onboarding/ScrapingProgress'
import { ChatWindow } from '../chat/ChatWindow'

export function Dashboard() {
  const { businesses, loading, refreshBusiness } = useBusiness()
  const navigate = useNavigate()

  const business = businesses[0]

  const handleScrape = async (businessId: string, url: string) => {
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

      {/* Chat — embedded directly in dashboard */}
      {business.scrape_status === 'completed' && (
        <DashboardChat businessId={business.id} />
      )}
    </div>
  )
}

function DashboardChat({ businessId }: { businessId: string }) {
  const { messages, loading, error, businessName, sendMessage } = useChat(businessId)

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
      <ChatWindow
        messages={messages}
        loading={loading}
        error={error}
        businessName={businessName || 'BizPilot Copilot'}
        onSend={sendMessage}
      />
    </div>
  )
}

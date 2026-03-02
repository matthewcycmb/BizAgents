import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { useChat } from '../../hooks/useChat'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { ScrapingProgress } from '../onboarding/ScrapingProgress'
import { ChatWindow } from '../chat/ChatWindow'

export function Dashboard() {
  const { businesses, loading, refreshBusiness } = useBusiness()
  const { user } = useAuth()
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 bg-gray-100 rounded w-48 mx-auto" />
          <div className="h-32 bg-gray-100 rounded w-96 mx-auto" />
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-2">Welcome to BizPilot</h2>
        <p className="text-lg text-gray-400 font-light mb-12">Get started by adding your business.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Add Your Business
        </button>
      </div>
    )
  }

  // Scraping states - show centered UI
  if (business.scrape_status === 'pending' || business.scrape_status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <h2 className="text-lg text-gray-500 mb-2 font-light">Hello, {user?.email?.split('@')[0]}</h2>
        <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-12">Let's analyze your business</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-10 max-w-md text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">{business.name}</h3>
          <p className="text-sm text-gray-500 mb-8">{business.url}</p>
          <button
            onClick={() => handleScrape(business.id, business.url)}
            className="w-full py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            {business.scrape_status === 'failed' ? 'Retry Analysis' : 'Start Analysis'}
          </button>
          {business.scrape_status === 'failed' && (
            <p className="text-sm text-red-600 mt-4">Previous analysis failed. Please try again.</p>
          )}
        </div>
      </div>
    )
  }

  if (business.scrape_status === 'scraping') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <h2 className="text-lg text-gray-500 mb-2 font-light">Analyzing your business...</h2>
        <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-12">This may take a few moments</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-10 max-w-md">
          <ScrapingProgress business={business} onRefresh={refreshBusiness} />
        </div>
      </div>
    )
  }

  // Chat interface - scraping completed
  return <DashboardChat businessId={business.id} userName={user?.email || 'there'} />
}

function DashboardChat({ businessId, userName }: { businessId: string; userName: string }) {
  const { messages, loading, error, businessName, sendMessage } = useChat(businessId)

  return (
    <ChatWindow
      messages={messages}
      loading={loading}
      error={error}
      businessName={businessName || 'BizPilot'}
      userName={userName}
      onSend={sendMessage}
    />
  )
}

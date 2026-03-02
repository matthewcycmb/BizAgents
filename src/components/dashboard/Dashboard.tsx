import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { useChat } from '../../hooks/useChat'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
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
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
          <div className="h-32 bg-gray-200 rounded w-96 mx-auto" />
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-500 blur-2xl opacity-40 mb-8" />
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome to BizPilot</h2>
        <p className="text-lg text-gray-600 mb-8">Get started by adding your business.</p>
        <Button onClick={() => navigate('/onboarding')} className="px-6 py-3">
          Add Your Business
        </Button>
      </div>
    )
  }

  // Scraping states - show centered UI
  if (business.scrape_status === 'pending' || business.scrape_status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-500 blur-2xl opacity-40 mb-8" />
        <h2 className="text-2xl text-gray-600 mb-2">Hello, {user?.email}</h2>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Let's analyze your business</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{business.name}</h3>
          <p className="text-sm text-indigo-600 mb-6">{business.url}</p>
          <Button
            onClick={() => handleScrape(business.id, business.url)}
            className="w-full py-3"
          >
            {business.scrape_status === 'failed' ? 'Retry Analysis' : 'Start Analysis'}
          </Button>
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
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-500 blur-2xl opacity-40 mb-8 animate-pulse" />
        <h2 className="text-2xl text-gray-600 mb-2">Analyzing your business...</h2>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">This may take a few moments</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
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

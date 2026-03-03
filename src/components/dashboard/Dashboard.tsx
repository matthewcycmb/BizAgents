import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { useAuth } from '../../hooks/useAuth'
import { useConversationContext } from '../../hooks/useConversationContext'
import { supabase } from '../../lib/supabase'
import { ScrapingProgress } from '../onboarding/ScrapingProgress'
import { ChatWindow } from '../chat/ChatWindow'
import { useChat } from '../../hooks/useChat'
import { useEffect } from 'react'

export function Dashboard() {
  const { businesses, loading, refreshBusiness } = useBusiness()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { activeBusinessId, chatKey } = useConversationContext()

  const business = businesses.find((b) => b.id === activeBusinessId) || businesses[0]

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
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 bg-bp-bg-card rounded w-48 mx-auto" />
          <div className="h-32 bg-bp-bg-card rounded w-96 mx-auto" />
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <h2 className="font-display text-3xl font-bold text-bp-text-primary mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          Welcome to BizPilot
        </h2>
        <p className="text-lg text-bp-text-secondary mb-12" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          Get started by adding your business.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="px-8 py-3 rounded-full bg-gradient-to-br from-bp-accent to-bp-accent-dim text-white font-semibold hover:opacity-90 hover:scale-105 transition-all shadow-[0_4px_12px_rgba(230,57,70,0.3)]"
        >
          Add Your Business
        </button>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <h2 className="font-display text-3xl font-bold text-bp-text-primary mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          Welcome to BizPilot
        </h2>
        <p className="text-lg text-bp-text-secondary" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          Select a business to start chatting.
        </p>
      </div>
    )
  }

  // Scraping states
  if (business.scrape_status === 'pending' || business.scrape_status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <h2 className="text-lg text-bp-text-secondary mb-2" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          Hello, {user?.email?.split('@')[0]}
        </h2>
        <h1 className="font-display text-3xl font-bold text-bp-text-primary mb-12" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          Let's analyze your business
        </h1>
        <div className="bg-bp-bg-card/85 backdrop-blur-xl rounded-[14px] border border-bp-border p-10 max-w-md text-center">
          <h3 className="text-xl font-semibold text-bp-text-primary mb-2">{business.name}</h3>
          <p className="text-sm text-bp-text-secondary mb-8">{business.url}</p>
          <button
            onClick={() => handleScrape(business.id, business.url)}
            className="w-full py-3 rounded-full bg-gradient-to-br from-bp-accent to-bp-accent-dim text-white font-semibold hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(230,57,70,0.3)]"
          >
            {business.scrape_status === 'failed' ? 'Retry Analysis' : 'Start Analysis'}
          </button>
          {business.scrape_status === 'failed' && (
            <p className="text-sm text-bp-accent mt-4">Previous analysis failed. Please try again.</p>
          )}
        </div>
      </div>
    )
  }

  if (business.scrape_status === 'scraping') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <h2 className="text-lg text-bp-text-secondary mb-2" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          Analyzing your business...
        </h2>
        <h1 className="font-display text-3xl font-bold text-bp-text-primary mb-12" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          This may take a few moments
        </h1>
        <div className="bg-bp-bg-card/85 backdrop-blur-xl rounded-[14px] border border-bp-border p-10 max-w-md">
          <ScrapingProgress business={business} onRefresh={refreshBusiness} />
        </div>
      </div>
    )
  }

  // Chat interface - scraping completed
  return <DashboardChat key={chatKey} businessId={business.id} userName={user?.email || 'there'} />
}

function DashboardChat({ businessId, userName }: { businessId: string; userName: string }) {
  const { activeConversationId, triggerRefresh } = useConversationContext()
  const { messages, loading, error, businessName, sendMessage, conversationId } = useChat(businessId, activeConversationId)

  // When a new conversation is created (first message sent), refresh the sidebar list
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      triggerRefresh()
    }
  }, [conversationId, activeConversationId, triggerRefresh])

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

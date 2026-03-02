import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../hooks/useBusiness'
import { supabase } from '../lib/supabase'
import { SiteStatus } from '../components/dashboard/SiteStatus'
import { ScrapingProgress } from '../components/onboarding/ScrapingProgress'
import { useState } from 'react'

export function MyBusinessPage() {
  const { businesses, loading, refreshBusiness } = useBusiness()
  const navigate = useNavigate()
  const [scraping, setScraping] = useState(false)

  const business = businesses[0]

  const handleScrape = async () => {
    if (!business) return
    setScraping(true)
    try {
      await supabase.functions.invoke('scrape', {
        body: { business_id: business.id, url: business.url },
      })
    } catch (err) {
      console.error('Scrape failed:', err)
    }
    await refreshBusiness(business.id)
    setScraping(false)
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

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-2">No business yet</h2>
        <p className="text-lg text-gray-400 font-light mb-12">Add your business to get started.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Add Your Business
        </button>
      </div>
    )
  }

  const chatUrl = `${window.location.origin}/chat/${business.id}`

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-10">My Business</h1>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {/* Business name & status */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-gray-900">{business.name}</h2>
            <a
              href={business.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {business.url}
            </a>
          </div>
          <SiteStatus status={business.scrape_status} />
        </div>

        {/* Scraping details */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Site Analysis</h3>

          {business.scrape_status === 'completed' && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                {business.pages_scraped} page{business.pages_scraped !== 1 ? 's' : ''} analyzed
              </p>
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {scraping ? 'Re-analyzing...' : 'Re-analyze'}
              </button>
            </div>
          )}

          {business.scrape_status === 'scraping' && (
            <ScrapingProgress business={business} onRefresh={refreshBusiness} />
          )}

          {(business.scrape_status === 'pending' || business.scrape_status === 'failed') && (
            <div>
              {business.scrape_status === 'failed' && (
                <p className="text-sm text-red-600 mb-3">Previous analysis failed. Please try again.</p>
              )}
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {scraping ? 'Starting...' : business.scrape_status === 'failed' ? 'Retry Analysis' : 'Start Analysis'}
              </button>
            </div>
          )}
        </div>

        {/* Public chatbot link */}
        {business.scrape_status === 'completed' && (
          <div className="p-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Customer Chatbot</h3>
            <p className="text-sm text-gray-600">Share this link with customers so they can chat with your AI assistant.</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={chatUrl}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
              />
              <button
                onClick={() => navigator.clipboard.writeText(chatUrl)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="p-6">
          <p className="text-xs text-gray-400">
            Added {new Date(business.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

import { useBusiness } from '../hooks/useBusiness'
import { supabase } from '../lib/supabase'
import { SiteStatus } from '../components/dashboard/SiteStatus'
import { ScrapingProgress } from '../components/onboarding/ScrapingProgress'
import { useState } from 'react'
import type { Business } from '../types'

export function MyBusinessPage() {
  const { businesses, loading, createBusiness, updateBusiness, refreshBusiness } = useBusiness()
  const [scrapingIds, setScrapingIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [creating, setCreating] = useState(false)

  const handleScrape = async (business: Business) => {
    setScrapingIds((prev) => new Set(prev).add(business.id))
    try {
      await supabase.functions.invoke('scrape', {
        body: { business_id: business.id, url: business.url },
      })
    } catch (err) {
      console.error('Scrape failed:', err)
    }
    await refreshBusiness(business.id)
    setScrapingIds((prev) => {
      const next = new Set(prev)
      next.delete(business.id)
      return next
    })
  }

  const startEdit = (business: Business) => {
    setEditingId(business.id)
    setEditName(business.name)
    setEditUrl(business.url)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditUrl('')
  }

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !editUrl.trim()) return
    try {
      await updateBusiness(editingId, { name: editName.trim(), url: editUrl.trim() })
      setEditingId(null)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim() || !newUrl.trim()) return
    setCreating(true)
    try {
      const business = await createBusiness(newName.trim(), newUrl.trim())
      setShowAddForm(false)
      setNewName('')
      setNewUrl('')
      // Auto-trigger scrape
      handleScrape(business)
    } catch (err) {
      console.error('Create failed:', err)
    }
    setCreating(false)
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

  if (businesses.length === 0 && !showAddForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-2">No business yet</h2>
        <p className="text-lg text-gray-400 font-light mb-12">Add your business to get started.</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Add Your Business
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">My Businesses</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Add Business
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Add business form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">New Business</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Business name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                autoFocus
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  disabled={creating || !newName.trim() || !newUrl.trim()}
                  className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewName(''); setNewUrl('') }}
                  className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Business cards */}
        {businesses.map((business) => {
          const isEditing = editingId === business.id
          const isScraping = scrapingIds.has(business.id)
          const chatUrl = `${window.location.origin}/chat/${business.id}`

          return (
            <div key={business.id} className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {/* Business name & status */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={saveEdit}
                          className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <SiteStatus status={business.scrape_status} />
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(business)}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
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
                      onClick={() => handleScrape(business)}
                      disabled={isScraping}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                    >
                      {isScraping ? 'Re-analyzing...' : 'Re-analyze'}
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
                      onClick={() => handleScrape(business)}
                      disabled={isScraping}
                      className="px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isScraping ? 'Starting...' : business.scrape_status === 'failed' ? 'Retry Analysis' : 'Start Analysis'}
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
          )
        })}
      </div>
    </div>
  )
}

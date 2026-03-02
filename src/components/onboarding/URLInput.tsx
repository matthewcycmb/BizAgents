import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function URLInput() {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { createBusiness } = useBusiness()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createBusiness(name, url)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h2 className="font-display text-2xl font-bold text-bp-text-primary mb-2">Add Your Business</h2>
      <p className="text-bp-text-secondary mb-8">
        Enter your business details and website URL. We'll scrape your site to power your AI chatbot.
      </p>
      <form onSubmit={handleSubmit} className="bg-bp-bg-card/85 backdrop-blur-xl p-6 rounded-[14px] border border-bp-border space-y-6">
        {error && (
          <div className="bg-bp-accent/10 text-bp-accent-light p-3 rounded-lg text-sm">{error}</div>
        )}
        <Input
          id="name"
          label="Business Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Joe's Plumbing"
        />
        <Input
          id="url"
          label="Website URL"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Business'}
        </Button>
      </form>
    </div>
  )
}

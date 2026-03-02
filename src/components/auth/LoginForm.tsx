import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bp-bg-main relative overflow-hidden px-4">
      {/* Flower background */}
      <div className="fixed inset-0 z-0">
        <img src="/bg-flowers.webp" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-bp-bg-main/60 backdrop-blur-[18px]" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-[9px] overflow-hidden">
              <img src="/logo-rose.png" alt="BizPilot" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-bp-text-primary">BizPilot</h1>
          </div>
          <h2 className="text-sm text-bp-text-secondary">Sign in to continue</h2>
        </div>
        <form onSubmit={handleSubmit} className="bg-bp-bg-card/85 backdrop-blur-xl rounded-[14px] border border-bp-border p-8 space-y-6">
          {error && (
            <p className="text-sm text-bp-accent text-center">{error}</p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-bp-text-primary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 text-base bg-bp-bg-input border border-bp-border rounded-lg text-bp-text-primary placeholder:text-bp-text-muted focus:outline-none focus:border-bp-accent-green transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-bp-text-primary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 text-base bg-bp-bg-input border border-bp-border rounded-lg text-bp-text-primary placeholder:text-bp-text-muted focus:outline-none focus:border-bp-accent-green transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full text-white bg-gradient-to-br from-bp-accent to-bp-accent-dim hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-[0_4px_12px_rgba(230,57,70,0.3)]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-bp-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-bp-text-primary hover:text-bp-accent-light transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

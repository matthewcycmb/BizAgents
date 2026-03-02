import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bp-bg-main px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-bp-text-muted">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-bp-text-primary">Page not found</h2>
        <p className="mt-2 text-bp-text-secondary">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-6 py-2 rounded-full bg-gradient-to-br from-bp-accent to-bp-accent-dim text-white font-medium hover:opacity-90 transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}

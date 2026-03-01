import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/dashboard" className="text-xl font-bold text-indigo-600">
              BizPilot
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

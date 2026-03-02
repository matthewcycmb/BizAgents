import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-xl font-light tracking-tight text-gray-900">BizPilot</h1>
          </div>

          {/* New chat button */}
          <div className="p-6">
            <button className="w-full border border-gray-300 text-gray-700 rounded-lg py-3 px-4 text-sm font-medium hover:bg-gray-50 transition-colors">
              New chat
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-6 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm ${
                isActive('/dashboard')
                  ? 'font-semibold text-gray-900 border-l-2 border-gray-900 pl-2'
                  : 'font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/my-business"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm ${
                isActive('/my-business')
                  ? 'font-semibold text-gray-900 border-l-2 border-gray-900 pl-2'
                  : 'font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>My Business</span>
            </Link>
          </nav>

          {/* User profile section */}
          {user && (
            <div className="border-t border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-lg font-light tracking-tight text-gray-900">BizPilot</span>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBusiness } from '../hooks/useBusiness'
import { useConversations } from '../hooks/useConversations'
import { useConversationContext } from '../hooks/useConversationContext'
import { useState, useEffect, useRef } from 'react'

export function Layout() {
  const { user, signOut } = useAuth()
  const { businesses } = useBusiness()
  const { conversations, fetchConversations } = useConversations()
  const { activeConversationId, setActiveConversationId, setActiveBusinessId, newChat, refreshKey } = useConversationContext()

  // Re-fetch conversations when a new one is created
  useEffect(() => {
    if (refreshKey > 0) {
      fetchConversations()
    }
  }, [refreshKey, fetchConversations])
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPicker])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const handleNewChat = () => {
    if (businesses.length >= 2) {
      setShowPicker(true)
    } else {
      newChat(businesses[0]?.id)
      navigate('/dashboard')
      setSidebarOpen(false)
    }
  }

  const handlePickBusiness = (businessId: string) => {
    newChat(businessId)
    setShowPicker(false)
    navigate('/dashboard')
    setSidebarOpen(false)
  }

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setActiveBusinessId(conv.business_id)
    }
    setActiveConversationId(id)
    navigate('/dashboard')
    setSidebarOpen(false)
  }

  return (
    <div className="h-screen bg-bp-bg-main relative overflow-hidden flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Dashboard container — Apple-style glossy fullscreen shell */}
      <div className="dashboard-glass relative z-10 flex w-full h-full overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`sidebar-glass fixed lg:relative top-0 left-0 h-full w-[272px] z-50 flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
          style={{ padding: '24px 16px 16px' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center overflow-hidden">
              <img src="/logo-rose.png" alt="BizPilot" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-extrabold text-xl text-bp-text-primary">BizPilot</span>
          </div>

          {/* New chat button */}
          <div className="relative mb-6" ref={pickerRef}>
            <button
              onClick={handleNewChat}
              className="flex items-center justify-center gap-2 w-full py-3 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-bp-text-primary text-sm font-semibold hover:bg-white/[0.06] hover:border-bp-accent-green/40 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4 text-bp-text-secondary">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New chat
            </button>

            {/* Business picker popover */}
            {showPicker && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-bp-bg-card border border-bp-border rounded-xl shadow-lg z-10 py-1">
                <p className="px-3 py-2 text-[10px] font-bold text-bp-text-muted uppercase tracking-[1.5px]">Select business</p>
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handlePickBusiness(b.id)}
                    className="w-full text-left px-3 py-2 text-sm text-bp-text-secondary hover:bg-bp-bg-card-hover hover:text-bp-text-primary transition-colors truncate"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-0.5 mb-7">
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`relative flex items-center gap-3 py-2.5 px-3 rounded-[10px] text-sm transition-all ${
                isActive('/dashboard')
                  ? 'text-bp-text-primary font-semibold'
                  : 'text-bp-text-secondary font-medium hover:bg-bp-bg-card hover:text-bp-text-primary'
              }`}
            >
              {isActive('/dashboard') && (
                <span className="absolute -left-1 top-1.5 bottom-1.5 w-[3px] rounded bg-bp-accent" />
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-[18px] h-[18px] shrink-0">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </Link>

            <Link
              to="/my-business"
              onClick={() => setSidebarOpen(false)}
              className={`relative flex items-center gap-3 py-2.5 px-3 rounded-[10px] text-sm transition-all ${
                isActive('/my-business')
                  ? 'text-bp-text-primary font-semibold'
                  : 'text-bp-text-secondary font-medium hover:bg-bp-bg-card hover:text-bp-text-primary'
              }`}
            >
              {isActive('/my-business') && (
                <span className="absolute -left-1 top-1.5 bottom-1.5 w-[3px] rounded bg-bp-accent" />
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-[18px] h-[18px] shrink-0">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              My Businesses
            </Link>
          </nav>

          {/* Recent Chats */}
          {conversations.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-bp-text-muted px-2 mb-2.5">Recent Chats</p>
              <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`py-2 px-3 rounded-lg text-[13px] text-left truncate transition-all ${
                      activeConversationId === conv.id
                        ? 'bg-bp-bg-card text-bp-text-primary'
                        : 'text-bp-text-secondary hover:bg-bp-bg-card hover:text-bp-text-primary'
                    }`}
                    title={conv.title}
                  >
                    {conv.title}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* User footer */}
          {user && (
            <div className="mt-auto pt-4 border-t border-bp-border flex items-center justify-between gap-2">
              <span className="text-xs text-bp-text-secondary truncate">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-bp-text-muted px-2 py-1 rounded-md hover:text-bp-accent-light hover:bg-bp-accent/[0.08] transition-colors whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Flower background inside main panel */}
          <div className="absolute inset-0 z-0">
            <img src="/bg-flowers.webp" alt="" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 35%, rgba(0,0,0,0.5), rgba(0,0,0,0.85) 65%, rgba(0,0,0,0.95) 100%)' }} />
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.5)' }} />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden absolute top-4 left-4 z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-bp-bg-card/80 backdrop-blur-sm border border-bp-border text-bp-text-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Page content (z-1 to stay above the background) */}
          <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

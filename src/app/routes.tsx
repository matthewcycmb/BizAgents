import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { AuthGuard } from '../components/auth/AuthGuard'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
import { URLInput } from '../components/onboarding/URLInput'

function DashboardPlaceholder() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-2 text-gray-600">Welcome to BizPilot!</p>
    </div>
  )
}

function ChatPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Chat loading...</p>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/signup',
    element: <SignupForm />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPlaceholder />,
      },
      {
        path: 'onboarding',
        element: <URLInput />,
      },
    ],
  },
  {
    path: '/chat/:businessId',
    element: <ChatPlaceholder />,
  },
])

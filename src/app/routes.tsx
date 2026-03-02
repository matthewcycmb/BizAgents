import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { AuthGuard } from '../components/auth/AuthGuard'
import { ConversationProvider } from '../hooks/useConversationContext'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
import { URLInput } from '../components/onboarding/URLInput'
import { Dashboard } from '../components/dashboard/Dashboard'
import { MyBusinessPage } from '../pages/MyBusinessPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />,
    errorElement: <ErrorBoundary><NotFoundPage /></ErrorBoundary>,
  },
  {
    path: '/signup',
    element: <SignupForm />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <ConversationProvider>
          <Layout />
        </ConversationProvider>
      </AuthGuard>
    ),
    errorElement: <ErrorBoundary><NotFoundPage /></ErrorBoundary>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        ),
      },
      {
        path: 'my-business',
        element: (
          <ErrorBoundary>
            <MyBusinessPage />
          </ErrorBoundary>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <ErrorBoundary>
            <URLInput />
          </ErrorBoundary>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

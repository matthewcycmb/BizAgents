import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { AuthGuard } from '../components/auth/AuthGuard'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
import { URLInput } from '../components/onboarding/URLInput'
import { Dashboard } from '../components/dashboard/Dashboard'
import { CustomerChatPage } from '../pages/CustomerChatPage'

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
        element: <Dashboard />,
      },
      {
        path: 'onboarding',
        element: <URLInput />,
      },
    ],
  },
  {
    path: '/chat/:businessId',
    element: <CustomerChatPage />,
  },
])

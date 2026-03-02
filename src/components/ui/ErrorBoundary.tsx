import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bp-bg-main px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-bp-text-primary mb-2">Something went wrong</h2>
            <p className="text-bp-text-secondary mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 rounded-full bg-gradient-to-br from-bp-accent to-bp-accent-dim text-white font-medium hover:opacity-90 transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

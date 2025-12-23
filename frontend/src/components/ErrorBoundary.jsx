import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          backgroundColor: '#f9fafb',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '1rem' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details style={{ marginBottom: '1.5rem', textAlign: 'left', backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>Error Details</summary>
              <pre style={{ fontSize: '0.875rem', color: '#dc2626', overflow: 'auto', marginTop: '0.5rem' }}>
                {this.state.error?.stack || JSON.stringify(this.state.error, null, 2)}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#465fff',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary


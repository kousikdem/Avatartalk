
import { createRoot } from 'react-dom/client'
import { Component } from 'react'
import App from './App.tsx'
import './index.css'

// Error boundary for production
class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          fontFamily: 'system-ui',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '16px' }}>Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Safe DOM manipulation without innerHTML
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: system-ui;';
  
  const title = document.createElement('h1');
  title.style.cssText = 'font-size: 24px; margin-bottom: 16px;';
  title.textContent = 'Failed to load application';
  
  const message = document.createElement('p');
  message.style.cssText = 'color: #666; margin-bottom: 16px;';
  message.textContent = 'Please check your internet connection and refresh.';
  
  const button = document.createElement('button');
  button.style.cssText = 'padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer;';
  button.textContent = 'Refresh Page';
  button.addEventListener('click', () => window.location.reload());
  
  errorDiv.appendChild(title);
  errorDiv.appendChild(message);
  errorDiv.appendChild(button);
  rootElement.appendChild(errorDiv);
}


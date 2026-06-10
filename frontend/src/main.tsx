
import './errorHandler'; // Global error handling
import { createRoot } from 'react-dom/client'
import { Component } from 'react'
import App from './App.tsx'
import './index.css'
import { installRazorpayInterceptor } from './lib/razorpay-interceptor';

// Install Razorpay edge-function interceptor so all Razorpay calls
// transparently route through FastAPI (with demo-mode fallback).
installRazorpayInterceptor();

// Top-level error boundary — catches any uncaught React rendering error.
// For profile pages we auto-redirect to home rather than showing a dead end.
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary] Caught:', error?.message, info?.componentStack?.split('\n')?.[1]);

    // If error is on a profile page, auto-navigate home and reset in 100ms
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isProfileRoute = path.length > 1 && !path.startsWith('/settings') && !path.startsWith('/pricing') && !path.startsWith('/terms') && !path.startsWith('/privacy') && !path.startsWith('/refund');
      if (isProfileRoute) {
        // Don't show the error screen — navigate home and reset the boundary
        window.history.pushState({}, '', '/');
        setTimeout(() => this.setState({ hasError: false }), 100);
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100vh', flexDirection: 'column', fontFamily: 'system-ui',
          padding: '20px', background: '#0f172a', color: '#fff'
        }}>
          <h1 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', marginBottom: '20px', textAlign: 'center', maxWidth: 360 }}>
            An unexpected error occurred. Click below to go back to the home page.
          </p>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              padding: '10px 24px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600
            }}
          >
            Go to Home
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
  // Notify the inline loader in index.html that React has mounted so it can fade out
  if (typeof window !== "undefined" && typeof (window as any).__REACT_MOUNTED__ === "function") {
    (window as any).__REACT_MOUNTED__();
  }
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


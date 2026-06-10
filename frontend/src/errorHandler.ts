// Global error handler for production
//
// Filter list — these errors are NON-FATAL noise from Supabase realtime
// subscriptions (mostly during React StrictMode double-mounts) and should
// never blow away the entire React app or replace the UI with an error screen.
const BENIGN_ERROR_PATTERNS = [
  'postgres_changes',
  'after `subscribe()`',
  'after subscribe()',
  'realtime:',
  'RealtimeChannel',
  'cannot add',
  'WebSocket connection',
  'Failed to construct \'WebSocket\'',
];

function isBenignError(err: unknown): boolean {
  const msg = (err as any)?.message || String(err || '');
  return BENIGN_ERROR_PATTERNS.some(p => msg.includes(p));
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (isBenignError(event.error)) {
      console.warn('[errorHandler] Ignored benign error:', event.error?.message);
      event.preventDefault();
      return;
    }
    console.error('Global error:', event.error);

    // Hide loading screen on error
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.display = 'none';
    }
    document.body.classList.add('app-loaded');

    // Show error message
    const root = document.getElementById('root');
    if (root && root.children.length === 0) {
      root.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom right, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: system-ui, sans-serif;
          padding: 2rem;
          text-align: center;
        ">
          <div style="max-width: 500px;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">App Loading Error</h1>
            <p style="margin-bottom: 1rem; opacity: 0.9;">
              The application failed to initialize. Please try refreshing the page.
            </p>
            <button onclick="location.reload()" style="
              background: white;
              color: #667eea;
              border: none;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
            ">
              Refresh Page
            </button>
            <details style="margin-top: 2rem; text-align: left; font-size: 0.875rem;">
              <summary style="cursor: pointer; opacity: 0.8;">Technical Details</summary>
              <pre style="
                margin-top: 1rem;
                padding: 1rem;
                background: rgba(0,0,0,0.2);
                border-radius: 0.5rem;
                overflow: auto;
                font-size: 0.75rem;
              ">${event.error?.message || 'Unknown error'}\n${event.error?.stack || ''}</pre>
            </details>
          </div>
        </div>
      `;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isBenignError(event.reason)) {
      console.warn('[errorHandler] Ignored benign promise rejection:', (event.reason as any)?.message);
      event.preventDefault();
      return;
    }
    console.error('Unhandled promise rejection:', event.reason);
  });
}

export {};

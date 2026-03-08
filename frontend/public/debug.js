// Debug script for production - Add to index.html in production if issues occur
(function() {
  console.log('=== AvatarTalk.Co Debug Info ===');
  
  // Check environment variables
  console.log('Environment Check:', {
    VITE_SUPABASE_URL: typeof import.meta?.env?.VITE_SUPABASE_URL,
    VITE_SUPABASE_KEY: typeof import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_PROJECT_ID: typeof import.meta?.env?.VITE_SUPABASE_PROJECT_ID,
  });
  
  // Check if Supabase URL exists
  if (!import.meta?.env?.VITE_SUPABASE_URL) {
    console.error('❌ VITE_SUPABASE_URL is missing!');
    console.log('This will cause blank page. Check build environment variables.');
  } else {
    console.log('✅ Supabase URL configured');
  }
  
  // Check root element
  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ Root element not found!');
  } else {
    console.log('✅ Root element exists');
  }
  
  // Check for render errors
  window.addEventListener('error', (e) => {
    console.error('❌ Runtime Error:', e.message, e.filename, e.lineno);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled Promise Rejection:', e.reason);
  });
  
  // Monitor React mounting
  setTimeout(() => {
    const rootHasContent = root && root.children.length > 0;
    if (!rootHasContent) {
      console.error('❌ React did not mount. Check console for errors.');
      console.log('Possible causes:');
      console.log('1. Missing environment variables');
      console.log('2. JavaScript error during initialization');
      console.log('3. Supabase client failed to initialize');
    } else {
      console.log('✅ React mounted successfully');
    }
  }, 3000);
  
  console.log('=== End Debug Info ===');
})();

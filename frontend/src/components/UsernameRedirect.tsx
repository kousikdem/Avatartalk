import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ProfilePage from './ProfilePage';

/**
 * Reserved paths that should NEVER be interpreted as usernames.
 * If a visitor navigates to /auth, /buy-tokens, /admin, etc. they should
 * either redirect to the home page (where the auth modal opens) or to
 * the real route — NOT show a "Profile not found" screen.
 *
 * This catches stray links / typos and prevents the dreaded
 * "Profile temporarily unavailable" message from showing for non-profiles.
 */
const RESERVED_PATHS = new Set<string>([
  'auth',
  'login',
  'logout',
  'signup',
  'sign-in',
  'sign-up',
  'register',
  'settings',
  'dashboard',
  'admin',
  'api',
  'app',
  'static',
  'assets',
  'public',
  'buy-tokens',
  'tokens',
  'checkout',
  'cart',
  'undefined',
  'null',
  'home',
  'index',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
]);

const UsernameRedirect: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  // Defensive: never treat reserved paths as usernames.
  if (!username || RESERVED_PATHS.has(username.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  // Usernames must be sane characters only. If the path contains weird chars
  // (dots, slashes, query-like fragments) bounce to home.
  if (!/^[A-Za-z0-9_.-]{1,50}$/.test(username)) {
    return <Navigate to="/" replace />;
  }

  return <ProfilePage />;
};

export default UsernameRedirect;

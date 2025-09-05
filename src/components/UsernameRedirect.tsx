import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const UsernameRedirect: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      // Redirect from /:username/ to /profile/:username/
      navigate(`/profile/${username}`, { replace: true });
    }
  }, [username, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/80">Redirecting to profile...</p>
      </div>
    </div>
  );
};

export default UsernameRedirect;
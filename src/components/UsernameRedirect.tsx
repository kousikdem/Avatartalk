import React from 'react';
import { useParams } from 'react-router-dom';
import ProfilePage from './ProfilePage';

const UsernameRedirect: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  // Directly render the profile page for the username
  return <ProfilePage />;
};

export default UsernameRedirect;
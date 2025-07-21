import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  console.log('Navbar user:', user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex space-x-4 items-center">
            <Link to="/" className="text-blue-600 hover:underline font-semibold">Home</Link>
            <Link to="/profile" className="text-blue-600 hover:underline font-semibold">Profile</Link>
            <Link to="/profile/edit" className="text-blue-600 hover:underline font-semibold">Edit Profile</Link>
            <Link to="/posts/create" className="text-blue-600 hover:underline font-semibold">Create Post</Link>
            <Link to="/jobs" className="text-blue-600 hover:underline font-semibold">Jobs</Link>
            <Link to="/messages" className="text-blue-600 hover:underline font-semibold">Messages</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                  onError={e => (e.currentTarget.src = '/default-avatar.png')}
                  style={{ marginRight: '0.5rem' }}
                />
                <span className="font-medium text-gray-700">{user.name || user.email}</span>
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
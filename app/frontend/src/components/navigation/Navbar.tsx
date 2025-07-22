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
    <nav className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex space-x-4 items-center">
            <Link to="/" className="text-white font-bold hover:bg-white/20 px-3 py-2 rounded transition">Home</Link>
            <Link to="/profile" className="text-white font-bold hover:bg-white/20 px-3 py-2 rounded transition">Profile</Link>
            <Link to="/profile/edit" className="text-white font-bold hover:bg-white/20 px-3 py-2 rounded transition">Edit Profile</Link>
            <Link to="/posts/create" className="text-white font-bold hover:bg-white/20 px-3 py-2 rounded transition">Create Post</Link>
            <Link to="/jobs" className="text-white font-bold hover:bg-white/20 px-3 py-2 rounded transition">Jobs</Link>
            <Link to="/messages" className="text-white font-bold hover:bg-white/20 px-3 py-2 rounded transition">Messages</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <img
                  src={user.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : '/default-avatar.png'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border-4 border-yellow-300 shadow-md"
                  onError={e => (e.currentTarget.src = '/default-avatar.png')}
                  style={{ marginRight: '0.5rem' }}
                />
                <span className="font-semibold text-white drop-shadow">{user.name || user.email}</span>
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-1 rounded-full font-bold shadow hover:scale-105 active:scale-95 transition"
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
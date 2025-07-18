import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

const ProfileHome: React.FC = () => {
  const { profile, loading, error, refreshProfile, clearError } = useProfile();
  const navigate = useNavigate();

  if (loading && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <ErrorMessage 
          message={error} 
          onRetry={refreshProfile}
          onDismiss={clearError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Gradient Header */}
          <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-500 flex flex-col items-center justify-end relative">
            <button
              className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 translate-y-16">
              <img
                src={profile?.profile_image_url || profile?.profile_thumbnail_url || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            </div>
          </div>
          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
              <div className="text-gray-600 mt-1">{profile?.headline}</div>
              <div className="text-gray-500 flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>{profile?.location}</span>
              </div>
            </div>
            {/* About Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
              <div className="bg-white rounded-md p-4 border text-gray-700 shadow-sm">
                {profile?.summary || <span className="text-gray-400">No about info yet.</span>}
              </div>
            </div>
            {/* Skills Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills || []).length > 0 ? (
                  profile.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{skill}</span>
                  ))
                ) : (
                  <span className="text-gray-400">No skills added yet.</span>
                )}
              </div>
            </div>
            {/* Education Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Education</h2>
              <div className="bg-white rounded-md p-4 border text-gray-700 shadow-sm">
                <div className="font-semibold">B.E - Electronics and Communication Engineering</div>
                <div className="text-sm text-gray-500">Anna University</div>
                <div className="text-xs text-gray-400">2019 - 2023</div>
              </div>
            </div>
            {/* Contact Info, Languages, Connections, etc. */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-md p-4 border shadow-sm">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="text-sm text-gray-700">{profile?.email || 'your.email@example.com'}</div>
                <div className="text-sm text-gray-700 mt-1">+91 98765 43210</div>
                <div className="text-sm text-gray-700 mt-1">{profile?.location || 'Your City, Country'}</div>
              </div>
              <div className="bg-white rounded-md p-4 border shadow-sm">
                <h3 className="font-semibold mb-2">Languages</h3>
                <div className="text-sm text-gray-700">English (Professional)</div>
                <div className="text-sm text-gray-700">Hindi (Conversational)</div>
                <div className="text-sm text-gray-700">Tamil (Native)</div>
              </div>
              <div className="bg-white rounded-md p-4 border shadow-sm">
                <h3 className="font-semibold mb-2">Connections</h3>
                <div className="text-2xl font-bold text-blue-700">200+</div>
                <div className="text-xs text-gray-500">25 Mutual</div>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h2>
              <div className="bg-white rounded-md p-4 border text-gray-700 shadow-sm">
                <span className="text-gray-400">Show more activity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHome; 